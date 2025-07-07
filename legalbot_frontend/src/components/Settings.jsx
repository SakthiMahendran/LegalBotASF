import { useState, useEffect } from 'react';
import { useAIStore } from '../lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Settings as SettingsIcon, 
  Bot, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Info,
  AlertTriangle
} from 'lucide-react';

export default function Settings() {
  const { 
    healthStatus, 
    checkHealth, 
    isGenerating,
    error 
  } = useAIStore();
  
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check AI health on component mount
    handleHealthCheck();
  }, []);

  const handleHealthCheck = async () => {
    setIsChecking(true);
    try {
      await checkHealth();
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="flex-1 bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">
            Manage your LegalBot preferences and system status
          </p>
        </div>

        {/* AI System Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI System Status
                </CardTitle>
                <CardDescription>
                  Current status of the AI document generation system
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleHealthCheck}
                disabled={isChecking}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Check Status'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {healthStatus ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthStatus.status)}
                    <span className="font-medium">System Status</span>
                  </div>
                  <Badge className={getStatusColor(healthStatus.status)}>
                    {healthStatus.status === 'healthy' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Configuration</span>
                    <Badge variant={healthStatus.ai_configured ? 'default' : 'destructive'}>
                      {healthStatus.ai_configured ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Modules Loaded</span>
                    <Badge variant={healthStatus.modules_loaded ? 'default' : 'destructive'}>
                      {healthStatus.modules_loaded ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Debug Mode</span>
                    <Badge variant={healthStatus.debug_mode ? 'secondary' : 'outline'}>
                      {healthStatus.debug_mode ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Generation Status</span>
                    <Badge variant={isGenerating ? 'default' : 'secondary'}>
                      {isGenerating ? 'Active' : 'Idle'}
                    </Badge>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No status information available</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={handleHealthCheck}
                >
                  Check System Status
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>
              Information about the LegalBot system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Version</span>
                <p className="text-sm text-gray-600">1.0.0</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">API Endpoint</span>
                <p className="text-sm text-gray-600">http://localhost:8000</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Frontend</span>
                <p className="text-sm text-gray-600">React + Vite</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Backend</span>
                <p className="text-sm text-gray-600">Django + DRF</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>
              Your LegalBot usage overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Documents Created</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
