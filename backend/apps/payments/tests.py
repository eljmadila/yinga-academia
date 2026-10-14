from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from unittest.mock import patch
from apps.courses.models import Course
from apps.payments.models import Order, Payment
from apps.payments.mpesa import MpesaClient
from apps.students.models import Enrollment


class MissingPaymentCredentialsTests(TestCase):
	def setUp(self):
		cache.clear()
		user_model = get_user_model()
		self.student = user_model.objects.create_user(
			username='student',
			email='student@example.com',
			password='test-password',
		)
		instructor = user_model.objects.create_user(
			username='instructor',
			email='instructor@example.com',
			password='test-password',
			role='INSTRUCTOR',
		)
		self.course = Course.objects.create(
			instructor=instructor,
			title='Paid course',
			category='Development',
			price='10.00',
			status='PUBLISHED',
		)
		self.client = APIClient()
		self.client.force_authenticate(self.student)

	@override_settings(
		MPESA_CONSUMER_KEY='',
		MPESA_CONSUMER_SECRET='',
		MPESA_SHORTCODE='',
		MPESA_PASSKEY='',
	)
	def test_missing_mpesa_credentials_do_not_create_paid_access(self):
		response = self.client.post(
			'/api/payments/mpesa/stk-push/',
			{
				'course_id': str(self.course.id),
				'phone_number': '254700000000',
				'idempotency_key': 'missing-credentials-key',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 503)
		self.assertEqual(Order.objects.count(), 0)
		self.assertEqual(Payment.objects.count(), 0)

	@override_settings(
		MPESA_CONSUMER_KEY='test-key',
		MPESA_CONSUMER_SECRET='test-secret',
		MPESA_SHORTCODE='123456',
		MPESA_PASSKEY='test-passkey',
	)
	@patch('apps.payments.mpesa.requests.post')
	@patch('apps.payments.mpesa.requests.get')
	def test_mpesa_provider_requests_use_bounded_timeouts(self, get_request, post_request):
		get_request.return_value.status_code = 200
		get_request.return_value.json.return_value = {'access_token': 'test-token'}
		post_request.return_value.status_code = 200
		post_request.return_value.json.return_value = {
			'CheckoutRequestID': 'checkout-id',
			'MerchantRequestID': 'merchant-id',
		}
		client = MpesaClient()

		client.stk_push('254700000000', 10, 'order-1', 'Course', 'https://api.example.test/callback')
		client.query_stk_status('checkout-id')

		self.assertEqual(get_request.call_args.kwargs['timeout'], (5, 10))
		self.assertEqual(post_request.call_args_list[0].kwargs['timeout'], (5, 30))
		self.assertEqual(post_request.call_args_list[1].kwargs['timeout'], (5, 15))
		self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.course).exists())

	def test_free_course_does_not_start_mpesa_payment(self):
		free_course = Course.objects.create(
			instructor=self.course.instructor,
			title='Free course',
			category='Development',
			price='0.00',
			status='PUBLISHED',
		)
		response = self.client.post(
			'/api/payments/mpesa/stk-push/',
			{
				'course_id': str(free_course.id),
				'phone_number': '254700000000',
				'idempotency_key': 'free-course-key',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(Order.objects.count(), 0)
		self.assertEqual(Payment.objects.count(), 0)

	@override_settings(
		MPESA_CONSUMER_KEY='test-key',
		MPESA_CONSUMER_SECRET='test-secret',
		MPESA_SHORTCODE='123456',
		MPESA_PASSKEY='test-passkey',
		BACKEND_URL='https://api.example.test',
	)
	@patch('apps.payments.views.MpesaClient')
	def test_repeated_mpesa_request_does_not_create_a_second_charge(self, mpesa_client):
		mpesa_client.return_value.stk_push.return_value = {
			'CheckoutRequestID': 'checkout-id',
			'MerchantRequestID': 'merchant-id',
		}
		payload = {
			'course_id': str(self.course.id),
			'phone_number': '254700000000',
			'idempotency_key': 'retry-stable-key',
		}

		first_response = self.client.post('/api/payments/mpesa/stk-push/', payload, format='json')
		retry_response = self.client.post('/api/payments/mpesa/stk-push/', payload, format='json')

		self.assertEqual(first_response.status_code, 200)
		self.assertEqual(retry_response.status_code, 202)
		self.assertEqual(first_response.data['order_id'], retry_response.data['order_id'])
		self.assertEqual(Order.objects.count(), 1)
		self.assertEqual(Payment.objects.count(), 1)
		self.assertEqual(mpesa_client.return_value.stk_push.call_count, 1)

	@override_settings(
		MPESA_CONSUMER_KEY='test-key',
		MPESA_CONSUMER_SECRET='test-secret',
		MPESA_SHORTCODE='123456',
		MPESA_PASSKEY='test-passkey',
		BACKEND_URL='',
	)
	@patch('apps.payments.views.MpesaClient')
	def test_missing_callback_url_does_not_create_order_or_payment(self, mpesa_client):
		response = self.client.post(
			'/api/payments/mpesa/stk-push/',
			{
				'course_id': str(self.course.id),
				'phone_number': '254700000000',
				'idempotency_key': 'missing-callback-url-key',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 503)
		self.assertEqual(Order.objects.count(), 0)
		self.assertEqual(Payment.objects.count(), 0)
		mpesa_client.return_value.stk_push.assert_not_called()

	@override_settings(
		MPESA_CONSUMER_KEY='test-key',
		MPESA_CONSUMER_SECRET='test-secret',
		MPESA_SHORTCODE='123456',
		MPESA_PASSKEY='test-passkey',
		BACKEND_URL='https://api.example.test',
	)
	@patch('apps.payments.views.MpesaClient')
	def test_failed_mpesa_initiation_marks_order_failed_and_allows_new_attempt(self, mpesa_client):
		mpesa_client.return_value.stk_push.side_effect = RuntimeError('provider unavailable')
		payload = {
			'course_id': str(self.course.id),
			'phone_number': '254700000000',
			'idempotency_key': 'failed-attempt-key',
		}

		response = self.client.post('/api/payments/mpesa/stk-push/', payload, format='json')
		retry_response = self.client.post('/api/payments/mpesa/stk-push/', payload, format='json')

		self.assertEqual(response.status_code, 503)
		self.assertEqual(retry_response.status_code, 409)
		self.assertEqual(Order.objects.get().status, 'FAILED')
		self.assertEqual(Payment.objects.get().status, 'FAILED')
		self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.course).exists())

	@override_settings(
		MPESA_CONSUMER_KEY='test-key',
		MPESA_CONSUMER_SECRET='test-secret',
		MPESA_SHORTCODE='123456',
		MPESA_PASSKEY='test-passkey',
		BACKEND_URL='https://api.example.test',
	)
	@patch('apps.payments.views.MpesaClient')
	def test_mpesa_initiation_is_rate_limited(self, mpesa_client):
		mpesa_client.return_value.stk_push.return_value = {
			'CheckoutRequestID': 'checkout-id',
			'MerchantRequestID': 'merchant-id',
		}
		responses = []
		for attempt in range(4):
			responses.append(self.client.post(
				'/api/payments/mpesa/stk-push/',
				{
					'course_id': str(self.course.id),
					'phone_number': '254700000000',
					'idempotency_key': f'rate-limit-key-{attempt}',
				},
				format='json',
			))

		self.assertTrue(all(response.status_code == 200 for response in responses[:3]))
		self.assertEqual(responses[3].status_code, 429)
		self.assertEqual(mpesa_client.return_value.stk_push.call_count, 3)

	@override_settings(FLUTTERWAVE_SECRET_KEY='')
	def test_missing_flutterwave_credentials_do_not_create_paid_access(self):
		response = self.client.post(
			'/api/payments/flutterwave/checkout/',
			{'course_id': str(self.course.id)},
			format='json',
		)

		self.assertEqual(response.status_code, 503)
		self.assertEqual(Order.objects.count(), 0)
		self.assertEqual(Payment.objects.count(), 0)
		self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.course).exists())


