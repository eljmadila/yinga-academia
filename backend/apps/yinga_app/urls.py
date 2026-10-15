from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import health_check, SupportMessageViewSet

router = DefaultRouter()
router.register(r'messages', SupportMessageViewSet, basename='support-messages')
router.register(r'', SupportMessageViewSet, basename='support')

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('', include(router.urls)),
]
