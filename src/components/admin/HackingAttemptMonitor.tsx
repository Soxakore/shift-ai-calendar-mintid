
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, AlertTriangle, Eye, Clock, Ban, Wifi,
  Activity, Target, Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThreatEvent {
  id: string;
  type: 'brute_force' | 'sql_injection' | 'ddos' | 'malware' | 'phishing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_ip: string;
  target: string;
  timestamp: string;
  status: 'active' | 'blocked' | 'investigating';
  details: string;
}

interface ThreatMetrics {
  total_attempts: number;
  blocked_attempts: number;
  active_threats: number;
  blocked_ips: string[];
  threat_level: 'low' | 'medium' | 'high' | 'critical';
}

interface HackingAttemptMonitorProps {
  isEmergencyMode?: boolean;
  emergencyActivatedAt?: string | null;
}

export default function HackingAttemptMonitor({ 
  isEmergencyMode = false, 
  emergencyActivatedAt 
}: HackingAttemptMonitorProps) {
  const { toast } = useToast();
  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>([]);
  const [threatMetrics, setThreatMetrics] = useState<ThreatMetrics>({
    total_attempts: 0,
    blocked_attempts: 0,
    active_threats: 0,
    blocked_ips: [],
    threat_level: 'low'
  });
  const [isLiveMode, setIsLiveMode] = useState(isEmergencyMode);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleString());

  // Auto-activate live mode when emergency is triggered
  useEffect(() => {
    if (isEmergencyMode) {
      setIsLiveMode(true);
      toast({
        title: "🚨 Live Threat Detection Activated",
        description: "Real-time monitoring enabled due to emergency lockdown",
        variant: "destructive"
      });
    }
  }, [isEmergencyMode, toast]);

  // Simulate live threat detection
  useEffect(() => {
    if (!isLiveMode) return;

    const generateThreatEvent = (): ThreatEvent => {
      const types: ThreatEvent['type'][] = ['brute_force', 'sql_injection', 'ddos', 'malware', 'phishing'];
      const severities: ThreatEvent['severity'][] = ['medium', 'high', 'critical'];
      const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.45'];
      const targets = ['/login', '/admin', '/api/users', '/database', '/config'];

      const type = types[Math.floor(Math.random() * types.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type,
        severity,
        source_ip: ips[Math.floor(Math.random() * ips.length)],
        target: targets[Math.floor(Math.random() * targets.length)],
        timestamp: new Date().toISOString(),
        status: Math.random() > 0.7 ? 'blocked' : 'active',
        details: getEventDetails(type, severity)
      };
    };

    const getEventDetails = (type: string, severity: string) => {
      const details = {
        brute_force: 'Multiple failed login attempts detected',
        sql_injection: 'Malicious SQL query attempt blocked',
        ddos: 'High volume traffic spike detected',
        malware: 'Suspicious file upload attempt',
        phishing: 'Fraudulent authentication attempt'
      };
      return `${details[type as keyof typeof details]} - ${severity} severity`;
    };

    // Generate threats more frequently during emergency
    const interval = setInterval(() => {
      if (Math.random() > (isEmergencyMode ? 0.3 : 0.7)) {
        const newThreat = generateThreatEvent();
        setThreatEvents(prev => [newThreat, ...prev.slice(0, 19)]); // Keep last 20 events
        
        // Update metrics
        setThreatMetrics(prev => ({
          total_attempts: prev.total_attempts + 1,
          blocked_attempts: newThreat.status === 'blocked' ? prev.blocked_attempts + 1 : prev.blocked_attempts,
          active_threats: prev.active_threats + (newThreat.status === 'active' ? 1 : 0),
          blocked_ips: newThreat.status === 'blocked' && !prev.blocked_ips.includes(newThreat.source_ip) 
            ? [...prev.blocked_ips, newThreat.source_ip] 
            : prev.blocked_ips,
          threat_level: newThreat.severity === 'critical' ? 'critical' : 
                       newThreat.severity === 'high' ? 'high' : prev.threat_level
        }));

        setLastUpdate(new Date().toLocaleString());

        // Show notification for critical threats
        if (newThreat.severity === 'critical') {
          toast({
            title: "🚨 Critical Threat Detected",
            description: `${newThreat.type.toUpperCase()} from ${newThreat.source_ip}`,
            variant: "destructive"
          });
        }
      }
    }, isEmergencyMode ? 2000 : 5000); // Faster during emergency

    return () => clearInterval(interval);
  }, [isLiveMode, isEmergencyMode, toast]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'blocked': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const blockThreat = (eventId: string, ip: string) => {
    setThreatEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, status: 'blocked' as const }
          : event
      )
    );
    
    toast({
      title: "🚫 Threat Blocked",
      description: `IP ${ip} has been blocked and threat neutralized`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Emergency Mode Alert */}
      {isEmergencyMode && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>🚨 EMERGENCY THREAT DETECTION ACTIVE</strong><br />
            Live monitoring enabled since {emergencyActivatedAt ? new Date(emergencyActivatedAt).toLocaleString() : 'lockdown activation'}
          </AlertDescription>
        </Alert>
      )}

      {/* Live Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Shield className="h-5 w-5" />
              Live Threat Detection
              {isLiveMode && (
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600 dark:text-red-400 font-normal">LIVE</span>
                </div>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsLiveMode(!isLiveMode)}
                variant={isLiveMode ? "destructive" : "default"}
                size="sm"
                disabled={isEmergencyMode} // Can't turn off during emergency
              >
                {isLiveMode ? <Eye className="h-4 w-4 mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
                {isLiveMode ? 'Stop Live Mode' : 'Start Live Mode'}
              </Button>
            </div>
          </div>
          {isLiveMode && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Last updated: {lastUpdate}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Threat Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{threatMetrics.total_attempts}</div>
            <p className="text-xs text-red-700 dark:text-red-300">
              {isLiveMode ? 'Real-time monitoring' : 'Historical data'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <Ban className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{threatMetrics.blocked_attempts}</div>
            <p className="text-xs text-green-700 dark:text-green-300">
              {Math.round((threatMetrics.blocked_attempts / Math.max(threatMetrics.total_attempts, 1)) * 100)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{threatMetrics.active_threats}</div>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getThreatLevelColor(threatMetrics.threat_level)} capitalize`}>
              {threatMetrics.threat_level}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Current system threat level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Threat Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Activity className="h-5 w-5" />
            Live Threat Events
            {isLiveMode && (
              <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                ({threatEvents.length} recent events)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {threatEvents.map((event) => (
              <div key={event.id} className="p-4 border rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                      {event.details}
                    </h4>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>Source: <span className="font-mono">{event.source_ip}</span></span>
                      <span>Target: <span className="font-mono">{event.target}</span></span>
                      <span>{new Date(event.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {event.status === 'active' && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        onClick={() => blockThreat(event.id, event.source_ip)}
                        variant="destructive" 
                        size="sm"
                        className="text-white"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Block
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {threatEvents.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                {isLiveMode ? 'No threats detected - system secure' : 'Start live mode to monitor threats in real-time'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
