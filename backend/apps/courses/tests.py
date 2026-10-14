from django.test import TestCase
import os
import io
import tempfile
from uuid import uuid4

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.test import RequestFactory
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.students.models import Enrollment
from apps.courses.media_views import _can_access_video, serve_media_with_range
from apps.courses.models import Course, Module, Lesson, VideoMedia
from apps.courses.serializers import CourseSerializer, LessonSerializer
from PIL import Image


class CourseStructureModelsTest(TestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            email='instructor@example.com',
            username='instructor',
            password='testpass123',
            role='INSTRUCTOR',
        )
        self.course = Course.objects.create(
            instructor=self.instructor,
            title='Test Course',
            category='Development',
            price=49.99,
            description='A sample course',
            is_published=True,
        )

    def test_module_and_video_media_can_be_created(self):
        module = Module.objects.create(
            course=self.course,
            title='Module 1',
            description='Intro module',
            order=1,
        )

        lesson = Lesson.objects.create(
            course=self.course,
            module=module,
            title='Welcome lesson',
            content='Lesson description',
            order=1,
            duration_minutes=10,
        )

        video = VideoMedia.objects.create(
            lesson=lesson,
            title='Introduction video',
            video_url='https://cdn.example.com/video.mp4',
            file_size=2048,
            duration_seconds=600,
            order=1,
        )

        self.assertEqual(module.course, self.course)
        self.assertEqual(lesson.module, module)
        self.assertEqual(video.lesson, lesson)
        self.assertTrue(str(video).startswith('Introduction video'))

    def test_course_status_is_tracked_by_model(self):
        published_course = Course.objects.create(
            instructor=self.instructor,
            title='Published Course',
            category='Development',
            price=79.99,
            description='A published course',
            status='PUBLISHED',
        )

        self.assertEqual(published_course.status, 'PUBLISHED')
        self.assertTrue(published_course.is_published)
        self.assertEqual(Course.STATUS_CHOICES[0][0], 'DRAFT')

    def test_course_serializer_supports_nested_modules_and_lessons(self):
        payload = {
            'title': 'Nested Course',
            'category': 'Development',
            'price': '99.00',
            'description': 'A course built with modules',
            'status': 'DRAFT',
            'modules': [
                {
                    'title': 'Module 1',
                    'order': 1,
                    'lessons': [
                        {
                            'title': 'Lesson 1',
                            'content': 'Intro content',
                            'order': 1,
                            'duration_minutes': 10,
                        }
                    ],
                }
            ],
        }

        serializer = CourseSerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        course = serializer.save(instructor=self.instructor)
        self.assertEqual(course.title, 'Nested Course')
        self.assertEqual(course.modules.count(), 1)
        self.assertEqual(course.lessons.count(), 1)
        self.assertEqual(course.modules.first().lessons.first().title, 'Lesson 1')

    def test_lesson_api_does_not_accept_direct_video_files(self):
        serializer = LessonSerializer(data={
            'course': str(self.course.id),
            'title': 'Direct upload attempt',
            'video_file': SimpleUploadedFile('video.mp4', b'not validated by chunk uploader'),
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        lesson = serializer.save()
        self.assertFalse(lesson.video_file)

    @override_settings(MAX_COURSE_THUMBNAIL_BYTES=1)
    def test_course_thumbnail_size_is_limited(self):
        image_data = io.BytesIO()
        Image.new('RGB', (1, 1)).save(image_data, format='PNG')
        serializer = CourseSerializer(data={
            'title': 'Large thumbnail',
            'category': 'Development',
            'price': '0.00',
            'thumbnail': SimpleUploadedFile('thumbnail.png', image_data.getvalue(), content_type='image/png'),
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('thumbnail', serializer.errors)

    @override_settings(MAX_IMAGE_DIMENSION=1)
    def test_course_thumbnail_dimensions_are_limited(self):
        image_data = io.BytesIO()
        Image.new('RGB', (2, 1)).save(image_data, format='PNG')
        serializer = CourseSerializer(data={
            'title': 'Large thumbnail dimensions',
            'category': 'Development',
            'price': '0.00',
            'thumbnail': SimpleUploadedFile('thumbnail.png', image_data.getvalue(), content_type='image/png'),
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('thumbnail', serializer.errors)


class ChunkedVideoUploadTests(TestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            email='video-instructor@example.com',
            username='video-instructor',
            password='testpass123',
            role='INSTRUCTOR',
        )
        self.course = Course.objects.create(
            instructor=self.instructor,
            title='Video Course',
            category='Development',
            price='0.00',
        )
        self.lesson = Lesson.objects.create(course=self.course, title='Video lesson')
        self.client = APIClient()
        self.client.force_authenticate(self.instructor)
        self.media_dir = tempfile.TemporaryDirectory()
        self.settings_override = override_settings(MEDIA_ROOT=self.media_dir.name)
        self.settings_override.enable()

    def tearDown(self):
        self.settings_override.disable()
        self.media_dir.cleanup()

    def upload(self, *, upload_id=None, filename='lesson.mp4', content=b'\x00\x00\x00\x18ftypisom\x00\x00\x00\x00', total_chunks=1, chunk_index=0, lesson_id=None):
        data = {
            'upload_id': upload_id or str(uuid4()),
            'filename': filename,
            'chunk_index': chunk_index,
            'total_chunks': total_chunks,
            'file': SimpleUploadedFile(filename, content),
        }
        if lesson_id:
            data['lesson_id'] = str(lesson_id)
        return self.client.post('/api/courses/upload/chunked/', data, format='multipart')

    def test_rejects_path_traversal_upload_id(self):
        response = self.upload(upload_id='../../outside')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(os.path.exists(os.path.join(self.media_dir.name, 'outside')))

    def test_rejects_invalid_chunk_ranges_and_oversized_chunks(self):
        invalid_range = self.upload(chunk_index=1, total_chunks=1)
        oversized = self.upload(content=b'\x00' * (5 * 1024 * 1024 + 1))

        self.assertEqual(invalid_range.status_code, 400)
        self.assertEqual(oversized.status_code, 413)

    def test_rejects_spoofed_video_content(self):
        response = self.upload(content=b'not a video')
        self.assertEqual(response.status_code, 400)

    def test_saves_valid_video_under_generated_path_and_owned_lesson(self):
        response = self.upload(filename='lesson.mp4', lesson_id=self.lesson.id)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['path'].startswith('videos/'))
        self.assertTrue(os.path.isfile(os.path.join(self.media_dir.name, response.data['path'])))
        self.assertEqual(VideoMedia.objects.get(id=response.data['video_media_id']).lesson, self.lesson)


class CourseContentAccessTests(TestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            email='content-instructor@example.com',
            username='content-instructor',
            password='testpass123',
            role='INSTRUCTOR',
        )
        self.student = User.objects.create_user(
            email='content-student@example.com',
            username='content-student',
            password='testpass123',
        )
        self.course = Course.objects.create(
            instructor=self.instructor,
            title='Published Course',
            category='Development',
            price='10.00',
            status='PUBLISHED',
        )
        self.locked_lesson = Lesson.objects.create(
            course=self.course,
            title='Locked lesson',
            content='private course content',
            video_url='https://media.example.test/private.mp4',
        )
        self.preview_lesson = Lesson.objects.create(
            course=self.course,
            title='Preview lesson',
            content='public preview content',
            video_url='https://media.example.test/preview.mp4',
            is_free_preview=True,
        )
        self.client = APIClient()

    def test_public_course_hides_locked_lesson_content_and_media(self):
        response = self.client.get(f'/api/courses/{self.course.id}/')

        self.assertEqual(response.status_code, 200)
        lessons = {lesson['title']: lesson for lesson in response.data['lessons']}
        self.assertEqual(lessons['Locked lesson']['content'], '')
        self.assertIsNone(lessons['Locked lesson']['video_url'])
        self.assertEqual(lessons['Preview lesson']['content'], 'public preview content')
        self.assertEqual(lessons['Preview lesson']['video_url'], 'https://media.example.test/preview.mp4')

    def test_enrollment_reveals_locked_content_and_video_media(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_authenticate(self.student)

        response = self.client.get(f'/api/courses/{self.course.id}/')

        lessons = {lesson['title']: lesson for lesson in response.data['lessons']}
        self.assertEqual(lessons['Locked lesson']['content'], 'private course content')
        self.assertEqual(lessons['Locked lesson']['video_url'], 'https://media.example.test/private.mp4')

    def test_public_course_list_does_not_expose_drafts(self):
        draft = Course.objects.create(
            instructor=self.instructor,
            title='Private Draft',
            category='Development',
            price='0.00',
            status='DRAFT',
        )

        response = self.client.get('/api/courses/')

        self.assertEqual(response.status_code, 200)
        self.assertNotIn(str(draft.id), [str(course['id']) for course in response.data])
        self.assertEqual(self.client.get(f'/api/courses/{draft.id}/').status_code, 404)


class PrivateVideoFileAccessTests(TestCase):
    def setUp(self):
        self.media_dir = tempfile.TemporaryDirectory()
        self.settings_override = override_settings(MEDIA_ROOT=self.media_dir.name)
        self.settings_override.enable()
        user_model = User
        self.instructor = user_model.objects.create_user(
            email='media-instructor@example.com',
            username='media-instructor',
            password='testpass123',
            role='INSTRUCTOR',
        )
        self.student = user_model.objects.create_user(
            email='media-student@example.com',
            username='media-student',
            password='testpass123',
        )
        self.course = Course.objects.create(
            instructor=self.instructor,
            title='Private Media Course',
            category='Development',
            price='10.00',
            status='PUBLISHED',
        )
        self.lesson = Lesson.objects.create(course=self.course, title='Private Video')
        self.video_path = 'videos/private.mp4'
        os.makedirs(os.path.join(self.media_dir.name, 'videos'), exist_ok=True)
        with open(os.path.join(self.media_dir.name, self.video_path), 'wb') as video_file:
            video_file.write(b'\x00\x00\x00\x18ftypisom')
        VideoMedia.objects.create(
            lesson=self.lesson,
            title='Private video',
            video_file=self.video_path,
        )
        self.client = APIClient()

    def tearDown(self):
        self.settings_override.disable()
        self.media_dir.cleanup()

    def test_private_video_is_hidden_until_enrolled_and_supports_ranges(self):
        path = '/media/videos/private.mp4'
        anonymous_response = self.client.get(path)
        self.assertEqual(anonymous_response.status_code, 404)

        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_authenticate(self.student)
        request = RequestFactory().get(path)
        request.user = self.student
        self.assertTrue(_can_access_video(request, self.video_path))
        range_request = RequestFactory().get(path, HTTP_RANGE='bytes=0-3')
        range_request.user = self.student
        enrolled_response = serve_media_with_range(range_request, self.video_path)
        stored_video = VideoMedia.objects.get(lesson=self.lesson)
        self.assertEqual(
            enrolled_response.status_code,
            206,
            f"stored={stored_video.video_file.name}, file_exists={os.path.isfile(os.path.join(self.media_dir.name, self.video_path))}",
        )
        self.assertEqual(b''.join(enrolled_response.streaming_content), b'\x00\x00\x00\x18')
