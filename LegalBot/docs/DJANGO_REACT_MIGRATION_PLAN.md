# Django + React.js Migration Plan

## Overview
Step-by-step plan to migrate LegalBot from Streamlit to Django (backend) + React.js with MUI (frontend).

## Phase 1: Environment Setup & Project Creation

### Step 1.1: Activate Virtual Environment
```bash
.venv\Scripts\activate  # Windows
```

### Step 1.2: Install Django Dependencies
```bash
pip install django djangorestframework django-cors-headers python-decouple
pip install channels channels-redis  # For WebSocket support
pip install djangorestframework-simplejwt  # For authentication
pip install python-docx fpdf2  # For document generation
```

### Step 1.3: Create Django Project
```bash
django-admin startproject backend .
cd backend
python manage.py startapp authentication
python manage.py startapp sessions
python manage.py startapp chat
python manage.py startapp documents
python manage.py startapp ai_agent
```

### Step 1.4: Create React Project with Vite
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/lab
npm install @reduxjs/toolkit react-redux
npm install react-router-dom
npm install axios
npm install socket.io-client
```

## Phase 2: Django Backend Development

### Step 2.1: Configure Django Settings
- Set up database configuration
- Configure CORS for React frontend
- Set up Django REST Framework
- Configure authentication
- Set up WebSocket support with Channels

### Step 2.2: Create Models
- User model (extend AbstractUser)
- Session model for chat sessions
- Message model for chat messages
- Document model for generated documents
- DocumentDetails model for extracted details

### Step 2.3: Create API Views
- Authentication endpoints
- Session CRUD operations
- Chat message endpoints
- Document generation endpoints
- WebSocket consumers for real-time chat

### Step 2.4: Migrate Existing Logic
- Port AI agent from modules/agent.py
- Port document utilities from modules/utils.py
- Port UI logic to API endpoints
- Port document formatting functions

## Phase 3: React Frontend Development

### Step 3.1: Set up Project Structure
```
frontend/src/
├── components/
│   ├── Chat/
│   ├── DocumentPreview/
│   ├── DetailsForm/
│   ├── Layout/
│   └── Common/
├── pages/
├── store/
├── services/
├── types/
├── utils/
└── hooks/
```

### Step 3.2: Create Core Components
- Layout components (Header, Sidebar, Main)
- Chat interface components
- Document preview components
- Details form components
- Authentication components

### Step 3.3: Set up State Management
- Redux store configuration
- API slices for backend communication
- Authentication state
- Chat state
- Document state

### Step 3.4: Implement Features
- Real-time chat with WebSockets
- Document preview with live updates
- Details form with validation
- File download functionality
- Theme switching (light/dark)

## Phase 4: Integration & Testing

### Step 4.1: API Integration
- Connect React frontend to Django backend
- Implement authentication flow
- Set up WebSocket connections
- Test all CRUD operations

### Step 4.2: Feature Migration
- Migrate chat functionality
- Migrate document generation
- Migrate details extraction
- Migrate file download

### Step 4.3: Testing
- Unit tests for Django models and views
- Integration tests for API endpoints
- React component tests
- End-to-end testing

## Phase 5: Deployment Preparation

### Step 5.1: Production Configuration
- Django production settings
- React build optimization
- Static file serving
- Database configuration

### Step 5.2: Docker Setup
- Create Dockerfiles for Django and React
- Set up docker-compose
- Configure Nginx for reverse proxy

## File Structure After Migration

```
LegalBot/
├── backend/
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── authentication/
│   ├── sessions/
│   ├── chat/
│   ├── documents/
│   ├── ai_agent/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── hooks/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── docs/
├── tests/
├── docker-compose.yml
└── README.md
```

## API Endpoints Design

### Authentication
- POST /api/auth/register/
- POST /api/auth/login/
- POST /api/auth/logout/
- GET /api/auth/user/

### Sessions
- GET /api/sessions/
- POST /api/sessions/
- GET /api/sessions/{id}/
- PUT /api/sessions/{id}/
- DELETE /api/sessions/{id}/

### Chat
- GET /api/sessions/{id}/messages/
- POST /api/sessions/{id}/messages/
- WS /ws/chat/{session_id}/

### Documents
- GET /api/sessions/{id}/document/
- PUT /api/sessions/{id}/document/
- GET /api/sessions/{id}/document/details/
- PUT /api/sessions/{id}/document/details/
- POST /api/sessions/{id}/document/generate/
- GET /api/sessions/{id}/document/download/{format}/

## Migration Strategy

1. **Parallel Development**: Keep Streamlit app running while building Django + React
2. **Feature Parity**: Ensure all Streamlit features are replicated
3. **Data Migration**: Plan for migrating any existing data
4. **Testing**: Thorough testing before switching
5. **Gradual Rollout**: Deploy and test in stages

## Timeline Estimate

- **Phase 1**: 1 day (Environment setup)
- **Phase 2**: 5-7 days (Django backend)
- **Phase 3**: 5-7 days (React frontend)
- **Phase 4**: 3-4 days (Integration & testing)
- **Phase 5**: 2-3 days (Deployment)

**Total**: 16-22 days

## Success Criteria

- ✅ All Streamlit features replicated
- ✅ Real-time chat functionality
- ✅ Document generation and download
- ✅ Responsive design with MUI
- ✅ Authentication and session management
- ✅ WebSocket communication
- ✅ Production-ready deployment