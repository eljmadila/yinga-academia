from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.conf import settings
from PIL import Image
from .models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom claims to the response
        data['role'] = self.user.role
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'STUDENT')
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    def validate_avatar(self, value):
        if value and value.size > settings.MAX_AVATAR_UPLOAD_BYTES:
            raise serializers.ValidationError('Profile images must not exceed 2 MiB.')
        if value:
            value.seek(0)
            with Image.open(value) as image:
                if max(image.size) > settings.MAX_IMAGE_DIMENSION:
                    raise serializers.ValidationError('Profile image dimensions must not exceed 4096 pixels.')
            value.seek(0)
        return value

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar', 'title', 'bio', 'social_links')
        read_only_fields = ('id', 'username', 'role')
