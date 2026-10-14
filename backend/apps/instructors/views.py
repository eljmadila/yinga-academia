from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PayoutRequest
from .serializers import PayoutRequestSerializer
from rest_framework.exceptions import ValidationError

class PayoutRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PayoutRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PayoutRequest.objects.filter(instructor=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # We can add validation to ensure they have enough available balance here.
        # For MVP, we simply allow them to request payout.
        serializer.save(instructor=self.request.user)

class InstructorProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Assure profile exists
        from .models import InstructorProfile
        profile, created = InstructorProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request, *args, **kwargs):
        from .serializers import InstructorProfileSerializer
        profile = self.get_object()
        serializer = InstructorProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        from .serializers import InstructorProfileSerializer
        profile = self.get_object()
        serializer = InstructorProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
