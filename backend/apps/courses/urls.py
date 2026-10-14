from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, ModuleViewSet, LessonViewSet, VideoMediaViewSet, ChunkedVideoUploadView, InstructorAnalyticsView

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'video-media', VideoMediaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('courses/upload/chunked/', ChunkedVideoUploadView.as_view(), name='chunked-upload'),
    path('analytics/instructor/', InstructorAnalyticsView.as_view(), name='instructor-analytics'),
]
