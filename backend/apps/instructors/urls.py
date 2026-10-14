from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayoutRequestViewSet, InstructorProfileView

router = DefaultRouter()
router.register(r'payouts', PayoutRequestViewSet, basename='payout')

urlpatterns = [
    path('profile/', InstructorProfileView.as_view(), name='instructor_profile'),
    path('', include(router.urls)),
]
