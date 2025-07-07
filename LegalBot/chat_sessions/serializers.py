from rest_framework import serializers
from .models import Session


class SessionSerializer(serializers.ModelSerializer):
    """Serializer for the Session model."""

    user = serializers.CharField(read_only=True)

    class Meta:
        model = Session
        fields = ["id", "title", "status", "created_at", "updated_at", "user"]
        read_only_fields = ["id", "created_at", "updated_at", "user"]
