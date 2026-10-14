from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import RegisterSerializer
from .throttles import LoginRateThrottle, RegistrationRateThrottle

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    throttle_classes = [RegistrationRateThrottle]

from rest_framework import viewsets
from apps.courses.serializers import InstructorSerializer

class InstructorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(role='INSTRUCTOR')
    serializer_class = InstructorSerializer
    permission_classes = [AllowAny]
