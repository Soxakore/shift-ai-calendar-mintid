import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  Shield,
  Search,
  Calendar,
  User,
  Building,
  Trash2,
  UserPlus,
  LogIn,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  target_user_id: string | null;
  target_organization_id: string | null;
  metadata: any;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

interface SessionLog {
  id: string;
  user_id: string;
  action: string;
  session_id: string | null;
  success: boolean;
  failure_reason: string | null;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

const HistoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pageMetadata = getPageMetadata('dashboard');
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [activeTab, setActiveTab] = useState<'audit' | 'session'>('audit');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      } else {
        // Type cast to handle the ip_address field properly
        setAuditLogs(data?.map(log => ({
          ...log,
          ip_address: log.ip_address ? String(log.ip_address) : null
        })) || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
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
      } else {
        // Type cast to handle the ip_address field properly
        setSessionLogs(data?.map(log => ({
          ...log,
          ip_address: log.ip_address ? String(log.ip_address) : null
        })) || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to load session logs.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAuditLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        console.error('Error deleting audit log:', error);
        toast({
          title: "❌ Error deleting audit log",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setAuditLogs(auditLogs.filter(log => log.id !== logId));
        toast({
          title: "✅ Audit log deleted",
          description: "The audit log entry has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to delete audit log.',
        variant: "destructive"
      });
    }
  };

  const deleteSessionLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('session_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        console.error('Error deleting session log:', error);
        toast({
          title: "❌ Error deleting session log",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setSessionLogs(sessionLogs.filter(log => log.id !== logId));
        toast({
          title: "✅ Session log deleted",
          description: "The session log entry has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to delete session log.',
        variant: "destructive"
      });
    }
  };

  const deleteAllAuditLogs = async () => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('Error deleting all audit logs:', error);
        toast({
          title: "❌ Error deleting audit logs",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setAuditLogs([]);
        toast({
          title: "✅ All audit logs deleted",
          description: "All audit log entries have been deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to delete all audit logs.',
        variant: "destructive"
      });
    }
  };

  const deleteAllSessionLogs = async () => {
    try {
      const { error } = await supabase
        .from('session_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('Error deleting all session logs:', error);
        toast({
          title: "❌ Error deleting session logs",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setSessionLogs([]);
        toast({
          title: "✅ All session logs deleted",
          description: "All session log entries have been deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to delete all session logs.',
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    } else {
      fetchSessionLogs();
    }
  }, [activeTab]);

  const cleanSearchTerm = searchTerm.replace(/[^\w\s-]/g, '').trim();

  const filteredAuditLogs = auditLogs.filter(log =>
    log.action_type.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
    (log.metadata?.deleted_user_name && log.metadata.deleted_user_name.toLowerCase().includes(cleanSearchTerm.toLowerCase())) ||
    (log.metadata?.organization_name && log.metadata.organization_name.toLowerCase().includes(cleanSearchTerm.toLowerCase())) ||
    (log.metadata?.deleted_by_username && log.metadata.deleted_by_username.toLowerCase().includes(cleanSearchTerm.toLowerCase()))
  );

  const filteredSessionLogs = sessionLogs.filter(log =>
    log.action.toLowerCase().includes(cleanSearchTerm.toLowerCase())
  );

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'user_deleted': return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'organization_deleted': return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'organization_created': return <Building className="h-4 w-4 text-green-500" />;
      case 'user_created': return <UserPlus className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSessionIcon = (action: string) => {
    switch (action) {
      case 'login': return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout': return <LogOut className="h-4 w-4 text-red-500" />;
      default: return <User className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'user_deleted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'organization_deleted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'organization_created': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'user_created': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const formatActionDescription = (log: AuditLog) => {
    switch (log.action_type) {
      case 'user_deleted':
        return `User "${log.metadata?.deleted_user_name || 'Unknown'}" was deleted by ${log.metadata?.deleted_by_display_name || log.metadata?.deleted_by_username || 'Unknown'}`;
      case 'organization_deleted':
        return `Organization "${log.metadata?.organization_name || 'Unknown'}" was deleted by ${log.metadata?.deleted_by_display_name || log.metadata?.deleted_by_username || 'Unknown'}`;
      case 'organization_created':
        return `Organization "${log.metadata?.organization_name || 'Unknown'}" was created by ${log.metadata?.created_by_display_name || log.metadata?.created_by_username || 'Unknown'}`;
      case 'user_created':
        return `User was created by ${log.metadata?.created_by_display_name || log.metadata?.created_by_username || 'System'}`;
      default:
        return log.action_type.replace(/_/g, ' ').toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <SEOHead
        title={`${pageMetadata.title} - History`}
        description="Complete system history and audit logs"
        keywords={pageMetadata.keywords}
        canonicalUrl={`${pageMetadata.canonical}/history`}
        pageName="dashboard"
      />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/super-admin')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    System Audit History
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Complete audit trail of system activities and user sessions
                  </p>
                </div>
              </div>
            </div>
            
            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <Button
                variant={activeTab === 'audit' ? 'default' : 'outline'}
                onClick={() => setActiveTab('audit')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Audit Logs ({filteredAuditLogs.length})
              </Button>
              <Button
                variant={activeTab === 'session' ? 'default' : 'outline'}
                onClick={() => setActiveTab('session')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Session Logs ({filteredSessionLogs.length})
              </Button>
            </div>

            {/* Delete All Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All {activeTab === 'audit' ? 'Audit' : 'Session'} Logs
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All {activeTab === 'audit' ? 'Audit' : 'Session'} Logs</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all {activeTab === 'audit' ? 'audit' : 'session'} log entries from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={activeTab === 'audit' ? deleteAllAuditLogs : deleteAllSessionLogs}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Audit Logs */}
          {activeTab === 'audit' && (
            <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-800 dark:to-blue-700 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Audit Events ({filteredAuditLogs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAuditLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action_type)}
                              <Badge className={getActionColor(log.action_type)}>
                                {log.action_type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <p className="text-sm">{formatActionDescription(log)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-mono">
                              {log.ip_address || 'Not available'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Calendar className="h-4 w-4" />
                              {new Date(log.created_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Audit Log</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this audit log entry? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteAuditLog(log.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredAuditLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                            No audit events found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Session Logs */}
          {activeTab === 'session' && (
            <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-800 dark:to-green-700 border-b">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Session Events ({filteredSessionLogs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Success</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessionLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getSessionIcon(log.action)}
                              <Badge variant={log.success ? "default" : "destructive"}>
                                {log.action.toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={log.success ? "default" : "destructive"}>
                              {log.success ? "Success" : "Failed"}
                            </Badge>
                            {log.failure_reason && (
                              <p className="text-xs text-slate-500 mt-1">{log.failure_reason}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-mono">
                              {log.ip_address || 'Not available'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Calendar className="h-4 w-4" />
                              {new Date(log.created_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Session Log</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this session log entry? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteSessionLog(log.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredSessionLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                            No session events found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
