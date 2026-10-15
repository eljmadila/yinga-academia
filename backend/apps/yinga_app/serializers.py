from rest_framework import serializers
from .models import SupportMessage

class SupportMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportMessage
        fields = (
            'id',
            'user',
            'name',
            'email',
            'subject',
            'category',
            'message',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'user', 'status', 'created_at', 'updated_at')

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom est obligatoire.")
        return value.strip()

    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("L'adresse email est obligatoire.")
        return value.strip().lower()

    def validate_message(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le message ne peut pas être vide.")
        return value.strip()
