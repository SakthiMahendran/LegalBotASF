from django.db import models
import uuid


class Message(models.Model):
    """Chat message model."""

    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        "chat_sessions.Session", on_delete=models.CASCADE, related_name="messages"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Message"
        verbose_name_plural = "Messages"

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."
