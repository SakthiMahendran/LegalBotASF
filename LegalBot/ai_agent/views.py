from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .services import (
    generate_legal_document, 
    refine_legal_document, 
    extract_document_details_from_history
)

class GenerateLegalDocumentView(APIView):
    """
    Generate legal document using AI agent.
    
    POST /api/ai/generate/
    Request Body:
    {
        "prompt": "I need a property transfer agreement",
        "conversation_history": [
            {"role": "user", "content": "..."},
            {"role": "assistant", "content": "..."}
        ]
    }
    
    Response:
    {
        "result": "AI response or DRAFT_COMPLETE: [document content]"
    }
    """
    permission_classes = [AllowAny]  # Allow access without authentication

    def post(self, request):
        prompt = request.data.get('prompt')
        conversation_history = request.data.get('conversation_history', None)
        
        if not prompt:
            return Response({'error': 'Prompt is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = generate_legal_document(prompt, conversation_history)
            return Response({'result': result})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RefineLegalDocumentView(APIView):
    """
    Refine an existing legal document based on user feedback.
    
    POST /api/ai/refine/
    Request Body:
    {
        "current_draft": "Current document content...",
        "user_request": "Please change the date to October 15, 2024"
    }
    
    Response:
    {
        "result": "Updated document content"
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        current_draft = request.data.get('current_draft')
        user_request = request.data.get('user_request')
        
        if not current_draft or not user_request:
            return Response({
                'error': 'Both current_draft and user_request are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = refine_legal_document(current_draft, user_request)
            return Response({'result': result})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExtractDocumentDetailsView(APIView):
    """
    Extract document details from conversation history.
    
    POST /api/ai/extract-details/
    Request Body:
    {
        "conversation_history": [
            {"role": "user", "content": "..."},
            {"role": "assistant", "content": "..."}
        ]
    }
    
    Response:
    {
        "details": {
            "Document Type": "Property Transfer Agreement",
            "Party 1 Name": "John Smith",
            "Party 2 Name": "Jane Doe",
            ...
        }
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        conversation_history = request.data.get('conversation_history', [])
        
        try:
            details = extract_document_details_from_history(conversation_history)
            return Response({'details': details})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HealthCheckView(APIView):
    """
    Health check endpoint to verify AI agent is working.
    
    GET /api/ai/health/
    Response:
    {
        "status": "healthy",
        "ai_configured": true,
        "modules_loaded": true
    }
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            from django.conf import settings
            
            # Check if API key is configured
            api_key_configured = bool(getattr(settings, 'OPENROUTER_API_KEY', ''))
            
            # Try to import modules
            modules_loaded = True
            try:
                from modules.agent import get_agent_executor
                from modules.ui import clean_legal_document
            except ImportError:
                modules_loaded = False
            
            return Response({
                'status': 'healthy',
                'ai_configured': api_key_configured,
                'modules_loaded': modules_loaded,
                'debug_mode': settings.DEBUG
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
