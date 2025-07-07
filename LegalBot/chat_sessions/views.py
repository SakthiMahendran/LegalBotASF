from rest_framework import viewsets
from rest_framework.permissions import AllowAny
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
                # Create user with unique email to avoid conflicts
                import time

                timestamp = int(time.time())
                user = User.objects.create_user(
                    username=f"testuser_{timestamp}",
                    email=f"test_{timestamp}@example.com",
                    password="testpass123",
                )
            serializer.save(user=user)
        except Exception as e:
            print(f"Error creating session: {e}")
            # Try to use any existing user
            try:
                user = User.objects.first()
                if user:
                    serializer.save(user=user)
                else:
                    raise Exception("No user available")
            except Exception as e2:
                print(f"Fallback failed: {e2}")
                raise e
