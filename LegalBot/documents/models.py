from django.db import models
import uuid


class Document(models.Model):
    """Document model for generated legal documents."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(
        'chat_sessions.Session',
        on_delete=models.CASCADE,
        related_name='document'
    )
    document_type = models.CharField(max_length=100)
    content = models.TextField()
    formatted_content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
    
    def __str__(self):
        return f"{self.document_type} - {self.session.title}"


class DocumentDetails(models.Model):
    """Document details extracted from conversation."""
    
    document = models.OneToOneField(
        Document,
        on_delete=models.CASCADE,
        related_name='details'
    )
    details = models.JSONField(default=dict)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Document Details'
        verbose_name_plural = 'Document Details'
    
    def __str__(self):
        return f"Details for {self.document.document_type}"
