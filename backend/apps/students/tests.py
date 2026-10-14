from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from apps.courses.models import Course, Lesson
from apps.students.models import Enrollment


class EnrollmentAccessTests(TestCase):
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
		self.free_course = Course.objects.create(
			instructor=instructor,
			title='Free course',
			category='Development',
			price='0.00',
			status='PUBLISHED',
		)
		self.paid_course = Course.objects.create(
			instructor=instructor,
			title='Paid course',
			category='Development',
			price='10.00',
			status='PUBLISHED',
		)
		self.client = APIClient()
		self.client.force_authenticate(self.student)

	def test_free_course_checkout_creates_active_enrollment(self):
		response = self.client.post(
			'/api/enrollments/checkout/',
			{'course_id': str(self.free_course.id)},
			format='json',
		)

		self.assertEqual(response.status_code, 201)
		enrollment = Enrollment.objects.get(student=self.student, course=self.free_course)
		self.assertEqual(enrollment.status, 'ACTIVE')

	def test_paid_course_checkout_requires_payment(self):
		response = self.client.post(
			'/api/enrollments/checkout/',
			{'course_id': str(self.paid_course.id)},
			format='json',
		)

		self.assertEqual(response.status_code, 402)
		self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.paid_course).exists())

	def test_direct_paid_enrollment_is_rejected_and_status_cannot_be_forged(self):
		paid_response = self.client.post(
			'/api/enrollments/',
			{'course': str(self.paid_course.id), 'status': 'COMPLETED'},
			format='json',
		)
		free_response = self.client.post(
			'/api/enrollments/',
			{'course': str(self.free_course.id), 'status': 'COMPLETED'},
			format='json',
		)

		self.assertEqual(paid_response.status_code, 400)
		self.assertEqual(free_response.status_code, 201)
		free_enrollment = Enrollment.objects.get(student=self.student, course=self.free_course)
		self.assertEqual(free_enrollment.status, 'ACTIVE')
		self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.paid_course).exists())

		update_response = self.client.patch(
			f'/api/enrollments/{free_enrollment.id}/',
			{'course': str(self.paid_course.id)},
			format='json',
		)
		self.assertEqual(update_response.status_code, 400)


class CertificateEligibilityTests(TestCase):
	def setUp(self):
		user_model = get_user_model()
		self.student = user_model.objects.create_user(
			username='certificate-student',
			email='certificate-student@example.com',
			password='test-password',
		)
		self.other_student = user_model.objects.create_user(
			username='other-certificate-student',
			email='other-certificate-student@example.com',
			password='test-password',
		)
		instructor = user_model.objects.create_user(
			username='certificate-instructor',
			email='certificate-instructor@example.com',
			password='test-password',
			role='INSTRUCTOR',
		)
		self.course = Course.objects.create(
			instructor=instructor,
			title='Certificate Course',
			category='Development',
			price='0.00',
			course_includes=[],
		)
		self.lessons = [
			Lesson.objects.create(course=self.course, title='Lesson One'),
			Lesson.objects.create(course=self.course, title='Lesson Two'),
		]
		self.enrollment = Enrollment.objects.create(student=self.student, course=self.course)
		self.client = APIClient()
		self.client.force_authenticate(self.student)

	def test_incomplete_course_cannot_download_certificate(self):
		response = self.client.get(
			'/api/enrollments/certificate/',
			{'course_id': str(self.course.id)},
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.data['error'], 'Course not completed')

	def test_completing_all_lessons_enables_pdf_without_optional_include(self):
		first_response = self.client.post(
			'/api/progress/update_progress/',
			{'lesson_id': str(self.lessons[0].id), 'is_completed': True},
			format='json',
		)
		self.enrollment.refresh_from_db()
		self.assertFalse(first_response.data['course_completed'])
		self.assertEqual(self.enrollment.status, 'ACTIVE')

		last_response = self.client.post(
			'/api/progress/update_progress/',
			{'lesson_id': str(self.lessons[1].id), 'is_completed': True},
			format='json',
		)
		self.enrollment.refresh_from_db()
		self.assertTrue(last_response.data['course_completed'])
		self.assertEqual(self.enrollment.status, 'COMPLETED')

		certificate_response = self.client.get(
			'/api/enrollments/certificate/',
			{'course_id': str(self.course.id)},
		)
		self.assertEqual(certificate_response.status_code, 200)
		self.assertEqual(certificate_response['Content-Type'], 'application/pdf')
		self.assertTrue(certificate_response.content.startswith(b'%PDF'))

	def test_certificate_is_not_available_to_another_student(self):
		self.enrollment.status = 'COMPLETED'
		self.enrollment.save(update_fields=['status'])
		self.client.force_authenticate(self.other_student)

		response = self.client.get(
			'/api/enrollments/certificate/',
			{'course_id': str(self.course.id)},
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.data['error'], 'Not enrolled')

	def test_previously_completed_enrollment_retains_certificate_access(self):
		self.enrollment.status = 'COMPLETED'
		self.enrollment.save(update_fields=['status'])

		# Simulate new session / re-authenticated client
		fresh_client = APIClient()
		fresh_client.force_authenticate(self.student)

		response = fresh_client.get(
			'/api/enrollments/certificate/',
			{'course_id': str(self.course.id)},
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response['Content-Type'], 'application/pdf')
		self.assertTrue(response.content.startswith(b'%PDF'))

