
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, AlertTriangle, Zap, Eye, Ban, Target,
  Globe, Lock, Activity, Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HackingAttempt {
  id: string;
  type: 'brute_force' | 'sql_injection' | 'xss' | 'ddos' | 'malware' | 'phishing';
  source_ip: string;
  target: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'blocked' | 'investigating' | 'resolved';
  attempts_count: number;
  location?: string;
  user_agent?: string;
  blocked_automatically: boolean;
}

interface ThreatMetrics {
  total_attempts: number;
  blocked_attempts: number;
  unique_attackers: number;
  high_severity_count: number;
  last_24h_attempts: number;
}

export default function HackingAttemptMonitor() {
  const { toast } = useToast();
  const [hackingAttempts, setHackingAttempts] = useState<HackingAttempt[]>([
    {
      id: '1',
      type: 'brute_force',
      source_ip: '192.168.1.100',
      target: '/api/auth/login',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
      severity: 'high',
      status: 'blocked',
      attempts_count: 47,
      location: 'Unknown',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      blocked_automatically: true
    },
    {
      id: '2',
      type: 'sql_injection',
      source_ip: '10.0.0.50',
      target: '/api/users/search',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
      severity: 'critical',
      status: 'investigating',
      attempts_count: 12,
      location: 'Russia',
      user_agent: 'curl/7.68.0',
      blocked_automatically: true
    },
    {
      id: '3',
      type: 'ddos',
      source_ip: '172.16.0.25',
      target: '/api/public/data',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
      severity: 'medium',
      status: 'detected',
      attempts_count: 1523,
      location: 'China',
      blocked_automatically: false
    }
  ]);

  const [threatMetrics, setThreatMetrics] = useState<ThreatMetrics>({
    total_attempts: 1582,
    blocked_attempts: 1570,
    unique_attackers: 23,
    high_severity_count: 8,
    last_24h_attempts: 1582
  });

  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  // Simulate real-time monitoring
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      // Randomly generate new attacks for demo
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const attackTypes: HackingAttempt['type'][] = ['brute_force', 'sql_injection', 'xss', 'ddos', 'malware'];
        const severities: HackingAttempt['severity'][] = ['low', 'medium', 'high', 'critical'];
        const ips = ['192.168.1.101', '10.0.0.51', '172.16.0.26', '203.0.113.42'];
        
        const newAttempt: HackingAttempt = {
          id: Date.now().toString(),
          type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
          source_ip: ips[Math.floor(Math.random() * ips.length)],
          target: '/api/auth/login',
          timestamp: new Date().toISOString(),
          severity: severities[Math.floor(Math.random() * severities.length)],
          status: 'detected',
          attempts_count: Math.floor(Math.random() * 50) + 1,
          location: 'Unknown',
          blocked_automatically: Math.random() > 0.3
        };

        setHackingAttempts(prev => [newAttempt, ...prev.slice(0, 19)]); // Keep last 20
        
        if (newAttempt.severity === 'critical' || newAttempt.severity === 'high') {
          toast({
            title: "🚨 High Severity Attack Detected",
            description: `${newAttempt.type.replace('_', ' ').toUpperCase()} from ${newAttempt.source_ip}`,
            variant: "destructive"
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeEnabled, toast]);

  const blockIP = (ip: string) => {
    setHackingAttempts(prev => 
      prev.map(attempt => 
        attempt.source_ip === ip 
          ? { ...attempt, status: 'blocked' as const, blocked_automatically: true }
          : attempt
      )
    );
    
    toast({
      title: "🚫 IP Address Blocked",
      description: `${ip} has been added to the blocklist`,
    });
  };

  const investigateAttempt = (id: string) => {
    setHackingAttempts(prev => 
      prev.map(attempt => 
        attempt.id === id 
          ? { ...attempt, status: 'investigating' as const }
          : attempt
      )
    );
    
    toast({
      title: "🔍 Investigation Started",
      description: "Security team has been notified",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'brute_force': return <Target className="h-4 w-4" />;
      case 'sql_injection': return <Zap className="h-4 w-4" />;
      case 'ddos': return <Activity className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blocked': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'investigating': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'detected': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Threat Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Total Attempts</CardTitle>
            <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{threatMetrics.total_attempts}</div>
            <p className="text-xs text-red-700 dark:text-red-300">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Blocked</CardTitle>
            <Ban className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{threatMetrics.blocked_attempts}</div>
            <p className="text-xs text-green-700 dark:text-green-300">
              {Math.round((threatMetrics.blocked_attempts / threatMetrics.total_attempts) * 100)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Unique Attackers</CardTitle>
            <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{threatMetrics.unique_attackers}</div>
            <p className="text-xs text-purple-700 dark:text-purple-300">Different IP addresses</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">High Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{threatMetrics.high_severity_count}</div>
            <p className="text-xs text-orange-700 dark:text-orange-300">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Real-time Monitor</CardTitle>
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={realTimeEnabled ? "default" : "secondary"} className="text-white">
                {realTimeEnabled ? "ACTIVE" : "PAUSED"}
              </Badge>
            </div>
            <Button 
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              variant="outline" 
              size="sm" 
              className="mt-2 text-blue-900 dark:text-blue-100 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {realTimeEnabled ? "Pause" : "Start"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {hackingAttempts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length > 0 && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>🚨 CRITICAL THREATS DETECTED</strong><br />
            {hackingAttempts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length} critical security threats require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Real-time Hacking Attempts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Shield className="h-5 w-5" />
              Live Threat Detection
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 dark:text-green-400">MONITORING</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hackingAttempts.map((attempt) => (
              <div key={attempt.id} className="p-4 border rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(attempt.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {attempt.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <Badge className={getSeverityColor(attempt.severity)}>
                          {attempt.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(attempt.status)}>
                          {attempt.status.toUpperCase()}
                        </Badge>
                        {attempt.blocked_automatically && (
                          <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-500">
                            AUTO-BLOCKED
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span><strong>Source IP:</strong> {attempt.source_ip}</span>
                        <span><strong>Target:</strong> {attempt.target}</span>
                        <span><strong>Attempts:</strong> {attempt.attempts_count}</span>
                        <span><strong>Location:</strong> {attempt.location || 'Unknown'}</span>
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(attempt.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {attempt.status === 'detected' && (
                      <>
                        <Button
                          onClick={() => blockIP(attempt.source_ip)}
                          variant="destructive"
                          size="sm"
                          className="text-white"
                        >
                          Block IP
                        </Button>
                        <Button
                          onClick={() => investigateAttempt(attempt.id)}
                          variant="outline"
                          size="sm"
                          className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                          Investigate
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {hackingAttempts.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No threats detected in the monitoring period
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
