# LegalBot Frontend Demo

## Overview

This is a comprehensive React frontend for the LegalBot API, built with modern technologies and shadcn/ui components.

## Features Implemented

### ✅ Authentication System
- **Login Form** with email/password validation
- **Registration Form** with password confirmation
- **JWT Token Management** with automatic refresh
- **Protected Routes** with authentication guards
- **Cookie-based token storage**

### ✅ Modern UI Components
- **shadcn/ui** component library integration
- **Responsive design** with TailwindCSS
- **Professional styling** with proper theming
- **Accessible components** following best practices

### ✅ Chat Interface
- **Real-time chat** interface for AI interaction
- **Message history** display with user/assistant roles
- **Document generation** with special formatting
- **Typing indicators** and loading states
- **Auto-scrolling** message container

### ✅ Session Management
- **Session creation** and management
- **Session list** in sidebar with status badges
- **Session switching** with current session highlighting
- **Session status tracking** (drafting, reviewing, completed)

### ✅ Document Management
- **Document list** with preview functionality
- **Document viewer** with formatted content display
- **Download functionality** for DOCX and PDF formats
- **Document metadata** display (creation date, type, etc.)

### ✅ Settings & System Status
- **AI health monitoring** with status indicators
- **System information** display
- **Configuration status** checking
- **Usage statistics** overview

### ✅ Welcome Screen
- **Feature showcase** with icons and descriptions
- **Popular document types** quick start options
- **How it works** step-by-step guide
- **Professional landing page** design

## Technology Stack

### Frontend Framework
- **React 19.1.0** - Latest React version
- **Vite 7.0.0** - Fast build tool and dev server
- **React Router DOM** - Client-side routing

### UI & Styling
- **shadcn/ui** - High-quality component library
- **TailwindCSS 4.1.11** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Radix UI** - Accessible component primitives

### State Management & API
- **Zustand** - Lightweight state management
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Form handling and validation
- **js-cookie** - Cookie management for auth tokens

### Real-time Features
- **Socket.io Client** - WebSocket communication (ready for implementation)

## Project Structure

```
src/
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   ├── dialog.jsx
│   │   └── ...
│   ├── auth/                   # Authentication components
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── chat/                   # Chat interface
│   │   └── ChatInterface.jsx
│   ├── documents/              # Document management
│   │   └── DocumentManager.jsx
│   ├── Layout.jsx              # Main layout component
│   ├── WelcomeScreen.jsx       # Landing page
│   └── Settings.jsx            # Settings page
├── lib/
│   ├── api.js                  # API service layer
│   ├── store.js                # Zustand state stores
│   └── utils.js                # Utility functions
├── App.jsx                     # Main app component
└── main.jsx                    # App entry point
```

## API Integration

### Complete API Coverage
- **Authentication** - Login, register, logout, token refresh
- **Sessions** - CRUD operations for chat sessions
- **Messages** - Chat message management
- **AI Agent** - Document generation, refinement, detail extraction
- **Documents** - Document CRUD, formatting, downloads
- **Health Checks** - System status monitoring

### Error Handling
- **Automatic token refresh** on 401 errors
- **User-friendly error messages** throughout the app
- **Loading states** for all async operations
- **Graceful fallbacks** for failed requests

## Key Features

### 🎨 Professional Design
- Clean, modern interface following legal industry standards
- Consistent color scheme and typography
- Responsive design for desktop and mobile
- Professional gradients and shadows

### 🔐 Secure Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure cookie storage
- Protected route guards

### 💬 Interactive Chat
- Natural conversation flow with AI
- Document generation with special formatting
- Real-time typing indicators
- Message history persistence

### 📄 Document Management
- Professional document viewer
- Multiple download formats (DOCX, PDF)
- Document metadata display
- Easy document organization

### ⚙️ System Monitoring
- Real-time AI health status
- Configuration monitoring
- Usage statistics
- System information display

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Django backend running on http://localhost:8000

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup
The frontend is configured to connect to the Django backend at `http://localhost:8000`. Make sure the backend is running before starting the frontend.

## Demo Credentials
For testing purposes, you can use these demo credentials:
- **Email**: demo@legalbot.com
- **Password**: demo123

## Next Steps

### Ready for Integration
1. **Start Django backend** on port 8000
2. **Run frontend** with `npm run dev`
3. **Test authentication** with demo credentials
4. **Create legal documents** through the chat interface
5. **Download documents** in DOCX/PDF formats

### Future Enhancements
- Real-time WebSocket chat implementation
- Advanced document editing capabilities
- User profile management
- Document collaboration features
- Advanced search and filtering
- Document templates library

## Screenshots

The application includes:
- **Welcome Screen** - Professional landing page with feature showcase
- **Login/Register** - Clean authentication forms
- **Chat Interface** - Interactive AI conversation
- **Document Manager** - Professional document viewer
- **Settings** - System status and configuration
- **Responsive Sidebar** - Easy navigation between features

This frontend provides a complete, production-ready interface for the LegalBot API with modern design patterns and excellent user experience.
