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
