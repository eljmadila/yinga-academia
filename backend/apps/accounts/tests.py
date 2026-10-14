import re
import io
from urllib.parse import parse_qs, urlparse

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from apps.accounts.serializers import UserSerializer



class PasswordResetFlowTests(TestCase):
	def setUp(self):
		cache.clear()
		self.user = get_user_model().objects.create_user(
			email="learner@example.com",
			username="learner",
			password="old-password-123",
		)
		self.client = APIClient()

	@override_settings(
		EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
		FRONTEND_URL="http://localhost:3000",
	)
	def test_password_reset_email_link_updates_password(self):
		response = self.client.post(
			reverse("password_reset"),
			{"email": self.user.email},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(mail.outbox), 1)
		reset_link = re.search(
			r"/api/auth/password/reset/confirm/([^/?\s]+)/([^/?\s]+)/",
			mail.outbox[0].body,
		)
		self.assertIsNotNone(reset_link)
		uid, token = reset_link.groups()

		link_response = self.client.get(
			reverse("password_reset_confirm", args=[uid, token])
		)
		self.assertEqual(link_response.status_code, 302)
		reset_query = parse_qs(urlparse(link_response.url).query)
		self.assertEqual(reset_query["uid"], [uid])
		self.assertEqual(reset_query["token"], [token])

		confirm_response = self.client.post(
			reverse("password_reset_confirm_api"),
			{
				"uid": uid,
				"token": token,
				"new_password1": "new-password-456",
				"new_password2": "new-password-456",
			},
			format="json",
		)

		self.assertEqual(confirm_response.status_code, 200)
		self.user.refresh_from_db()
		self.assertTrue(self.user.check_password("new-password-456"))


class SensitiveEndpointThrottleTests(TestCase):
	def setUp(self):
		cache.clear()
		self.client = APIClient()

	def test_login_is_rate_limited(self):
		payload = {'email': 'unknown@example.com', 'password': 'incorrect'}
		responses = [
			self.client.post('/api/auth/login/', payload, format='json')
			for _ in range(6)
		]

		self.assertTrue(all(response.status_code != 429 for response in responses[:5]))
		self.assertEqual(responses[5].status_code, 429)

	@override_settings(
		EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
	)
	def test_password_reset_is_rate_limited(self):
		payload = {'email': 'unknown@example.com'}
		responses = [
			self.client.post('/api/auth/password/reset/', payload, format='json')
			for _ in range(4)
		]

		self.assertTrue(all(response.status_code == 200 for response in responses[:3]))
		self.assertEqual(responses[3].status_code, 429)

	def test_registration_is_rate_limited(self):
		responses = [
			self.client.post('/api/auth/register/', {}, format='json')
			for _ in range(4)
		]

		self.assertTrue(all(response.status_code != 429 for response in responses[:3]))
		self.assertEqual(responses[3].status_code, 429)

	def test_admin_requires_authentication(self):
		response = self.client.get('/admin/')

		self.assertEqual(response.status_code, 302)
		self.assertTrue(response.url.startswith('/admin/login/'))


class AvatarUploadValidationTests(TestCase):
	@override_settings(MAX_AVATAR_UPLOAD_BYTES=1)
	def test_avatar_size_is_limited(self):
		image_data = io.BytesIO()
		Image.new('RGB', (1, 1)).save(image_data, format='PNG')
		serializer = UserSerializer(data={
			'avatar': SimpleUploadedFile('avatar.png', image_data.getvalue(), content_type='image/png'),
		}, partial=True)

		self.assertFalse(serializer.is_valid())
		self.assertIn('avatar', serializer.errors)

	@override_settings(MAX_IMAGE_DIMENSION=1)
	def test_avatar_dimensions_are_limited(self):
		image_data = io.BytesIO()
		Image.new('RGB', (2, 1)).save(image_data, format='PNG')
		serializer = UserSerializer(data={
			'avatar': SimpleUploadedFile('avatar.png', image_data.getvalue(), content_type='image/png'),
		}, partial=True)

		self.assertFalse(serializer.is_valid())
		self.assertIn('avatar', serializer.errors)
