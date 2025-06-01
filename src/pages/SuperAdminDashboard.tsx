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
import SuperAdminUserManagement from '@/components/admin/SuperAdminUserManagement';

interface User {
  id: string;
  display_name: string;
  email?: string;
  username?: string;
}

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

  // Mock data for users
  const [allUsers, setAllUsers] = useState([
    { 
      id: '1', 
      username: 'john.doe', 
      display_name: 'John Doe',
      user_type: 'employee', 
      organization_id: 'org1', 
      is_active: true,
      created_at: new Date().toISOString()
    },
    { 
      id: '2', 
      username: 'jane.smith', 
      display_name: 'Jane Smith',
      user_type: 'manager', 
      organization_id: 'org2', 
      is_active: false,
      created_at: new Date().toISOString()
    },
    { 
      id: '3', 
      username: 'super.admin', 
      display_name: 'Super Admin',
      user_type: 'super_admin', 
      organization_id: 'org1', 
      is_active: true,
      created_at: new Date().toISOString()
    },
  ]);

  const handleEditUser = (user: User) => {
    toast({
      title: "✏️ Edit User",
      description: `Editing user ${user.display_name}`,
    });
    // Implementation would go here
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    toast({
      title: "🗑️ Delete User",
      description: `Deleting user ${userName}`,
    });
    // Implementation would go here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />
      
      {/* Enhanced Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    MinTid Super Admin
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm">
                      ADMIN CONSOLE
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">LIVE</span>
                    </div>
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
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Organizations</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">System Status</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{liveStats.systemStatus}</div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    All systems operational
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Active Users</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{liveStats.activeUsers}</div>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {liveStats.recentLogins} recent logins
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Organizations</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{liveStats.totalOrganizations}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Active organizations
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Security Score</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{liveStats.securityScore}%</div>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Excellent security
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Management Component */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl">
              <RoleBasedUserManagement />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl p-6">
              <SuperAdminUserManagement />
            </div>
          </TabsContent>

          <TabsContent value="organizations" className="space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl p-6">
              <OrganizationManagement />
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl p-6">
              <SecurityMonitoring />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
