import { useState, useEffect } from 'react';
import { useAuthStore, useSessionsStore } from '../lib/store';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  MessageSquare,
  FileText,
  Plus,
  LogOut,
  Settings,
  Scale,
  User,
  Home,
  Menu,
  X
} from 'lucide-react';

export default function Layout({ children, currentView, onViewChange }) {
  const { logout, isAuthenticated } = useAuthStore();
  const {
    sessions,
    currentSession,
    isLoading,
    fetchSessions,
    createSession,
    setCurrentSession
  } = useSessionsStore();

  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Keyboard shortcut for sidebar toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setSidebarVisible(!sidebarVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarVisible]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, fetchSessions]);

  const handleCreateSession = async () => {
    setIsCreatingSession(true);
    try {
      await createSession({
        title: `New Legal Document ${new Date().toLocaleDateString()}`,
        status: 'drafting'
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'drafting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isAuthenticated) {
    return children;
  }

  return (
    <div className="flex h-screen bg-gray-50">


      {/* Navigation icons when sidebar is hidden */}
      {!sidebarVisible && (
        <div className="fixed left-0 top-0 h-full z-50 flex flex-col animate-in slide-in-from-left duration-300">
          {/* Navigation Icons */}
          <div className="flex flex-col bg-white border-r border-gray-200 shadow-lg h-full w-14">
            {/* Logo/Brand */}
            <div className="p-3 border-b border-gray-200">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Scale className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col py-2">
              {/* Home */}
              <Button
                variant={currentView === 'welcome' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('welcome')}
                className="w-12 h-12 p-0 m-1 flex items-center justify-center"
                title="Home"
              >
                <Home className="h-5 w-5" />
              </Button>

              {/* Chat */}
              <Button
                variant={currentView === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('chat')}
                className="w-12 h-12 p-0 m-1 flex items-center justify-center relative"
                title={`Chat (${sessions.length} sessions)`}
              >
                <MessageSquare className="h-5 w-5" />
                {sessions.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-blue-600 text-white"
                  >
                    {sessions.length > 9 ? '9+' : sessions.length}
                  </Badge>
                )}
              </Button>

              {/* Documents */}
              <Button
                variant={currentView === 'documents' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('documents')}
                className="w-12 h-12 p-0 m-1 flex items-center justify-center"
                title="Documents"
              >
                <FileText className="h-5 w-5" />
              </Button>

              {/* New Session (only show in chat view) */}
              {currentView === 'chat' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateSession}
                  disabled={isCreatingSession}
                  className="w-12 h-12 p-0 m-1 flex items-center justify-center"
                  title="New Chat Session"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col mt-auto border-t border-gray-200 py-2">
              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 m-1 flex items-center justify-center"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* User */}
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 m-1 flex items-center justify-center"
                title="User Profile"
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-12 h-12 p-0 m-1 flex items-center justify-center"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>

              {/* Expand Sidebar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarVisible(true)}
                className="w-12 h-12 p-0 m-1 flex items-center justify-center bg-blue-50 hover:bg-blue-100"
                title="Show Sidebar (Ctrl+B)"
              >
                <Menu className="h-5 w-5 text-blue-600" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarVisible ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden relative z-30`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Scale className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LegalBot</h1>
                <p className="text-sm text-gray-500">AI Legal Assistant</p>
              </div>
            </div>

            {/* Close Sidebar Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarVisible(false)}
              className="p-2 hover:bg-gray-100"
              title="Hide sidebar (Ctrl+B)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleCreateSession}
            disabled={isCreatingSession}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingSession ? 'Creating...' : 'New Document'}
          </Button>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4">
          <div className="space-y-1">
            <Button
              variant={currentView === 'chat' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onViewChange?.('chat')}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button
              variant={currentView === 'documents' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onViewChange?.('documents')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </Button>
            <Button
              variant={currentView === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onViewChange?.('settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Sessions List - Only show when in chat view */}
        {currentView === 'chat' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 flex-shrink-0 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Recent Sessions</h2>
                <Badge variant="secondary" className="text-xs">
                  {sessions.length}
                </Badge>
              </div>
            </div>

          <ScrollArea className="flex-1 px-4 min-h-0">
            <div className="space-y-3 pb-4">
              {/* Loading state */}
              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">Loading sessions...</p>
                </div>
              )}
              {!isLoading && sessions.map((session, index) => (
                <Card
                  key={session.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border border-gray-200 bg-white animate-in fade-in slide-in-from-left-2 ${
                    currentSession?.id === session.id
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200 shadow-md'
                      : 'hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setCurrentSession(session)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm text-gray-900 truncate flex-1 mr-2">
                        {session.title || 'Untitled Session'}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs flex-shrink-0 ${getStatusColor(session.status)}`}
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {session.message_count || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!isLoading && sessions.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-2">No chat sessions yet</p>
                  <p className="text-xs text-gray-400">Create your first document to get started</p>
                  <Button
                    onClick={handleCreateSession}
                    size="sm"
                    className="mt-3"
                    disabled={isCreatingSession}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isCreatingSession ? 'Creating...' : 'Start New Session'}
                  </Button>
                </div>
              )}

              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
                  <p>Sessions loaded: {sessions.length}</p>
                  <p>Current session: {currentSession?.id || 'None'}</p>
                </div>
              )}
            </div>
          </ScrollArea>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gray-100 rounded-full">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-700">User</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        !sidebarVisible ? 'ml-14' : 'ml-0'
      }`}>
        {children}
      </div>
    </div>
  );
}
