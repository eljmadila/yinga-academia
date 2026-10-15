from django.db import connection
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
import logging

from .models import SupportMessage
from .serializers import SupportMessageSerializer

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for Render/Kubernetes/uptime monitors.
    Validates database and cache connectivity.
    """
    db_ok = False
    cache_ok = False
    errors = []

    # Database check
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception as e:
        logger.error(f"Health check DB error: {e}")
        errors.append(f"Database error: {str(e)}")

    # Cache check
    try:
        cache.set('__health__', 'ok', timeout=10)
        cache_ok = cache.get('__health__') == 'ok'
    except Exception as e:
        logger.error(f"Health check Cache error: {e}")
        errors.append(f"Cache error: {str(e)}")

    is_healthy = db_ok and cache_ok
    status_code = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE

    return Response({
        "status": "healthy" if is_healthy else "unhealthy",
        "database": "connected" if db_ok else "disconnected",
        "cache": "connected" if cache_ok else "disconnected",
        "errors": errors if errors else None,
    }, status=status_code)


class SupportMessageViewSet(viewsets.ModelViewSet):
    queryset = SupportMessage.objects.all()
    serializer_class = SupportMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return SupportMessage.objects.none()
        if user.is_staff or getattr(user, 'role', None) == 'INSTRUCTOR':
            return SupportMessage.objects.all()
        return SupportMessage.objects.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)
