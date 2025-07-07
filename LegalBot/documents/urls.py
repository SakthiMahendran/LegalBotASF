from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, DocumentDetailsViewSet


router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'document-details', DocumentDetailsViewSet, basename='documentdetails')

urlpatterns = router.urls