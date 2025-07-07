from django.urls import path
from .views import (
    GenerateLegalDocumentView,
    RefineLegalDocumentView,
    ExtractDocumentDetailsView,
    HealthCheckView
)

urlpatterns = [
    path('generate/', GenerateLegalDocumentView.as_view(), name='generate_legal_document'),
    path('refine/', RefineLegalDocumentView.as_view(), name='refine_legal_document'),
    path('extract-details/', ExtractDocumentDetailsView.as_view(), name='extract_document_details'),
    path('health/', HealthCheckView.as_view(), name='ai_health_check'),
]
