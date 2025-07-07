from rest_framework import serializers
from .models import Document, DocumentDetails


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for the Document model."""
    class Meta:
        model = Document
        fields = ['id', 'session', 'document_type', 'content', 'formatted_content', 'created_at', 'updated_at']


class DocumentDetailsSerializer(serializers.ModelSerializer):
    """Serializer for the DocumentDetails model."""
    class Meta:
        model = DocumentDetails
        fields = ['id', 'document', 'details', 'verified', 'created_at', 'updated_at']