# LegalBot API Complete Documentation

## Overview

LegalBot is a Django-based legal document generation API that provides AI-powered legal document creation, refinement, and management capabilities. The API is built using Django REST Framework with JWT authentication and includes real-time chat functionality via WebSockets.

## Base Configuration

- **Base URL**: `http://localhost:8000`
- **API Version**: v1
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: SQLite (configurable)
- **AI Provider**: OpenRouter API
- **WebSocket Support**: Django Channels

## Quick Start

1. **Start the server**: `python manage.py runserver`
2. **Test health**: `GET /api/ai/health/`
3. **Create session**: `POST /api/sessions/`
4. **Generate document**: `POST /api/ai/generate/`

## Authentication Endpoints

### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "access": "jwt_token",
  "refresh": "refresh_token"
}
```

### Refresh Token
```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "refresh_token"
}
```

### Logout
```http
POST /api/auth/logout/
Content-Type: application/json

{
  "refresh": "refresh_token"
}
```

## Session Management

### Session Model
```json
{
  "id": "uuid",
  "title": "string",
  "status": "drafting|reviewing|completed",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### List Sessions
```http
GET /api/sessions/
Authorization: Bearer {access_token}
```

### Create Session
```http
POST /api/sessions/
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "title": "Property Transfer Agreement",
  "status": "drafting"
}
```

### Get/Update/Delete Session
```http
GET /api/sessions/{id}/
PUT /api/sessions/{id}/
PATCH /api/sessions/{id}/
DELETE /api/sessions/{id}/
```

## Chat & Messaging

### Message Model
```json
{
  "id": "uuid",
  "session": "uuid",
  "role": "user|assistant",
  "content": "string",
  "metadata": "object",
  "created_at": "datetime"
}
```

### List Messages
```http
GET /api/messages/
GET /api/messages/?session={session_id}
```

### Create Message
```http
POST /api/messages/
Content-Type: application/json

{
  "session": "uuid",
  "role": "user",
  "content": "I need a property transfer agreement",
  "metadata": {}
}
```

### WebSocket Connection
```
WS /ws/chat/{session_id}/
```

**Message Format:**
```json
{
  "type": "chat_message",
  "message": {
    "role": "user|assistant",
    "content": "string",
    "metadata": {}
  }
}
```

## AI Agent Integration

### Generate Legal Document
```http
POST /api/ai/generate/
Content-Type: application/json

{
  "prompt": "I need a property transfer agreement between John Smith and Jane Doe",
  "conversation_history": [
    {
      "role": "user",
      "content": "I need a property transfer agreement"
    },
    {
      "role": "assistant", 
      "content": "I'll help you create that. What are the names of the parties?"
    }
  ]
}
```

**Response (200):**
```json
{
  "result": "I'll help you create a property transfer agreement..."
}
```

**Special Response for Complete Documents:**
```json
{
  "result": "DRAFT_COMPLETE: [formatted legal document content]"
}
```

### Refine Legal Document
```http
POST /api/ai/refine/
Content-Type: application/json

{
  "current_draft": "PROPERTY TRANSFER AGREEMENT\n\nThis agreement...",
  "user_request": "Please change the date to October 15, 2024"
}
```

### Extract Document Details
```http
POST /api/ai/extract-details/
Content-Type: application/json

{
  "conversation_history": [
    {"role": "user", "content": "I need a property transfer agreement"},
    {"role": "user", "content": "Between John Smith and Jane Doe"},
    {"role": "user", "content": "Property at 123 Main Street, Toronto"}
  ]
}
```

**Response (200):**
```json
{
  "details": {
    "Document Type": "Property Transfer Agreement",
    "Party 1 Name": "John Smith",
    "Party 2 Name": "Jane Doe",
    "Property Address": "123 Main Street, Toronto",
    "Date": "October 15, 2024"
  }
}
```

### AI Health Check
```http
GET /api/ai/health/
```

**Response (200):**
```json
{
  "status": "healthy",
  "ai_configured": true,
  "modules_loaded": true,
  "debug_mode": true
}
```

## Document Management

### Document Model
```json
{
  "id": "uuid",
  "session": "uuid",
  "document_type": "string",
  "content": "string",
  "formatted_content": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Create Document
```http
POST /api/documents/
Content-Type: application/json

{
  "session": "uuid",
  "document_type": "Property Transfer Agreement",
  "content": "PROPERTY TRANSFER AGREEMENT\n\n...",
  "formatted_content": ""
}
```

### Generate Formatted Document
```http
POST /api/documents/{id}/generate/
```

**Response (200):**
```json
{
  "message": "Document generated successfully",
  "formatted_content": "formatted document content"
}
```

### Download Document
```http
GET /api/documents/{id}/download/?format=docx
GET /api/documents/{id}/download/?format=pdf
```

**Response (200):**
- **DOCX**: `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **PDF**: `Content-Type: application/pdf`
- **Filename**: `legal_document_{id}.{format}`

### Document Details
```http
GET /api/document-details/
POST /api/document-details/

{
  "document": "uuid",
  "details": {
    "Party 1": "John Smith",
    "Party 2": "Jane Doe",
    "Property": "123 Main Street"
  },
  "verified": false
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "detail": "Detailed error description"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **204**: No Content
- **400**: Bad Request
- **401**: Unauthorized
- **404**: Not Found
- **500**: Internal Server Error

## Configuration

### Environment Variables (.env)
```bash
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=deepseek/deepseek-chat-v3-0324:free
AI_TEMPERATURE=0.3
```

### CORS Settings
- **Allowed Origins**: `localhost:3000`, `localhost:5173`
- **Credentials**: Enabled
- **Headers**: Standard + `authorization`

### JWT Configuration
- **Access Token**: 60 minutes
- **Refresh Token**: 7 days
- **Rotation**: Enabled

## Complete Workflow Example

1. **Register/Login**
2. **Create Session**
3. **Send Messages**
4. **Generate Document**
5. **Extract Details**
6. **Download Files**

See `LegalBot_API_Examples.py` for complete code examples.

## Testing

Run the comprehensive test suite:
```bash
python test_api.py
```

Tests include:
- Health check
- AI generation
- Document refinement
- Detail extraction
- Session management
- Document operations
- File downloads

## API Endpoints Summary

### Authentication
- `POST /api/auth/register/` - Register user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/refresh/` - Refresh token
- `POST /api/auth/logout/` - Logout user

### Sessions
- `GET /api/sessions/` - List sessions
- `POST /api/sessions/` - Create session
- `GET /api/sessions/{id}/` - Get session
- `PUT /api/sessions/{id}/` - Update session
- `DELETE /api/sessions/{id}/` - Delete session

### Messages
- `GET /api/messages/` - List messages
- `POST /api/messages/` - Create message
- `GET /api/messages/{id}/` - Get message
- `PUT /api/messages/{id}/` - Update message
- `DELETE /api/messages/{id}/` - Delete message

### AI Agent
- `GET /api/ai/health/` - Health check
- `POST /api/ai/generate/` - Generate document
- `POST /api/ai/refine/` - Refine document
- `POST /api/ai/extract-details/` - Extract details

### Documents
- `GET /api/documents/` - List documents
- `POST /api/documents/` - Create document
- `GET /api/documents/{id}/` - Get document
- `PUT /api/documents/{id}/` - Update document
- `DELETE /api/documents/{id}/` - Delete document
- `POST /api/documents/{id}/generate/` - Format document
- `GET /api/documents/{id}/download/` - Download document

### Document Details
- `GET /api/document-details/` - List document details
- `POST /api/document-details/` - Create document details
- `GET /api/document-details/{id}/` - Get document details
- `PUT /api/document-details/{id}/` - Update document details
- `DELETE /api/document-details/{id}/` - Delete document details

### WebSocket
- `WS /ws/chat/{session_id}/` - Real-time chat

## Data Models

### User Model
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "preferences": "object"
}
```

### Session Model
```json
{
  "id": "uuid",
  "user": "uuid",
  "title": "string",
  "status": "drafting|reviewing|completed",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Message Model
```json
{
  "id": "uuid",
  "session": "uuid",
  "role": "user|assistant",
  "content": "string",
  "metadata": "object",
  "created_at": "datetime"
}
```

### Document Model
```json
{
  "id": "uuid",
  "session": "uuid",
  "document_type": "string",
  "content": "string",
  "formatted_content": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### DocumentDetails Model
```json
{
  "id": "uuid",
  "document": "uuid",
  "details": "object",
  "verified": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Troubleshooting

1. **Server not running**: `python manage.py runserver`
2. **Missing API key**: Set `OPENROUTER_API_KEY` in `.env`
3. **Dependencies**: `pip install -r requirements.txt`
4. **Database**: `python manage.py migrate`
5. **CORS issues**: Check allowed origins in settings
6. **WebSocket issues**: Ensure Redis is running for channels
7. **File downloads**: Check media settings and permissions
