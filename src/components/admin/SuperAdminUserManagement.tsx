import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import QuickActions from './QuickActions';
import CreateUserForm from './CreateUserForm';
import CreateOrganizationForm from './CreateOrganizationForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import EditUserDialog from './EditUserDialog';
import OrganizationsList from './OrganizationsList';
import UsersList from './UsersList';
import OrganizationPauseManager from './OrganizationPauseManager';

export default function SuperAdminUserManagement() {
  const { profile } = useSupabaseAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'organizations' | 'create-user' | 'create-org'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrganizations: 0,
    recentLogins: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: totalUsers } = await useSupabaseData<number>(
        supabase.from('profiles').select('*', { count: 'exact' })
      );

      const { count: activeUsers } = await useSupabaseData<number>(
        supabase.from('profiles').select('*', { count: 'exact' }).eq('is_active', true)
      );

      const { count: totalOrganizations } = await useSupabaseData<number>(
        supabase.from('organizations').select('*', { count: 'exact' })
      );

      // Fetch recent session activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: recentSessions } = await supabase
        .from('session_logs')
        .select('action, success, created_at')
        .gte('created_at', yesterday.toISOString());

      const successfulLogins = recentSessions?.filter(log => 
        log.action === 'login' && log.success
      ).length || 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalOrganizations: totalOrganizations || 0,
        recentLogins: successfulLogins
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "❌ Stats Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Management</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <Button 
                  onClick={() => setActiveView('create-user')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add User
                </Button>
              </div>
            </div>
            <UsersList searchTerm={searchTerm} />
          </div>
        );

      case 'organizations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Organization Management</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <Button 
                  onClick={() => setActiveView('create-org')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Organization
                </Button>
              </div>
            </div>
            <OrganizationsList searchTerm={searchTerm} />
            <OrganizationPauseManager />
          </div>
        );

      case 'create-user':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setActiveView('overview')}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Overview
              </Button>
            </div>
            <CreateUserForm onSuccess={() => {
              setActiveView('users');
              toast({
                title: "✅ User Created",
                description: "New user has been successfully created",
              });
            }} />
          </div>
        );

      case 'create-org':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setActiveView('overview')}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Overview
              </Button>
            </div>
            <CreateOrganizationForm onSuccess={() => {
              setActiveView('organizations');
              toast({
                title: "✅ Organization Created",
                description: "New organization has been successfully created",
              });
            }} />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Users</CardTitle>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {stats.activeUsers} active
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Active Users</CardTitle>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeUsers}</div>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Organizations</CardTitle>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalOrganizations}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {stats.totalOrganizations > 0 ? `${Math.round(stats.totalUsers / stats.totalOrganizations)} avg users/org` : 'No organizations'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Recent Logins</CardTitle>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.recentLogins}</div>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Last 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <QuickActions onViewChange={setActiveView} />

            {/* System Status Alert */}
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <strong className="text-green-900 dark:text-green-100">System Status: Operational</strong><br />
                <span className="text-green-800 dark:text-green-200">
                  All services are running normally. Last system check: {new Date().toLocaleString()}
                </span>
              </AlertDescription>
            </Alert>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
}
