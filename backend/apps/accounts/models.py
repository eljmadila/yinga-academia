import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('INSTRUCTOR', 'Instructor'),
        ('ADMIN', 'Admin'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    title = models.CharField(max_length=150, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    def get_full_name(self):
        name = super().get_full_name()
        if name.strip():
            return name
        if self.email:
            return self.email.split('@')[0]
        return "Admin"

    def get_username(self):
        username = super().get_username()
        if username and username.strip():
            return username
        return self.email or "admin"