class MpesaCallbackVerificationTests(TestCase):
	def setUp(self):
		user_model = get_user_model()
		self.student = user_model.objects.create_user(
			username='student',
			email='student@example.com',
			password='test-password',
		)
		instructor = user_model.objects.create_user(
			username='instructor',
			email='instructor@example.com',
			password='test-password',
			role='INSTRUCTOR',
		)
		self.course = Course.objects.create(
			instructor=instructor,
			title='Paid course',
			category='Development',
			price='10.00',
			status='PUBLISHED',
		)
		self.order = Order.objects.create(
			student=self.student,
			course=self.course,
			amount='10.00',
			status='PENDING',
		)
		self.payment = Payment.objects.create(
			order=self.order,
			payment_method='MPESA',
			payment_reference='tx-ref',
			transaction_id='checkout-id',
			amount='10.00',
			currency='KES',
			status='PENDING',
			metadata={'stk_push_response': {'MerchantRequestID': 'merchant-id'}},
		)
		self.callback = {
			'Body': {
				'stkCallback': {
					'MerchantRequestID': 'merchant-id',
					'CheckoutRequestID': 'checkout-id',
					'ResultCode': 0,
					'ResultDesc': 'The service request is processed successfully.',
					'CallbackMetadata': {
						'Item': [{'Name': 'Amount', 'Value': 10}],
					},
				},
			},
		}
		self.client = APIClient()

	def test_order_status_is_authoritative_and_private_to_buyer(self):
		self.client.force_authenticate(self.student)
		response = self.client.get(f'/api/payments/orders/{self.order.id}/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['status'], 'PENDING')
		self.assertEqual(response.data['payment_status'], 'PENDING')

		other_student = get_user_model().objects.create_user(
			username='other-student',
			email='other@example.com',
			password='test-password',
		)
		self.client.force_authenticate(other_student)
		forbidden_response = self.client.get(f'/api/payments/orders/{self.order.id}/')

		self.assertEqual(forbidden_response.status_code, 404)

	@patch('apps.payments.views.MpesaClient')
	def test_successful_payment_is_confirmed_and_callback_is_idempotent(self, mpesa_client):
		mpesa_client.return_value.query_stk_status.return_value = {
			'CheckoutRequestID': 'checkout-id',
			'ResultCode': '0',
		}

		response = self.client.post('/api/payments/mpesa/webhook/', self.callback, format='json')
		duplicate_response = self.client.post('/api/payments/mpesa/webhook/', self.callback, format='json')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(duplicate_response.status_code, 200)
		self.assertEqual(mpesa_client.return_value.query_stk_status.call_count, 1)
		self.payment.refresh_from_db()
		self.order.refresh_from_db()
		self.assertEqual(self.payment.status, 'SUCCESSFUL')
		self.assertEqual(self.order.status, 'COMPLETED')
		self.assertTrue(Enrollment.objects.filter(student=self.student, course=self.course).exists())

	@patch('apps.payments.views.MpesaClient')
	def test_unverified_callback_does_not_grant_course_access(self, mpesa_client):
		mpesa_client.return_value.query_stk_status.return_value = {
			'CheckoutRequestID': 'checkout-id',
			'ResultCode': '1032',
		}

		response = self.client.post('/api/payments/mpesa/webhook/', self.callback, format='json')

		self.assertEqual(response.status_code, 503)
		self.payment.refresh_from_db()
		self.order.refresh_from_db()
		self.assertEqual(self.payment.status, 'PENDING')
		self.assertEqual(self.order.status, 'PENDING')
		self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.course).exists())

	@patch('apps.payments.views.MpesaClient')
	def test_verified_failed_callback_marks_order_failed_without_enrollment(self, mpesa_client):
		mpesa_client.return_value.query_stk_status.return_value = {
			'CheckoutRequestID': 'checkout-id',
			'ResultCode': '1032',
		}
		callback = {
			'Body': {
				'stkCallback': {
					'MerchantRequestID': 'merchant-id',
					'CheckoutRequestID': 'checkout-id',
					'ResultCode': 1032,
					'ResultDesc': 'Request cancelled by user',
				},
			},
		}

		response = self.client.post('/api/payments/mpesa/webhook/', callback, format='json')

		self.assertEqual(response.status_code, 200)
		self.payment.refresh_from_db()
		self.order.refresh_from_db()
		self.assertEqual(self.payment.status, 'FAILED')
		self.assertEqual(self.order.status, 'FAILED')
		self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.course).exists())

	@patch('apps.payments.views.MpesaClient')
	def test_callback_amount_must_match_the_order(self, mpesa_client):
		mpesa_client.return_value.query_stk_status.return_value = {
			'CheckoutRequestID': 'checkout-id',
			'ResultCode': '0',
		}
		self.callback['Body']['stkCallback']['CallbackMetadata']['Item'][0]['Value'] = 9

		response = self.client.post('/api/payments/mpesa/webhook/', self.callback, format='json')

		self.assertEqual(response.status_code, 400)
		self.payment.refresh_from_db()
		self.order.refresh_from_db()
		self.assertEqual(self.payment.status, 'PENDING')
		self.assertEqual(self.order.status, 'PENDING')
		self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.course).exists())

