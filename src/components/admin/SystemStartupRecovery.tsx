
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, Power, AlertTriangle, CheckCircle, RefreshCw,
  Database, Server, Wifi, Lock, Eye, Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemHealth {
  database: 'online' | 'offline' | 'degraded';
  auth: 'online' | 'offline' | 'degraded';
  storage: 'online' | 'offline' | 'degraded';
  realtime: 'online' | 'offline' | 'degraded';
  api: 'online' | 'offline' | 'degraded';
}

interface EmergencyEvent {
  id: string;
  type: 'lockdown' | 'breach' | 'failure' | 'attack';
  timestamp: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  cause?: string;
}

export default function SystemStartupRecovery() {
  const { toast } = useToast();
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'online',
    auth: 'online',
    storage: 'online',
    realtime: 'online',
    api: 'online'
  });
  
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [emergencyEvents, setEmergencyEvents] = useState<EmergencyEvent[]>([
    {
      id: '1',
      type: 'lockdown',
      timestamp: '2024-01-30T15:30:00Z',
      description: 'System emergency lockdown triggered due to multiple failed authentication attempts',
      severity: 'critical',
      resolved: true,
      cause: 'Brute force attack detected from IP 192.168.1.100'
    },
    {
      id: '2',
      type: 'breach',
      timestamp: '2024-01-30T14:15:00Z',
      description: 'Unauthorized access attempt detected',
      severity: 'high',
      resolved: true,
      cause: 'SQL injection attempt on user login endpoint'
    }
  ]);

  const runSystemDiagnostics = async () => {
    setIsRecovering(true);
    
    // Simulate system health checks
    const checks = ['database', 'auth', 'storage', 'realtime', 'api'];
    const newHealth = { ...systemHealth };
    
    for (const check of checks) {
      // Simulate random health status for demo
      const statuses: Array<'online' | 'offline' | 'degraded'> = ['online', 'online', 'online', 'degraded', 'offline'];
      newHealth[check as keyof SystemHealth] = statuses[Math.floor(Math.random() * statuses.length)];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setSystemHealth({ ...newHealth });
    }
    
    setIsRecovering(false);
    toast({
      title: "🔍 System Diagnostics Complete",
      description: "All system components have been checked",
    });
  };

  const initiateEmergencyRecovery = async () => {
    setIsRecovering(true);
    
    // Simulate recovery process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setSystemHealth({
      database: 'online',
      auth: 'online',
      storage: 'online',
      realtime: 'online',
      api: 'online'
    });
    
    setIsEmergencyMode(false);
    setIsRecovering(false);
    
    toast({
      title: "✅ Emergency Recovery Complete",
      description: "All systems have been restored to normal operation",
    });
  };

  const triggerEmergencyLockdown = () => {
    const newEvent: EmergencyEvent = {
      id: Date.now().toString(),
      type: 'lockdown',
      timestamp: new Date().toISOString(),
      description: 'Manual emergency lockdown initiated by administrator',
      severity: 'critical',
      resolved: false
    };
    
    setEmergencyEvents(prev => [newEvent, ...prev]);
    setIsEmergencyMode(true);
    
    toast({
      title: "🚨 Emergency Lockdown Activated",
      description: "System has been locked down for security",
      variant: "destructive"
    });
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 dark:text-green-400';
      case 'degraded': return 'text-yellow-600 dark:text-yellow-400';
      case 'offline': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Status */}
      {isEmergencyMode && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>🚨 EMERGENCY MODE ACTIVE</strong><br />
            System is currently in emergency lockdown. Use emergency recovery to restore normal operations.
          </AlertDescription>
        </Alert>
      )}

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Server className="h-5 w-5" />
              System Health Status
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={runSystemDiagnostics}
                disabled={isRecovering}
                variant="outline"
                size="sm"
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                {isRecovering ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Diagnostics
              </Button>
              <Button
                onClick={initiateEmergencyRecovery}
                disabled={!isEmergencyMode || isRecovering}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Power className="h-4 w-4 mr-2" />
                Recovery
              </Button>
              <Button
                onClick={triggerEmergencyLockdown}
                disabled={isEmergencyMode || isRecovering}
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Lock className="h-4 w-4 mr-2" />
                Emergency Lockdown
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(systemHealth).map(([component, status]) => (
              <div key={component} className="p-4 border rounded-lg bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                    {component}
                  </span>
                  {getHealthIcon(status)}
                </div>
                <div className={`text-lg font-bold ${getHealthColor(status)} capitalize`}>
                  {status}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Events Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <AlertTriangle className="h-5 w-5" />
            Emergency Events & Security Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emergencyEvents.map((event) => (
              <div key={event.id} className="p-4 border rounded-lg bg-white dark:bg-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      <Badge variant={event.resolved ? "default" : "destructive"} className="text-white">
                        {event.resolved ? "RESOLVED" : "ACTIVE"}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {event.type}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                      {event.description}
                    </h4>
                    
                    {event.cause && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <strong>Cause:</strong> {event.cause}
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {emergencyEvents.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No emergency events recorded
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
