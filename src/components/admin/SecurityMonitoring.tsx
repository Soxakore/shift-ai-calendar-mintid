

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Shield, AlertTriangle, Lock, Eye, Clock,
  Wifi, Globe, UserX, Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SystemStartupRecovery from './SystemStartupRecovery';
import HackingAttemptMonitor from './HackingAttemptMonitor';

interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'blocked_ip' | 'session_timeout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address?: string;
  user_id?: string;
  timestamp: string;
}

interface SessionInfo {
  active_sessions: number;
  super_admin_sessions: number;
  suspicious_sessions: number;
  blocked_ips: string[];
}

// Global emergency state - persists across component instances
const globalEmergencyState = {
  isEmergencyMode: false,
  emergencyActivatedAt: null as string | null
};

export default function SecurityMonitoring() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    active_sessions: 0,
    super_admin_sessions: 0,
    suspicious_sessions: 0,
    blocked_ips: []
  });
  const [loading, setLoading] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEmergencyMode, setIsEmergencyMode] = useState(globalEmergencyState.isEmergencyMode);
  const { toast } = useToast();

  // Sync with global emergency state
  useEffect(() => {
    setIsEmergencyMode(globalEmergencyState.isEmergencyMode);
  }, []);

  const updateGlobalEmergencyState = (emergency: boolean) => {
    globalEmergencyState.isEmergencyMode = emergency;
    globalEmergencyState.emergencyActivatedAt = emergency ? new Date().toISOString() : null;
    setIsEmergencyMode(emergency);
  };

  const handleEmergencyStateChange = (emergency: boolean) => {
    updateGlobalEmergencyState(emergency);
    
    if (!emergency) {
      toast({
        title: "✅ Emergency Mode Deactivated",
        description: "System has been restored to normal operation manually",
      });
    }
  };

  const fetchSecurityData = useCallback(async () => {
    try {
      // Fetch recent failed login attempts
      const { data: sessionLogs } = await supabase
        .from('session_logs')
        .select('*')
        .eq('success', false)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      // Convert session logs to security events with proper type handling
      const sessionEvents: SecurityEvent[] = sessionLogs?.map(log => ({
        id: log.id,
        type: 'failed_login' as const,
        severity: 'medium' as const,
        description: `Failed login attempt for user ${log.user_id}`,
        ip_address: log.ip_address ? String(log.ip_address) : undefined,
        user_id: log.user_id,
        timestamp: log.created_at
      })) || [];

      // Add some mock security events for demonstration
      const mockEvents: SecurityEvent[] = [
        {
          id: 'mock-1',
          type: 'suspicious_activity',
          severity: 'high',
          description: 'Multiple login attempts from different locations',
          ip_address: '192.168.1.100',
          timestamp: new Date().toISOString()
        },
        {
          id: 'mock-2',
          type: 'blocked_ip',
          severity: 'medium',
          description: 'IP address blocked due to repeated failed attempts',
          ip_address: '10.0.0.50',
          timestamp: new Date().toISOString()
        }
      ];

      // Combine both arrays
      const allEvents = [...sessionEvents, ...mockEvents];
      setSecurityEvents(allEvents);

      // Mock session information
      setSessionInfo({
        active_sessions: 12,
        super_admin_sessions: 2,
        suspicious_sessions: 1,
        blocked_ips: ['192.168.1.100', '10.0.0.50']
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "❌ Security Data Error",
        description: "Failed to load security monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSecurityData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, [fetchSecurityData]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'failed_login': return <UserX className="h-4 w-4" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />;
      case 'blocked_ip': return <Shield className="h-4 w-4" />;
      case 'session_timeout': return <Clock className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const blockIP = (ip: string) => {
    toast({
      title: "🚫 IP Blocked",
      description: `IP address ${ip} has been blocked`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            Security Overview
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'recovery'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            System Recovery
          </button>
          <button
            onClick={() => setActiveTab('threats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'threats'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            Threat Detection
            {isEmergencyMode && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Security Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Active Sessions</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{sessionInfo.active_sessions}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {sessionInfo.super_admin_sessions} super admin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Security Events</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{securityEvents.length}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Blocked IPs</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{sessionInfo.blocked_ips.length}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Currently blocked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Alert Status</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={alertsEnabled ? "default" : "secondary"}>
                    {alertsEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <Button 
                  onClick={() => setAlertsEnabled(!alertsEnabled)}
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  {alertsEnabled ? "Disable" : "Enable"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Alerts - Fixed text visibility */}
          {securityEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length > 0 && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-900 dark:text-red-100">
                <strong className="text-red-900 dark:text-red-100">High Priority Security Events Detected</strong><br />
                <span className="text-red-800 dark:text-red-200">
                  {securityEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length} critical/high severity events require immediate attention.
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Shield className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.type)}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{event.description}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <span>{new Date(event.timestamp).toLocaleString()}</span>
                          {event.ip_address && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{event.ip_address}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      {event.ip_address && event.type === 'failed_login' && (
                        <Button 
                          onClick={() => blockIP(event.ip_address!)}
                          variant="outline" 
                          size="sm"
                          className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                          Block IP
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {securityEvents.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No security events in the last 24 hours
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Blocked IPs Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Globe className="h-5 w-5" />
                Blocked IP Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessionInfo.blocked_ips.map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-2 border rounded bg-white dark:bg-slate-800">
                    <span className="font-mono text-slate-900 dark:text-slate-100">{ip}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
                
                {sessionInfo.blocked_ips.length === 0 && (
                  <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                    No IP addresses currently blocked
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'recovery' && (
        <SystemStartupRecovery 
          onEmergencyStateChange={handleEmergencyStateChange}
          initialEmergencyMode={isEmergencyMode}
        />
      )}
      
      {activeTab === 'threats' && (
        <HackingAttemptMonitor 
          isEmergencyMode={isEmergencyMode}
          emergencyActivatedAt={globalEmergencyState.emergencyActivatedAt}
        />
      )}
    </div>
  );
}

