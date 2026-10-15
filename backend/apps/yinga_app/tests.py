from django.test import TestCase
from rest_framework.test import APIClient
from unittest.mock import patch


class HealthCheckEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_returns_healthy_when_services_are_up(self):
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'healthy')
        self.assertEqual(response.data['database'], 'connected')
        self.assertEqual(response.data['cache'], 'connected')
        self.assertIsNone(response.data['errors'])

    def test_root_health_check_alias_returns_200(self):
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'healthy')

    @patch('apps.yinga_app.views.connection.ensure_connection')
    def test_health_check_fails_when_database_is_down(self, mock_db):
        mock_db.side_effect = Exception('Database unreachable')
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data['status'], 'unhealthy')
        self.assertEqual(response.data['database'], 'disconnected')
        self.assertTrue(any('Database unreachable' in err for err in response.data['errors']))

    @patch('apps.yinga_app.views.cache.get')
    def test_health_check_fails_when_cache_is_down(self, mock_cache_get):
        mock_cache_get.return_value = None
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data['status'], 'unhealthy')
        self.assertEqual(response.data['cache'], 'disconnected')


class SupportMessageEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        from django.contrib.auth import get_user_model
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(
            username='student_jean',
            email='student@example.com',
            first_name='Jean',
            last_name='Dupont',
            password='TestPassword123!',
            role='STUDENT'
        )
        self.staff_user = self.user_model.objects.create_user(
            username='admin_user',
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            password='TestPassword123!',
            role='ADMIN',
            is_staff=True
        )

    def test_anonymous_user_can_submit_support_message(self):
        payload = {
            'name': 'Visiteur Anonyme',
            'email': 'visiteur@example.com',
            'subject': 'Question sur le paiement M-Pesa',
            'category': 'payment',
            'message': 'Est-ce que M-Pesa RDC est supporté ?'
        }
        response = self.client.post('/api/support/', data=payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['name'], 'Visiteur Anonyme')
        self.assertEqual(response.data['email'], 'visiteur@example.com')
        self.assertEqual(response.data['category'], 'payment')
        self.assertIsNone(response.data['user'])

    def test_authenticated_user_associates_with_message(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'name': 'Jean Dupont',
            'email': 'student@example.com',
            'subject': 'Problème certificat',
            'category': 'certificate',
            'message': 'Je ne vois pas mon certificat.'
        }
        response = self.client.post('/api/support/', data=payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['user'], self.user.id)

    def test_validation_fails_on_missing_required_fields(self):
        payload = {
            'name': '',
            'email': 'not-an-email',
            'message': '   '
        }
        response = self.client.post('/api/support/', data=payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('name', response.data)
        self.assertIn('email', response.data)
        self.assertIn('message', response.data)

    def test_anonymous_user_cannot_list_support_messages(self):
        response = self.client.get('/api/support/')
        self.assertEqual(response.status_code, 401)

    def test_staff_user_can_list_all_support_messages(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/support/')
        self.assertEqual(response.status_code, 200)

