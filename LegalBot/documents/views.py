import sys
from pathlib import Path
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import HttpResponse
from .models import Document, DocumentDetails
from .serializers import DocumentSerializer, DocumentDetailsSerializer

# Add modules to path for import
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from modules.utils import create_docx, create_pdf
from modules.ui import format_document_content


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing documents."""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [AllowAny]  # Allow access without authentication for testing

    def get_queryset(self):
        # For testing, return all documents. In production, filter by user
        return self.queryset.all()
        # return self.queryset.filter(session__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """
        Generate formatted document content.
        
        POST /api/sessions/{session_id}/document/generate/
        """
        document = self.get_object()
        try:
            # Format the document content using existing utility
            formatted_content = format_document_content(document.content)
            document.formatted_content = formatted_content
            document.save()
            
            return Response({
                'message': 'Document generated successfully',
                'formatted_content': formatted_content
            })
        except Exception as e:
            return Response({
                'error': f'Error generating document: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download document in specified format.
        
        GET /api/sessions/{session_id}/document/download/{format}/
        """
        document = self.get_object()
        file_format = request.query_params.get('format', 'docx').lower()
        
        if file_format not in ['docx', 'pdf']:
            return Response({
                'error': 'Invalid format. Use "docx" or "pdf"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use formatted content if available, otherwise format the content
            content = document.formatted_content or format_document_content(document.content)
            
            if file_format == 'docx':
                buffer = create_docx(content)
                response = HttpResponse(
                    buffer.getvalue(),
                    content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                )
                response['Content-Disposition'] = f'attachment; filename="legal_document_{document.id}.docx"'
            else:  # pdf
                buffer = create_pdf(content)
                response = HttpResponse(
                    buffer.getvalue(),
                    content_type='application/pdf'
                )
                response['Content-Disposition'] = f'attachment; filename="legal_document_{document.id}.pdf"'
            
            return response
            
        except Exception as e:
            return Response({
                'error': f'Error generating {file_format.upper()} file: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DocumentDetailsViewSet(viewsets.ModelViewSet):
    """ViewSet for managing document details."""
    queryset = DocumentDetails.objects.all()
    serializer_class = DocumentDetailsSerializer
    permission_classes = [AllowAny]  # Allow access without authentication for testing

    def get_queryset(self):
        # For testing, return all document details. In production, filter by user
        return self.queryset.all()
        # return self.queryset.filter(document__session__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()