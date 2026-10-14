import uuid
from django.db import models
from django.conf import settings
from apps.courses.models import Lesson

class Progress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    current_timecode = models.FloatField(default=0.0)
    last_accessed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('student', 'lesson')
        
    def __str__(self):
        status = "Completed" if self.is_completed else "In Progress"
        return f"{self.student.email} - {self.lesson.title} ({status})"
