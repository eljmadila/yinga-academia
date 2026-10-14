from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from apps.courses.models import Course, Lesson
from apps.progress.models import Progress
from apps.students.models import Enrollment


class EnrollmentProgressAccessTests(TestCase):
	def setUp(self):
		user_model = get_user_model()
		self.student = user_model.objects.create_user(
			username='progress-student',
			email='progress-student@example.com',
			password='test-password',
		)
		instructor = user_model.objects.create_user(
			username='progress-instructor',
			email='progress-instructor@example.com',
			password='test-password',
			role='INSTRUCTOR',
		)
		self.course = Course.objects.create(
			instructor=instructor,
			title='Paid course',
			category='Development',
			price='10.00',
		)
		self.lesson = Lesson.objects.create(course=self.course, title='Locked lesson')
		self.client = APIClient()
		self.client.force_authenticate(self.student)

	def test_update_progress_requires_enrollment(self):
		response = self.client.post(
			'/api/progress/update_progress/',
			{'lesson_id': str(self.lesson.id), 'is_completed': True},
			format='json',
		)

		self.assertEqual(response.status_code, 403)
		self.assertEqual(Progress.objects.count(), 0)
		self.assertEqual(Enrollment.objects.count(), 0)

	def test_direct_progress_create_requires_enrollment(self):
		response = self.client.post(
			'/api/progress/',
			{'lesson': str(self.lesson.id), 'is_completed': True},
			format='json',
		)

		self.assertEqual(response.status_code, 403)
		self.assertEqual(Progress.objects.count(), 0)

	def test_enrolled_student_can_save_and_restore_progress(self):
		Enrollment.objects.create(student=self.student, course=self.course, status='ACTIVE')
		response = self.client.post(
			'/api/progress/update_progress/',
			{'lesson_id': str(self.lesson.id), 'current_timecode': 42.5, 'is_completed': False},
			format='json',
		)
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertEqual(data['status'], 'success')
		self.assertFalse(data['is_completed'])
		self.assertFalse(data['course_completed'])

		progress = Progress.objects.get(student=self.student, lesson=self.lesson)
		self.assertEqual(progress.current_timecode, 42.5)
		self.assertFalse(progress.is_completed)

		# Fetch by course (include_incomplete)
		res_by_course = self.client.get(
			f'/api/progress/by_course/?course_id={self.course.id}&include_incomplete=1'
		)
		self.assertEqual(res_by_course.status_code, 200)
		by_course_data = res_by_course.json()
		self.assertEqual(len(by_course_data), 1)
		self.assertEqual(by_course_data[0]['current_timecode'], 42.5)

	def test_completing_all_lessons_marks_enrollment_completed(self):
		enrollment = Enrollment.objects.create(student=self.student, course=self.course, status='ACTIVE')
		lesson2 = Lesson.objects.create(course=self.course, title='Lesson 2')

		# Complete lesson 1
		res1 = self.client.post(
			'/api/progress/update_progress/',
			{'lesson_id': str(self.lesson.id), 'is_completed': True},
			format='json',
		)
		self.assertEqual(res1.status_code, 200)
		self.assertFalse(res1.json()['course_completed'])
		enrollment.refresh_from_db()
		self.assertEqual(enrollment.status, 'ACTIVE')

		# Complete lesson 2
		res2 = self.client.post(
			'/api/progress/update_progress/',
			{'lesson_id': str(lesson2.id), 'is_completed': True},
			format='json',
		)
		self.assertEqual(res2.status_code, 200)
		self.assertTrue(res2.json()['course_completed'])
		enrollment.refresh_from_db()
		self.assertEqual(enrollment.status, 'COMPLETED')

	def test_completed_enrollment_can_still_update_progress(self):
		Enrollment.objects.create(student=self.student, course=self.course, status='COMPLETED')
		response = self.client.post(
			'/api/progress/update_progress/',
			{'lesson_id': str(self.lesson.id), 'current_timecode': 120.0},
			format='json',
		)
		self.assertEqual(response.status_code, 200)
		progress = Progress.objects.get(student=self.student, lesson=self.lesson)
		self.assertEqual(progress.current_timecode, 120.0)

