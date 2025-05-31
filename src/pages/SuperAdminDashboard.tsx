
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  LogOut,
  Users,
  Building,
  BarChart3,
  Shield,
  Settings,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import EnhancedUserManagement from '@/components/admin/EnhancedUserManagement';
import SecurityMonitoring from '@/components/admin/SecurityMonitoring';
import SystemSettings from '@/components/admin/SystemSettings';
import GlobalNavigation from '@/components/admin/GlobalNavigation';
import NotificationDropdown from '@/components/admin/NotificationDropdown';
import HistoryButton from '@/components/admin/HistoryButton';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import TwoFactorManagement from '@/components/admin/TwoFactorManagement';
import { supabase } from '@/integrations/supabase/client';
import OrganizationManagement from '@/components/admin/OrganizationManagement';
import RoleBasedUserManagement from '@/components/admin/RoleBasedUserManagement';

const SuperAdminDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { signOut, profile } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('/super-admin');
  
  // Live dashboard stats
  const [liveStats, setLiveStats] = useState({
    systemStatus: 'Optimal',
    activeUsers: 0,
    totalOrganizations: 0,
    securityScore: 98,
    recentLogins: 0,
    failedLogins: 0
  });

  // Fetch live dashboard data
  const fetchLiveStats = async () => {
    try {
      // Get total active users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, is_active, created_at')
        .eq('is_active', true);

      // Get total organizations
      const { data: organizations, error: orgsError } = await supabase
        .from('organizations')
        .select('id');

      // Get recent session activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: recentSessions, error: sessionsError } = await supabase
        .from('session_logs')
        .select('action, success, created_at')
        .gte('created_at', yesterday.toISOString());

      if (!profilesError && !orgsError && !sessionsError) {
        const successfulLogins = recentSessions?.filter(log => 
          log.action === 'login' && log.success
        ).length || 0;
        
        const failedLogins = recentSessions?.filter(log => 
          log.action === 'login' && !log.success
        ).length || 0;

        // Calculate security score based on system health
        let securityScore = 98; // Base score
        if (failedLogins > 10) securityScore -= 5;
        if (failedLogins > 20) securityScore -= 10;
        
        setLiveStats({
          systemStatus: failedLogins > 50 ? 'Warning' : 'Optimal',
          activeUsers: profiles?.length || 0,
          totalOrganizations: organizations?.length || 0,
          securityScore: Math.max(securityScore, 60), // Minimum 60%
          recentLogins: successfulLogins,
          failedLogins: failedLogins
        });
      }
    } catch (error) {
      console.error('Error fetching live stats:', error);
    }
  };

  // Set up real-time updates for dashboard stats
  useEffect(() => {
    // Initial fetch
    fetchLiveStats();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('Profile change detected, updating stats...');
          fetchLiveStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizations'
        },
        () => {
          console.log('Organization change detected, updating stats...');
          fetchLiveStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_logs'
        },
        () => {
          console.log('Session activity detected, updating stats...');
          fetchLiveStats();
        }
      )
      .subscribe((status) => {
        console.log('Dashboard real-time subscription status:', status);
      });

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchLiveStats, 30000);

    return () => {
      console.log('Cleaning up dashboard subscriptions...');
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "✅ Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "❌ Logout Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    
    // Map paths to tabs
    const pathToTab = {
      '/super-admin': 'overview',
      '/super-admin/users': 'users',
      '/super-admin/organizations': 'organizations',
      '/super-admin/analytics': 'analytics',
      '/super-admin/security': 'security',
      '/super-admin/2fa': '2fa',
      '/super-admin/system': 'system',
      '/history': 'history'
    };
    
    const tab = pathToTab[path as keyof typeof pathToTab];
    if (tab) {
      setActiveTab(tab);
    } else if (path === '/history') {
      navigate('/history');
    }
  };

  const handleBulkUserAction = (action: string, userIds: string[]) => {
    toast({
      title: "🔄 Bulk Action",
      description: `${action} applied to ${userIds.length} users`,
    });
    // Implementation would go here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />
      
      {/* Enhanced Header with Global Navigation */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    MinTid Super Admin
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm">
                      ENHANCED ADMIN CONSOLE
                    </Badge>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Complete System Management</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400">LIVE</span>
                    </div>
                    {profile?.tracking_id && (
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                        ID: {profile.tracking_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <HistoryButton variant="outline" size="sm" showBadge={true} />
              <NotificationDropdown />
              <ThemeToggle />
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                className="shadow-sm hover:shadow-md transition-shadow text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Navigation */}
      <GlobalNavigation
        currentPath={currentPath}
        onNavigate={handleNavigate}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Content with Enhanced Tabs */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="organizations" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">
              <Building className="h-4 w-4" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">
              <Shield className="h-4 w-4" />
              Security
              <Badge variant="destructive" className="text-xs text-white">New</Badge>
            </TabsTrigger>
            <TabsTrigger value="2fa" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">
              <Shield className="h-4 w-4" />
              2FA
              <Badge className="bg-blue-500 text-white text-xs">New</Badge>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">
              <Settings className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${liveStats.systemStatus === 'Optimal' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></div>
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{liveStats.systemStatus}</div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {liveStats.failedLogins > 0 ? `${liveStats.failedLogins} failed logins today` : 'All systems operational'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{liveStats.activeUsers}</div>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {liveStats.recentLogins > 0 ? `${liveStats.recentLogins} logins today` : 'No recent activity'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <Building className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{liveStats.totalOrganizations}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {liveStats.totalOrganizations > 0 ? `${Math.round(liveStats.activeUsers / Math.max(liveStats.totalOrganizations, 1))} avg users/org` : 'No organizations yet'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${liveStats.securityScore >= 90 ? 'bg-green-500' : liveStats.securityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                    <Shield className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{liveStats.securityScore}%</div>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    {liveStats.securityScore >= 90 ? 'Excellent security' : liveStats.securityScore >= 70 ? 'Good security' : 'Needs attention'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <RoleBasedUserManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <RoleBasedUserManagement />
          </TabsContent>

          <TabsContent value="organizations" className="space-y-6">
            <OrganizationManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityMonitoring />
          </TabsContent>

          <TabsContent value="2fa" className="space-y-6">
            <TwoFactorManagement />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
