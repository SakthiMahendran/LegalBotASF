from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Message
from .serializers import MessageSerializer


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing chat messages."""

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [AllowAny]  # Allow access without authentication for testing

    def get_queryset(self):
        # Filter messages by session if session parameter is provided
        queryset = self.queryset.all()
        session_id = self.request.query_params.get("session", None)
        if session_id:
            queryset = queryset.filter(session=session_id)
        return queryset.order_by("created_at")

    def perform_create(self, serializer):
        serializer.save()
