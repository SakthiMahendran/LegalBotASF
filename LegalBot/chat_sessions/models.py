from django.db import models
from django.conf import settings
import uuid


class Session(models.Model):
    """Chat session model."""
    
    STATUS_CHOICES = [
        ('drafting', 'Drafting'),
        ('reviewing', 'Reviewing'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    title = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='drafting'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Session'
        verbose_name_plural = 'Sessions'
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
