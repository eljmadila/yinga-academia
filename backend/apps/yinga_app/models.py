import uuid
from django.db import models
from django.conf import settings

class SupportMessage(models.Model):
    CATEGORY_CHOICES = [
        ('general', 'Question générale'),
        ('payment', 'Paiement & M-Pesa'),
        ('course', 'Accès à un cours / Vidéo'),
        ('certificate', 'Certificat de réussite'),
        ('instructor', 'Espace Formateur'),
        ('account', 'Compte & Connexion'),
    ]

    STATUS_CHOICES = [
        ('NEW', 'Nouveau'),
        ('IN_PROGRESS', 'En cours de traitement'),
        ('RESOLVED', 'Résolu'),
        ('CLOSED', 'Fermé'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='support_messages'
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    admin_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Message de support'
        verbose_name_plural = 'Messages de support'

    def __str__(self):
        return f"[{self.get_category_display()}] {self.subject} - {self.email} ({self.status})"
