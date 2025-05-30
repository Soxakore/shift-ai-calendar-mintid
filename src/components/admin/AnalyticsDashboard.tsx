
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, Building, Activity, Shield, Clock, TrendingUp,
  Download, RefreshCw, Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  userStats: {
    total: number;
    active: number;
    byRole: { role: string; count: number }[];
    recentLogins: number;
  };
  organizationStats: {
    total: number;
    withUsers: number;
    averageUsers: number;
  };
  activityStats: {
    totalLogins: number;
    failedLogins: number;
    recentActions: number;
  };
  securityEvents: {
    suspiciousLogins: number;
    blockedAttempts: number;
    passwordResets: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch user statistics
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_type, is_active, created_at, organization_id');

      const { data: organizations } = await supabase
        .from('organizations')
        .select('id, created_at');

      const { data: sessionLogs } = await supabase
        .from('session_logs')
        .select('action, success, created_at')
        .gte('created_at', new Date(Date.now() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString());

      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('action_type, created_at')
        .gte('created_at', new Date(Date.now() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString());

      // Process data
      const userStats = {
        total: profiles?.length || 0,
        active: profiles?.filter(p => p.is_active)?.length || 0,
        byRole: profiles?.reduce((acc: any[], profile) => {
          const existing = acc.find(item => item.role === profile.user_type);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ role: profile.user_type, count: 1 });
          }
          return acc;
        }, []) || [],
        recentLogins: sessionLogs?.filter(log => log.action === 'login' && log.success)?.length || 0
      };

      const organizationStats = {
        total: organizations?.length || 0,
        withUsers: new Set(profiles?.map(p => p.organization_id).filter(Boolean)).size,
        averageUsers: organizations?.length ? Math.round((profiles?.length || 0) / organizations.length) : 0
      };

      const activityStats = {
        totalLogins: sessionLogs?.filter(log => log.action === 'login')?.length || 0,
        failedLogins: sessionLogs?.filter(log => log.action === 'login' && !log.success)?.length || 0,
        recentActions: auditLogs?.length || 0
      };

      const securityEvents = {
        suspiciousLogins: sessionLogs?.filter(log => !log.success)?.length || 0,
        blockedAttempts: 0, // Would implement with proper security system
        passwordResets: 0 // Would track from auth events
      };

      setAnalytics({
        userStats,
        organizationStats,
        activityStats,
        securityEvents
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "❌ Analytics Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      ...analytics
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📊 Report Exported",
      description: "Analytics report has been downloaded",
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
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">System performance and user activity insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.userStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.userStats.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.organizationStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.organizationStats.averageUsers} avg users/org
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.userStats.recentLogins}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.activityStats.failedLogins} failed attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.securityEvents.suspiciousLogins}</div>
            <p className="text-xs text-muted-foreground">
              Suspicious activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Distribution</TabsTrigger>
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="security">Security Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.userStats.byRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ role, count }) => `${role}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics?.userStats.byRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Login Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics?.activityStats.totalLogins}</div>
                  <div className="text-sm text-slate-600">Total Logins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analytics?.activityStats.failedLogins}</div>
                  <div className="text-sm text-slate-600">Failed Attempts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Suspicious Login Attempts</span>
                  <Badge variant="destructive">{analytics?.securityEvents.suspiciousLogins}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Recent Audit Actions</span>
                  <Badge variant="default">{analytics?.activityStats.recentActions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>System Health</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
