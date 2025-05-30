
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Shield, 
  History,
  User,
  Building2,
  Calendar,
  MapPin,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Eye,
  UserPlus,
  LogIn,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  target_user_id?: string;
  target_organization_id?: string;
  ip_address?: string;
  user_agent?: string;
  location_data?: any;
  metadata?: any;
  created_at: string;
  profiles?: {
    display_name: string;
    username: string;
  };
  target_profiles?: {
    display_name: string;
    username: string;
  };
}

interface SessionLog {
  id: string;
  user_id: string;
  session_id?: string;
  action: 'login' | 'logout' | 'session_refresh';
  ip_address?: string;
  user_agent?: string;
  location_data?: any;
  success: boolean;
  failure_reason?: string;
  created_at: string;
  profiles: {
    display_name: string;
    username: string;
  };
}

interface SecurityHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetOrgId?: string;
}

export default function SecurityHistoryPanel({ 
  isOpen, 
  onClose, 
  targetUserId, 
  targetOrgId 
}: SecurityHistoryPanelProps) {
  const { profile } = useSupabaseAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('audit');

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'login': return <LogIn className="h-4 w-4 text-green-600" />;
      case 'logout': return <LogOut className="h-4 w-4 text-orange-600" />;
      case 'session_refresh': return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'user_created': return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'user_updated': return <User className="h-4 w-4 text-blue-600" />;
      case 'user_deleted': return <User className="h-4 w-4 text-red-600" />;
      case 'org_created': return <Building2 className="h-4 w-4 text-green-600" />;
      case 'org_updated': return <Building2 className="h-4 w-4 text-blue-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'login': 
      case 'user_created': 
      case 'org_created': return 'default';
      case 'logout': return 'secondary';
      case 'user_deleted': return 'destructive';
      case 'session_refresh':
      case 'user_updated':
      case 'org_updated': return 'outline';
      default: return 'secondary';
    }
  };

  const fetchAuditLogs = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id(display_name, username),
          target_profiles:target_user_id(display_name, username)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter by target user if specified
      if (targetUserId) {
        query = query.or(`user_id.eq.${targetUserId},target_user_id.eq.${targetUserId}`);
      }

      // Filter by organization if specified
      if (targetOrgId) {
        query = query.eq('target_organization_id', targetOrgId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        return;
      }

      // Type-safe mapping to handle potential type mismatches
      const mappedData: AuditLog[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        action_type: item.action_type,
        target_user_id: item.target_user_id,
        target_organization_id: item.target_organization_id,
        ip_address: item.ip_address ? String(item.ip_address) : undefined,
        user_agent: item.user_agent,
        location_data: item.location_data,
        metadata: item.metadata,
        created_at: item.created_at,
        profiles: item.profiles,
        target_profiles: item.target_profiles
      }));

      setAuditLogs(mappedData);
    } catch (error) {
      console.error('Exception fetching audit logs:', error);
    }
  };

  const fetchSessionLogs = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('session_logs')
        .select(`
          *,
          profiles:user_id(display_name, username)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter by target user if specified
      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching session logs:', error);
        return;
      }

      // Type-safe mapping to handle potential type mismatches
      const mappedData: SessionLog[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        session_id: item.session_id,
        action: item.action as 'login' | 'logout' | 'session_refresh',
        ip_address: item.ip_address ? String(item.ip_address) : undefined,
        user_agent: item.user_agent,
        location_data: item.location_data,
        success: item.success,
        failure_reason: item.failure_reason,
        created_at: item.created_at,
        profiles: item.profiles
      }));

      setSessionLogs(mappedData);
    } catch (error) {
      console.error('Exception fetching session logs:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAuditLogs(), fetchSessionLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && profile) {
      fetchData();
    }
  }, [isOpen, profile, targetUserId, targetOrgId]);

  const formatActionDescription = (log: AuditLog) => {
    const actor = log.profiles?.display_name || 'Unknown User';
    const target = log.target_profiles?.display_name || 'Unknown Target';
    
    switch (log.action_type) {
      case 'user_created':
        return `${actor} created user: ${target}`;
      case 'user_updated':
        return `${actor} updated user: ${target}`;
      case 'user_deleted':
        return `${actor} deleted user: ${target}`;
      case 'org_created':
        return `${actor} created organization`;
      case 'org_updated':
        return `${actor} updated organization`;
      case 'login':
        return `${actor} logged in`;
      case 'logout':
        return `${actor} logged out`;
      default:
        return `${actor} performed ${log.action_type}`;
    }
  };

  const formatSessionDescription = (log: SessionLog) => {
    const actor = log.profiles?.display_name || 'Unknown User';
    const status = log.success ? 'successful' : 'failed';
    
    switch (log.action) {
      case 'login':
        return `${actor} ${status} login${log.failure_reason ? ` (${log.failure_reason})` : ''}`;
      case 'logout':
        return `${actor} logged out`;
      case 'session_refresh':
        return `${actor} refreshed session`;
      default:
        return `${actor} ${log.action}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Shield className="h-5 w-5 text-blue-600" />
            Security & Activity History
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            View security logs and user activity for monitoring and audit purposes
          </DialogDescription>
        </DialogHeader>

        {profile?.user_type === 'super_admin' && (
          <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-700">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Super Admin View:</strong> You can see all security logs across the system.
              {targetUserId && ' Filtered by specific user.'}
              {targetOrgId && ' Filtered by organization.'}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="audit" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <History className="h-4 w-4" />
              Audit Logs ({auditLogs.length})
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Monitor className="h-4 w-4" />
              Session Logs ({sessionLogs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="mt-4 overflow-auto max-h-96">
            {loading ? (
              <div className="text-center py-8">Loading audit logs...</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <Card key={log.id} className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getActionIcon(log.action_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {formatActionDescription(log)}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                            </span>
                            {log.ip_address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {log.ip_address}
                              </span>
                            )}
                            {log.user_agent && (
                              <span className="flex items-center gap-1 truncate max-w-48">
                                <Monitor className="h-3 w-3" />
                                {log.user_agent.split(' ')[0]}
                              </span>
                            )}
                          </div>
                          {log.metadata && (
                            <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700 rounded text-xs">
                              <strong>Details:</strong> {JSON.stringify(log.metadata, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={getActionColor(log.action_type)}>
                        {log.action_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sessions" className="mt-4 overflow-auto max-h-96">
            {loading ? (
              <div className="text-center py-8">Loading session logs...</div>
            ) : sessionLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No session logs found
              </div>
            ) : (
              <div className="space-y-3">
                {sessionLogs.map((log) => (
                  <Card key={log.id} className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getActionIcon(log.action)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {formatSessionDescription(log)}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                            </span>
                            {log.ip_address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {log.ip_address}
                              </span>
                            )}
                            {log.session_id && (
                              <span className="flex items-center gap-1 font-mono">
                                <Shield className="h-3 w-3" />
                                {log.session_id.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                          {log.user_agent && (
                            <div className="mt-1 text-xs text-muted-foreground truncate">
                              <Monitor className="h-3 w-3 inline mr-1" />
                              {log.user_agent}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {log.action}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="border-slate-300 dark:border-slate-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={onClose} className="border-slate-300 dark:border-slate-600">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
