import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Calendar, User, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PasswordHistoryProps {
  employeeId?: string;
  organizationId: string;
}

interface PasswordHistoryEntry {
  id: string;
  user_id: string;
  changed_by: string;
  action: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  changed_by_name?: string;
  changed_by_profile?: { display_name: string };
}

const PasswordHistory: React.FC<PasswordHistoryProps> = ({ 
  employeeId, 
  organizationId 
}) => {
  const [history, setHistory] = useState<PasswordHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadPasswordHistory = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('password_histories')
        .select(`
          *,
          changed_by_profile:profiles!password_histories_changed_by_fkey(display_name)
        `)
        .eq('user_id', employeeId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedHistory = data.map(entry => ({
        ...entry,
        changed_by_name: entry.changed_by_profile?.display_name || 'System'
      }));

      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading password history:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load password history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'created':
        return 'default';
      case 'changed':
        return 'secondary';
      case 'reset':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return '🆕';
      case 'changed':
        return '🔄';
      case 'reset':
        return '🔒';
      default:
        return '📝';
    }
  };

  const exportHistory = () => {
    const csvData = history.map(entry => ({
      Date: new Date(entry.created_at).toLocaleDateString(),
      Time: new Date(entry.created_at).toLocaleTimeString(),
      Action: entry.action,
      'Changed By': entry.changed_by_name || 'System'
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `password-history-${employeeId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadPasswordHistory();
  }, [employeeId, organizationId, loadPasswordHistory]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Password History
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={loadPasswordHistory} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              {history.length > 0 && (
                <Button onClick={exportHistory} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold">{history.length}</div>
              <div className="text-sm text-muted-foreground">Total Changes</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">
                {history.filter(h => h.action === 'changed').length}
              </div>
              <div className="text-sm text-muted-foreground">Password Changes</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">
                {history.filter(h => h.action === 'reset').length}
              </div>
              <div className="text-sm text-muted-foreground">Resets</div>
            </Card>
          </div>

          {/* Password History Timeline */}
          <div className="space-y-3">
            {history.map((entry, index) => (
              <Card key={entry.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                      {getActionIcon(entry.action)}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        Password {entry.action}
                        <Badge variant={getActionBadgeVariant(entry.action)}>
                          {entry.action.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          By: {entry.changed_by_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.created_at).toLocaleDateString()} at{' '}
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {index === 0 && (
                        <Badge variant="outline" className="text-green-600">
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {history.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">🔐</div>
                <p>No password history found</p>
                <p className="text-sm">Password changes will appear here</p>
              </div>
            )}
            
            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading password history...</p>
              </div>
            )}
          </div>

          {/* Security Notes */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Security Information</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Password history is tracked for security and compliance</li>
                    <li>• All password changes are logged with administrator details</li>
                    <li>• Employees should change passwords every 90 days</li>
                    <li>• Reset actions may require employee verification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordHistory;
