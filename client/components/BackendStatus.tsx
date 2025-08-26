import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, RefreshCw, WifiOff } from "lucide-react";
import { request } from "@/lib/request";

/**
 * Backend connectivity status component
 * Shows the current status of backend connection and provides troubleshooting info
 */
export default function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'mock'>('checking');
  const [error, setError] = useState<string>('');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkBackendStatus = async () => {
    setStatus('checking');
    setError('');
    
    try {
      // Try a simple health check or known endpoint
      const response = await request.get('/quote/api/v1/profile/list?page=1&limit=1');
      
      if (response.data && response.data.mockMode) {
        setStatus('mock');
      } else {
        setStatus('connected');
      }
    } catch (err) {
      setStatus('disconnected');
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkBackendStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-100 border-green-500 text-green-800';
      case 'mock': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'disconnected': return 'bg-red-100 border-red-500 text-red-800';
      case 'checking': return 'bg-blue-100 border-blue-500 text-blue-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'mock': return <AlertCircle className="h-4 w-4" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      case 'checking': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Backend Connected';
      case 'mock': return 'Using Mock Data';
      case 'disconnected': return 'Backend Disconnected';
      case 'checking': return 'Checking...';
      default: return 'Unknown Status';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'connected':
        return 'API server is responding normally.';
      case 'mock':
        return 'Backend server unavailable. Using mock data for development.';
      case 'disconnected':
        return `Cannot connect to backend server at 192.168.1.128:8099. ${error}`;
      case 'checking':
        return 'Checking backend connectivity...';
      default:
        return 'Unknown status.';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className={`${getStatusColor()} border-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant="outline" className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkBackendStatus}
            disabled={status === 'checking'}
          >
            <RefreshCw className={`h-3 w-3 ${status === 'checking' ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <AlertDescription className="mt-2 text-sm">
          {getStatusMessage()}
          {lastCheck && (
            <div className="mt-1 text-xs opacity-70">
              Last checked: {lastCheck.toLocaleTimeString()}
            </div>
          )}
        </AlertDescription>

        {status === 'disconnected' && (
          <div className="mt-3 text-xs space-y-1">
            <div className="font-medium">Troubleshooting:</div>
            <div>• Check if API server is running</div>
            <div>• Verify network connectivity</div>
            <div>• Check vite.config.ts proxy settings</div>
            <div>• Using mock data as fallback</div>
          </div>
        )}
      </Alert>
    </div>
  );
}
