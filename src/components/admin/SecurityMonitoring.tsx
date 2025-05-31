import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Shield, AlertTriangle, Lock, Eye, Clock,
  Wifi, Globe, UserX, Bell, RefreshCw
} from 'lucide-react';
import { useToast } from '../ui/use-toast';
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

// Enhanced security state management
interface SecurityState {
  events: SecurityEvent[];
  sessionInfo: SessionInfo;
  alertsEnabled: boolean;
  emergencyMode: boolean;
  emergencyActivatedAt: string | null;
  lastUpdated: string;
}

// Security state persistence
const SECURITY_STATE_KEY = 'security_monitoring_state';

const getStoredSecurityState = (): Partial<SecurityState> => {
  try {
    const stored = localStorage.getItem(SECURITY_STATE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveSecurityState = (state: Partial<SecurityState>) => {
  try {
    localStorage.setItem(SECURITY_STATE_KEY, JSON.stringify({
      ...getStoredSecurityState(),
      ...state,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.warn('Failed to save security state:', error);
  }
};

// Global emergency state - persists across component instances  
const globalEmergencyState = {
  isEmergencyMode: getStoredSecurityState().emergencyMode || false,
  emergencyActivatedAt: getStoredSecurityState().emergencyActivatedAt || null
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock security events for demonstration
      const mockEvents: SecurityEvent[] = [
        {
          id: 'event-1',
          type: 'failed_login',
          severity: 'medium',
          description: 'Failed login attempt from suspicious IP',
          ip_address: '192.168.1.100',
          user_id: 'user_123',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: 'event-2',
          type: 'suspicious_activity',
          severity: 'high',
          description: 'Multiple login attempts from different locations',
          ip_address: '10.0.0.50',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
        },
        {
          id: 'event-3',
          type: 'blocked_ip',
          severity: 'critical',
          description: 'IP address blocked due to repeated failed attempts',
          ip_address: '203.0.113.45',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
        },
        {
          id: 'event-4',
          type: 'session_timeout',
          severity: 'low',
          description: 'Admin session expired due to inactivity',
          user_id: 'admin_456',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
        }
      ];

      setSecurityEvents(mockEvents);

      // Mock session information
      setSessionInfo({
        active_sessions: Math.floor(Math.random() * 50) + 10,
        super_admin_sessions: Math.floor(Math.random() * 5) + 1,
        suspicious_sessions: Math.floor(Math.random() * 3),
        blocked_ips: ['192.168.1.100', '10.0.0.50', '203.0.113.45']
      });

    } catch (error) {
      console.error('Failed to fetch security data:', error);
      toast({
        title: "❌ Security Data Error",
        description: "Failed to load security information",
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
    setSessionInfo(prev => ({
      ...prev,
      blocked_ips: [...prev.blocked_ips, ip]
    }));
    
    toast({
      title: "🚫 IP Blocked",
      description: `IP address ${ip} has been blocked`,
    });
  };

  // Enhanced emergency mode management
  const activateEmergencyMode = useCallback(async () => {
    try {
      const currentTime = new Date().toISOString();
      globalEmergencyState.isEmergencyMode = true;
      globalEmergencyState.emergencyActivatedAt = currentTime;
      
      setIsEmergencyMode(true);
      saveSecurityState({
        emergencyMode: true,
        emergencyActivatedAt: currentTime
      });

      // Log emergency activation
      const emergencyEvent: SecurityEvent = {
        id: `emergency-${Date.now()}`,
        type: 'suspicious_activity',
        severity: 'critical',
        description: 'Emergency lockdown mode activated by security admin',
        timestamp: currentTime
      };
      
      setSecurityEvents(prev => [emergencyEvent, ...prev]);

      toast({
        title: "🚨 Emergency Mode Activated",
        description: "All non-essential systems have been locked down",
        variant: "destructive"
      });

      // Simulate sending alerts to all admins
      console.log('Emergency alerts sent to all administrators');
      
    } catch (error) {
      console.error('Failed to activate emergency mode:', error);
      toast({
        title: "❌ Emergency Activation Failed",
        description: "Could not activate emergency mode",
        variant: "destructive"
      });
    }
  }, [toast]);

  const deactivateEmergencyMode = useCallback(async () => {
    try {
      globalEmergencyState.isEmergencyMode = false;
      globalEmergencyState.emergencyActivatedAt = null;
      
      setIsEmergencyMode(false);
      saveSecurityState({
        emergencyMode: false,
        emergencyActivatedAt: null
      });

      const deactivationEvent: SecurityEvent = {
        id: `emergency-deactivated-${Date.now()}`,
        type: 'suspicious_activity',
        severity: 'medium',
        description: 'Emergency lockdown mode deactivated',
        timestamp: new Date().toISOString()
      };
      
      setSecurityEvents(prev => [deactivationEvent, ...prev]);

      toast({
        title: "✅ Emergency Mode Deactivated",
        description: "Normal operations have been restored"
      });
      
    } catch (error) {
      console.error('Failed to deactivate emergency mode:', error);
      toast({
        title: "❌ Deactivation Failed",
        description: "Could not deactivate emergency mode",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Auto-refresh security data
  const refreshSecurityData = useCallback(async () => {
    setLoading(true);
    await fetchSecurityData();
    toast({
      title: "🔄 Security Data Refreshed",
      description: "Latest security information has been loaded"
    });
  }, [fetchSecurityData, toast]);

  // Memoized security metrics
  const securityMetrics = useMemo(() => {
    const recentEvents = securityEvents.filter(event => {
      const eventTime = new Date(event.timestamp);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return eventTime > oneDayAgo;
    });

    const criticalEvents = recentEvents.filter(event => event.severity === 'critical');
    const highPriorityEvents = recentEvents.filter(event => ['critical', 'high'].includes(event.severity));
    
    return {
      totalEvents: securityEvents.length,
      recentEvents: recentEvents.length,
      criticalEvents: criticalEvents.length,
      highPriorityEvents: highPriorityEvents.length,
      threatLevel: criticalEvents.length > 0 ? 'critical' : 
                   highPriorityEvents.length > 3 ? 'high' : 
                   recentEvents.length > 10 ? 'medium' : 'low'
    };
  }, [securityEvents]);

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

