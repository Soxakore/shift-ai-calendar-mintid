
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Shield, Clock, User, MapPin, Monitor, AlertCircle, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  } | null;
  target_profiles?: {
    display_name: string;
    username: string;
  } | null;
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
  profiles?: {
    display_name: string;
    username: string;
  } | null;
}

interface SecurityHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecurityHistoryPanel({ isOpen, onClose }: SecurityHistoryPanelProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('audit');
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        toast({
          title: "❌ Error fetching audit logs",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Transform the data to match our interface
      const transformedData: AuditLog[] = (data || []).map(log => ({
        id: log.id,
        user_id: log.user_id,
        action_type: log.action_type,
        target_user_id: log.target_user_id,
        target_organization_id: log.target_organization_id,
        ip_address: log.ip_address ? String(log.ip_address) : undefined,
        user_agent: log.user_agent,
        location_data: log.location_data,
        metadata: log.metadata,
        created_at: log.created_at,
        profiles: null,
        target_profiles: null
      }));

      setAuditLogs(transformedData);
    } catch (error) {
      console.error('Unexpected error fetching audit logs:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to load audit logs.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('session_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching session logs:', error);
        toast({
          title: "❌ Error fetching session logs",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Transform the data to match our interface
      const transformedData: SessionLog[] = (data || []).map(log => ({
        id: log.id,
        user_id: log.user_id,
        session_id: log.session_id,
        action: log.action as 'login' | 'logout' | 'session_refresh',
        ip_address: log.ip_address ? String(log.ip_address) : undefined,
        user_agent: log.user_agent,
        location_data: log.location_data,
        success: log.success,
        failure_reason: log.failure_reason,
        created_at: log.created_at,
        profiles: null
      }));

      setSessionLogs(transformedData);
    } catch (error) {
      console.error('Unexpected error fetching session logs:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to load session logs.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'audit') {
        fetchAuditLogs();
      } else {
        fetchSessionLogs();
      }
    }
  }, [isOpen, activeTab]);

  const renderAuditLogItem = (log: AuditLog) => (
    <div key={log.id} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">{log.action_type}</Badge>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              by {log.profiles?.display_name || 'Unknown User'}
            </span>
            {log.target_profiles && (
              <span className="text-sm text-slate-600 dark:text-slate-400">
                → {log.target_profiles.display_name}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
              </div>
              {log.ip_address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {log.ip_address}
                </div>
              )}
            </div>
            {log.user_agent && (
              <div className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                <span className="truncate max-w-md">{log.user_agent}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessionLogItem = (log: SessionLog) => (
    <div key={log.id} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {log.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <Badge variant={log.action === 'login' ? 'default' : 'secondary'}>
              {log.action}
            </Badge>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {log.profiles?.display_name || 'Unknown User'}
            </span>
            {!log.success && (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
              </div>
              {log.ip_address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {log.ip_address}
                </div>
              )}
            </div>
            {log.failure_reason && (
              <div className="text-red-600 dark:text-red-400">
                Reason: {log.failure_reason}
              </div>
            )}
            {log.user_agent && (
              <div className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                <span className="truncate max-w-md">{log.user_agent}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Security & Activity History
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Audit Logs ({auditLogs.length})
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session Logs ({sessionLogs.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No audit logs found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {auditLogs.map(renderAuditLogItem)}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Login & Session Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : sessionLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No session logs found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessionLogs.map(renderSessionLogItem)}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
