import os
import shutil
import uuid
from django.conf import settings
from pathlib import Path
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import filters
from apps.courses.models import Course, Module, Lesson, VideoMedia
from apps.students.models import Enrollment
from apps.courses.serializers import CourseSerializer, ModuleSerializer, LessonSerializer, VideoMediaSerializer
from django.db.models import Q, Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class ChunkedVideoUploadView(APIView):
    parser_classes = (MultiPartParser,)
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'INSTRUCTOR':
            return Response({'error': 'Only instructors can upload videos'}, status=403)

        upload_id = request.data.get('upload_id')
        try:
            chunk_index = int(request.data.get('chunk_index', 0))
            total_chunks = int(request.data.get('total_chunks', 1))
            upload_id = str(uuid.UUID(str(upload_id)))
        except (TypeError, ValueError, AttributeError):
            return Response({'error': 'Invalid chunk_index or total_chunks'}, status=400)
            
        file_obj = request.data.get('file')
        filename = request.data.get('filename', 'video.mp4')
        lesson_id = request.data.get('lesson_id')

        if not file_obj:
            return Response({'error': 'upload_id and file are required'}, status=400)

        safe_filename = Path(str(filename).replace('\\', '/')).name
        extension = Path(safe_filename).suffix.lower()
        max_chunks = (settings.MAX_VIDEO_UPLOAD_BYTES + settings.MAX_VIDEO_CHUNK_BYTES - 1) // settings.MAX_VIDEO_CHUNK_BYTES
        if (
            not safe_filename
            or len(safe_filename) > 255
            or extension not in {'.mp4', '.webm'}
            or total_chunks < 1
            or total_chunks > max_chunks
            or chunk_index < 0
            or chunk_index >= total_chunks
        ):
            return Response({'error': 'Invalid video upload metadata.'}, status=400)
        if file_obj.size > settings.MAX_VIDEO_CHUNK_BYTES:
            return Response({'error': 'Video chunks must not exceed 5 MiB.'}, status=413)

        lesson = None
        if lesson_id:
            lesson = get_object_or_404(Lesson, id=lesson_id, course__instructor=request.user)

        if chunk_index == 0:
            header = file_obj.read(12)
            file_obj.seek(0)
            valid_mp4 = extension == '.mp4' and header[4:8] == b'ftyp'
            valid_webm = extension == '.webm' and header.startswith(b'\x1a\x45\xdf\xa3')
            if not (valid_mp4 or valid_webm):
                return Response({'error': 'The uploaded file is not a valid MP4 or WebM video.'}, status=400)

        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp_uploads', str(upload_id))
        os.makedirs(temp_dir, exist_ok=True)
        
        chunk_path = os.path.join(temp_dir, f"{chunk_index}.part")
        with open(chunk_path, 'wb') as f:
            for chunk in file_obj.chunks():
                f.write(chunk)

        # Check if all chunks are uploaded
        chunk_paths = [os.path.join(temp_dir, f"{index}.part") for index in range(total_chunks)]
        if all(os.path.isfile(path) for path in chunk_paths):
            total_size = sum(os.path.getsize(path) for path in chunk_paths)
            if total_size > settings.MAX_VIDEO_UPLOAD_BYTES:
                shutil.rmtree(temp_dir, ignore_errors=True)
                return Response({'error': 'Video uploads must not exceed 1 GiB.'}, status=413)

            # Combine chunks
            final_rel_path = f"videos/{upload_id}_{safe_filename}"
            final_path = os.path.join(settings.MEDIA_ROOT, 'videos', f"{upload_id}_{safe_filename}")
            os.makedirs(os.path.dirname(final_path), exist_ok=True)
            
            with open(final_path, 'wb') as final_file:
                for i in range(total_chunks):
                    part_path = os.path.join(temp_dir, f"{i}.part")
                    if os.path.exists(part_path):
                        with open(part_path, 'rb') as part_file:
                            final_file.write(part_file.read())
                        os.remove(part_path)
            
            try:
                os.rmdir(temp_dir)
            except OSError:
                pass # Directory might not be empty if something went wrong

            # If Cloudinary is configured, upload to Cloudinary for permanent storage and CDN streaming
            cloudinary_url = None
            if getattr(settings, 'CLOUDINARY_CLOUD_NAME', None) and getattr(settings, 'CLOUDINARY_API_KEY', None) and getattr(settings, 'CLOUDINARY_API_SECRET', None):
                try:
                    import cloudinary.uploader
                    c_resp = cloudinary.uploader.upload_large(
                        final_path,
                        resource_type="video",
                        folder="courses/videos",
                        public_id=f"{upload_id}_{Path(safe_filename).stem}",
                        overwrite=True
                    )
                    cloudinary_url = c_resp.get('secure_url')
                except Exception as c_err:
                    logger.warning(f"Cloudinary upload failed, falling back to local storage: {c_err}")

            file_url = cloudinary_url or (settings.MEDIA_URL + final_rel_path)
            
            video_media = None
            if lesson:
                video_media = VideoMedia.objects.create(
                    lesson=lesson,
                    title=safe_filename,
                    video_file=final_rel_path if not cloudinary_url else '',
                    video_url=file_url
                )
                lesson.video_url = file_url
                lesson.save(update_fields=['video_url'])

            return Response({
                'message': 'Upload complete',
                'file_url': file_url,
                'path': final_rel_path,
                'video_media_id': video_media.id if video_media else None
            }, status=200)

        return Response({'message': f'Chunk {chunk_index} uploaded'}, status=200)

class IsInstructorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'INSTRUCTOR'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(obj, 'instructor'):
            return obj.instructor == request.user
        return obj.course.instructor == request.user


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsInstructorOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'category']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Course.objects.all()
        if user.is_authenticated and user.role == 'INSTRUCTOR':
            return Course.objects.filter(Q(is_published=True) | Q(instructor=user)).distinct()
        return Course.objects.filter(is_published=True)

    def create(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else request.data
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        modules_json = data.get('modules_json')
        if modules_json:
            try:
                import json
                modules_list = json.loads(modules_json)
                for index, mod in enumerate(modules_list):
                    module_obj = Module.objects.create(
                        course=serializer.instance, 
                        title=mod.get('title', f"Module {index+1}"),
                        order=index
                    )
                    for l_index, les in enumerate(mod.get('lessons', [])):
                        Lesson.objects.create(
                            course=serializer.instance, 
                            module=module_obj, 
                            title=les.get('title', f"Lesson {l_index+1}"),
                            order=l_index
                        )
            except Exception as e:
                print("Error parsing modules_json:", e)

        serializer.instance.refresh_from_db()
        response_serializer = self.get_serializer(serializer.instance)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=201, headers=headers)

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my(self, request):
        courses = Course.objects.filter(instructor=request.user)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def published(self, request):
        courses = Course.objects.filter(is_published=True)
        search_query = request.query_params.get('search', None)
        if search_query:
            courses = courses.filter(title__icontains=search_query) | courses.filter(description__icontains=search_query)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_favorite(self, request, pk=None):
        course = self.get_object()
        user = request.user
        if user in course.favorites.all():
            course.favorites.remove(user)
            return Response({'status': 'removed', 'is_favorite': False})
        else:
            course.favorites.add(user)
            return Response({'status': 'added', 'is_favorite': True})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_favorites(self, request):
        courses = Course.objects.filter(favorites=request.user, is_published=True)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'INSTRUCTOR':
            return Module.objects.filter(course__instructor=self.request.user)
        return Module.objects.filter(course__is_published=True)


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'INSTRUCTOR':
            return Lesson.objects.filter(course__instructor=self.request.user)
        return Lesson.objects.filter(course__is_published=True)


class VideoMediaViewSet(viewsets.ModelViewSet):
    queryset = VideoMedia.objects.all()
    serializer_class = VideoMediaSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return VideoMedia.objects.all()
        if user.is_authenticated and user.role == 'INSTRUCTOR':
            return VideoMedia.objects.filter(lesson__course__instructor=user)

        public_media = VideoMedia.objects.filter(
            lesson__course__is_published=True,
            lesson__is_free_preview=True,
        )
        if not user.is_authenticated:
            return public_media

        enrolled_media = VideoMedia.objects.filter(
            lesson__course__enrollments__student=user,
            lesson__course__enrollments__status__in=['ACTIVE', 'COMPLETED'],
        )
        return (public_media | enrolled_media).distinct()


class InstructorAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'INSTRUCTOR':
            return Response({'error': 'Only instructors can view analytics'}, status=403)

        user = request.user
        my_courses = Course.objects.filter(instructor=user)
        
        # Active Courses
        active_courses = my_courses.filter(status='PUBLISHED').count()

        # Enrollments
        total_learners = Enrollment.objects.filter(course__instructor=user).count()

        # Revenue
        from apps.payments.models import Order
        payments = Order.objects.filter(course__instructor=user, status='COMPLETED')
        total_revenue = payments.aggregate(total=Sum('amount'))['total'] or 0.0

        # Monthly Revenue (last 30 days)
        last_30_days = timezone.now() - timedelta(days=30)
        monthly_revenue = payments.filter(created_at__gte=last_30_days).aggregate(total=Sum('amount'))['total'] or 0.0

        # Course Performance
        course_performance = []
        for idx, c in enumerate(my_courses):
            learners = Enrollment.objects.filter(course=c).count()
            revenue = Order.objects.filter(course=c, status='COMPLETED').aggregate(total=Sum('amount'))['total'] or 0.0
            
            # Simple color mapping
            colors = ["#3b82f6", "#60a5fa", "#2563eb", "#93c5fd"]
            
            course_performance.append({
                'course': c.title,
                'revenue': float(revenue),
                'learners': learners,
                'completionRate': 0, # not tracked yet
                'fill': colors[idx % len(colors)]
            })

        # Recent Transactions
        recent_txs = payments.order_by('-created_at')[:5]
        recent_transactions = [{
            'id': f"PAY-{t.id.hex[:6].upper()}",
            'student': f"{t.student.first_name} {t.student.last_name}".strip() or t.student.email.split('@')[0],
            'course': t.course.title,
            'date': t.created_at.strftime("%d %b %Y"),
            'amount': float(t.amount),
            'status': t.get_status_display(),
            'method': "Card"
        } for t in recent_txs]
        
        # Latest Students
        latest_enrs = Enrollment.objects.filter(course__instructor=user).order_by('-enrolled_at')[:5]
        latest_students = [{
            'id': e.id,
            'name': f"{e.student.first_name} {e.student.last_name}".strip() or e.student.email.split('@')[0],
            'email': e.student.email,
            'course': e.course.title,
            'date': e.enrolled_at.strftime("%d %b %Y"),
            'progress': 0
        } for e in latest_enrs]

        # Monthly History (last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
        history_qs = payments.filter(created_at__gte=six_months_ago) \
            .annotate(month_date=TruncMonth('created_at')) \
            .values('month_date') \
            .annotate(revenue=Sum('amount')) \
            .order_by('month_date')
            
        monthly_history = []
        for h in history_qs:
            monthly_history.append({
                'month': h['month_date'].strftime("%b"),
                'revenue': float(h['revenue'])
            })
        
        # Fallback if no history
        if not monthly_history:
            monthly_history = [
                {"month": (timezone.now() - timedelta(days=30)).strftime("%b"), "revenue": 0},
                {"month": timezone.now().strftime("%b"), "revenue": float(monthly_revenue)}
            ]

        # Recent Reviews
        from apps.students.models import Review
        from django.db.models import Avg
        instructor_reviews = Review.objects.filter(course__instructor=user)
        recent_revs = instructor_reviews.order_by('-created_at')[:3]
        
        avg_rating = instructor_reviews.aggregate(avg=Avg('rating'))['avg']
        avg_rating = round(avg_rating, 1) if avg_rating else 0.0

        recent_reviews = [{
            'id': r.id.hex,
            'rating': r.rating,
            'comment': r.comment,
            'student_name': f"{r.student.first_name} {r.student.last_name}".strip() or r.student.email.split('@')[0],
            'course_title': r.course.title,
            'date': r.created_at.strftime("%d %b %Y")
        } for r in recent_revs]

        return Response({
            'totalStudents': total_learners,
            'activeCourses': active_courses,
            'totalRevenue': float(total_revenue),
            'monthlyRevenue': float(monthly_revenue),
            'coursePerformance': course_performance,
            'recentTransactions': recent_transactions,
            'latestStudents': latest_students,
            'monthlyHistory': monthly_history,
            'recentReviews': recent_reviews,
            'averageRating': float(avg_rating)
        })

