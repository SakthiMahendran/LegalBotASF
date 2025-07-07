import { useState, useEffect } from 'react';
import { useAuthStore, useSessionsStore } from '../lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import {
  MessageSquare,
  FileText,
  Plus,
  LogOut,
  Settings,
  Scale,
  User,
  Home
} from 'lucide-react';

export default function Layout({ children, currentView, onViewChange }) {
  const { logout, isAuthenticated } = useAuthStore();
  const {
    sessions,
    currentSession,
    fetchSessions,
    createSession,
    setCurrentSession
  } = useSessionsStore();

  const [isCreatingSession, setIsCreatingSession] = useState(false);

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
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LegalBot</h1>
              <p className="text-sm text-gray-500">AI Legal Assistant</p>
            </div>
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
          <div className="flex-1 overflow-hidden">
            <div className="p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Sessions</h2>
            </div>
          
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {sessions.map((session) => (
                <Card 
                  key={session.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    currentSession?.id === session.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setCurrentSession(session)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {session.title}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(session.status)}`}
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
              
              {sessions.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No documents yet</p>
                  <p className="text-xs text-gray-400">Create your first legal document</p>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
