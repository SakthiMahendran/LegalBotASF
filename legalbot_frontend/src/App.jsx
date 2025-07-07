import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './lib/store';
import { isAuthenticated } from './lib/api';

// Components
import Layout from './components/Layout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ChatInterface from './components/chat/ChatInterface';
import DocumentManager from './components/documents/DocumentManager';
import Settings from './components/Settings';

// Auth wrapper component
function ProtectedRoute({ children }) {
  const { isAuthenticated: authStoreAuthenticated } = useAuthStore();
  const authenticated = authStoreAuthenticated || isAuthenticated();

  return authenticated ? children : <Navigate to="/login" replace />;
}

function AuthRoute({ children }) {
  const { isAuthenticated: authStoreAuthenticated } = useAuthStore();
  const authenticated = authStoreAuthenticated || isAuthenticated();

  return !authenticated ? children : <Navigate to="/" replace />;
}

function App() {
  const [authMode, setAuthMode] = useState('login');
  const [currentView, setCurrentView] = useState('chat');

  useEffect(() => {
    // Check if user is authenticated on app load
    const authenticated = isAuthenticated();
    if (authenticated) {
      useAuthStore.setState({ isAuthenticated: true });
    }
  }, []);

  // Auto-login for demo purposes
  useEffect(() => {
    const { isAuthenticated: authStoreAuth, login } = useAuthStore.getState();
    if (!authStoreAuth && !isAuthenticated()) {
      // Try auto-login with demo credentials
      login({
        email: 'test@example.com',
        password: 'testpass123'
      }).catch(() => {
        console.log('Auto-login failed, user needs to login manually');
      });
    }
  }, []);

  const renderMainContent = () => {
    switch (currentView) {
      case 'documents':
        return <DocumentManager />;
      case 'settings':
        return <Settings />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                {authMode === 'login' ? (
                  <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
                ) : (
                  <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
                )}
              </AuthRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout
                  currentView={currentView}
                  onViewChange={setCurrentView}
                >
                  {renderMainContent()}
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
