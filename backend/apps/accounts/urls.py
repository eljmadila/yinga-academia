from django.urls import path, include
from django.conf import settings
from django.http import HttpResponseRedirect
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from dj_rest_auth.views import (
    PasswordChangeView,
    PasswordResetConfirmView,
    PasswordResetView,
    UserDetailsView,
)
from .views import RegisterView, InstructorViewSet, CustomTokenObtainPairView
from .throttles import PasswordResetRateThrottle
from rest_framework.routers import DefaultRouter
from urllib.parse import urlencode


class ThrottledPasswordResetView(PasswordResetView):
    throttle_classes = [PasswordResetRateThrottle]


class ThrottledPasswordResetConfirmView(PasswordResetConfirmView):
    throttle_classes = [PasswordResetRateThrottle]


def redirect_password_reset_confirm(request, uid, token):
    query = urlencode({"uid": uid, "token": token})
    return HttpResponseRedirect(
        f"{settings.FRONTEND_URL.rstrip('/')}/reset-password/confirm?{query}"
    )

router = DefaultRouter()
router.register(r'instructors', InstructorViewSet, basename='instructor')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('user/', UserDetailsView.as_view(), name='user_details'),
    path('password/change/', PasswordChangeView.as_view(), name='password_change'),
    path('password/reset/', ThrottledPasswordResetView.as_view(), name='password_reset'),
    path('password/reset/confirm/', ThrottledPasswordResetConfirmView.as_view(), name='password_reset_confirm_api'),
    path(
        'password/reset/confirm/<str:uid>/<str:token>/',
        redirect_password_reset_confirm,
        name='password_reset_confirm',
    ),

]
