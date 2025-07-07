from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Message
from .serializers import MessageSerializer


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing chat messages."""
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [AllowAny]  # Allow access without authentication for testing

    def get_queryset(self):
        # For testing, return all messages. In production, filter by user
        return self.queryset.all()
        # return self.queryset.filter(session__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()