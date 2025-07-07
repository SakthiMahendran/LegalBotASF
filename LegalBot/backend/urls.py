from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/', include('chat_sessions.urls')),
    path('api/', include('chat.urls')),
    path('api/', include('documents.urls')),
    path('api/ai/', include('ai_agent.urls')),
]