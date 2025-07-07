from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from .models import Session
from .serializers import SessionSerializer

User = get_user_model()


class SessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing chat sessions."""
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [AllowAny]  # Allow access without authentication for testing

    def get_queryset(self):
        # For testing, return all sessions. In production, filter by user
        return self.queryset.all()
        # return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # For testing, create a default user if none exists or use first user
        try:
            # Try to get the first user, or create a test user
            user = User.objects.first()
            if not user:
                user = User.objects.create_user(
                    username='testuser',
                    email='test@example.com',
                    password='testpass123'
                )
            serializer.save(user=user)
        except Exception as e:
            # Fallback: save without user (if model allows)
            serializer.save()