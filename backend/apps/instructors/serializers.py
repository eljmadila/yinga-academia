from rest_framework import serializers
from .models import InstructorProfile, PayoutRequest

class PayoutRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutRequest
        fields = ['id', 'instructor', 'amount', 'status', 'bank_account_info', 'created_at', 'updated_at', 'notes']
        read_only_fields = ['id', 'instructor', 'status', 'created_at', 'updated_at', 'notes']

class InstructorProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    bio = serializers.CharField(source='user.bio', required=False, allow_blank=True)
    title = serializers.CharField(source='user.title', required=False, allow_blank=True)
    
    class Meta:
        model = InstructorProfile
        fields = ['first_name', 'last_name', 'bio', 'title', 'specialty', 'website', 'linkedin', 'github', 'youtube', 'twitter']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        if 'bio' in user_data:
            user.bio = user_data['bio']
        if 'title' in user_data:
            user.title = user_data['title']
            
        user.save()
        
        return super().update(instance, validated_data)
