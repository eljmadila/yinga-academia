from django.db import models
from django.conf import settings

class InstructorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='instructor_profile')
    specialty = models.CharField(max_length=255, blank=True, help_text="Domaine d'expertise principal")
    website = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    youtube = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Profile formateur : {self.user.email}"

class PayoutRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('PROCESSING', 'En cours de traitement'),
        ('PAID', 'Paye'),
        ('REJECTED', 'Refuse')
    )
    
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payout_requests')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    bank_account_info = models.TextField(blank=True, help_text="IBAN, PayPal email, ou autres details pour le virement")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, help_text="Notes administratives (ex: motif de refus)")

    def __str__(self):
        return f"Payout {self.id} - {self.instructor.email} - {self.amount} ({self.status})"
