import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  LogOut,
  Users,
  Building2,
  BarChart3,
  Shield,
  Settings,
  UserPlus,
  Sparkles,
  Activity,
  Workflow
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
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
import DataDebugComponent from '@/components/debug/DataDebugComponent';
import OrganisationManagement from '@/components/admin/OrganisationManagement';
import RoleBasedUserManagement from '@/components/admin/RoleBasedUserManagement';
import SuperAdminUserManagement from '@/components/admin/SuperAdminUserManagement';
import { LiveReportsManager } from '@/components/LiveReportsManager';
import UserManagement from '@/components/UserManagement';
import { LiveScheduleAutomation } from '@/components/LiveScheduleAutomation';
import { netlifyAPI, type StitchHealthResponse } from '@/lib/netlify-functions';

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
    totalOrganisations: 0,
    securityScore: 98,
    recentLogins: 0,
    failedLogins: 0
  });

  const [stitchHealth, setStitchHealth] = useState<StitchHealthResponse | null>(null);
  const [stitchLoading, setStitchLoading] = useState(false);

  const fetchStitchHealth = async () => {
    try {
      setStitchLoading(true);
      const health = await netlifyAPI.stitchHealth();
      setStitchHealth(health);
    } catch (error) {
      setStitchHealth({
        connected: false,
        configured: false,
        message: error instanceof Error ? error.message : 'Unable to reach Stitch connector',
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setStitchLoading(false);
    }
  };

  // Fetch live dashboard data
  const fetchLiveStats = async () => {
    try {
      // Get total active users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, is_active, created_at')
        .eq('is_active', true);

      // Get total organisations
      const { data: organisations, error: orgsError } = await supabase
        .from('organisations')
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
          totalOrganisations: organisations?.length || 0,
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
    fetchStitchHealth();

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
          table: 'organisations'
        },
        () => {
          console.log('Organisation change detected, updating stats...');
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
    const stitchInterval = setInterval(fetchStitchHealth, 3 * 60 * 1000);

    return () => {
      console.log('Cleaning up dashboard subscriptions...');
      supabase.removeChannel(channel);
      clearInterval(interval);
      clearInterval(stitchInterval);
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
      '/super-admin/organisations': 'organisations',
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

  // Note: Mock data and placeholder functions have been removed for production
  // All user management is now handled by the proper components:
  // - SuperAdminUserManagement for user management
  // - RoleBasedUserManagement for role-based operations
  // These components fetch real data from the Supabase database

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,#eef2ff_38%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,#0f172a_0%,#111827_38%,#020617_100%)]">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />

      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full opacity-40 dark:opacity-20" viewBox="0 0 1600 900" fill="none">
          <defs>
            <linearGradient id="super-admin-wave" x1="0" y1="0" x2="1600" y2="900">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <path d="M0 190C230 270 460 80 700 160C930 230 1160 430 1600 270V0H0V190Z" fill="url(#super-admin-wave)" fillOpacity="0.13" />
          <path d="M0 760C260 680 430 810 690 770C980 720 1260 530 1600 610V900H0V760Z" fill="url(#super-admin-wave)" fillOpacity="0.1" />
        </svg>
        <motion.div
          className="absolute -top-28 -left-16 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl"
          animate={{ x: [0, 35, 0], y: [0, 25, 0] }}
          transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror' }}
        />
        <motion.div
          className="absolute -bottom-20 right-10 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: 'mirror' }}
        />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-white/40 bg-white/50 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.6)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/60">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-rose-500 to-red-600 p-2.5 shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">MinaTid Super Admin</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <Badge className="border-0 bg-gradient-to-r from-rose-500 to-red-600 text-white">Executive Control Center</Badge>
                  <span className="text-slate-600 dark:text-slate-400">Live operations, security and governance</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                  {profile?.tracking_id && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      ID: {profile.tracking_id}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <HistoryButton variant="outline" size="sm" showBadge={true} />
              <NotificationDropdown />
              <ThemeToggle />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="text-white shadow-sm transition-shadow hover:shadow-md"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <GlobalNavigation
          currentPath={currentPath}
          onNavigate={handleNavigate}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-6 overflow-hidden rounded-3xl border border-white/50 bg-white/55 p-6 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.6)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/55"
          >
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-70 dark:opacity-40" viewBox="0 0 1200 260" fill="none">
              <path d="M0 70C220 130 470 10 700 80C870 130 1020 210 1200 170" stroke="rgba(59,130,246,0.2)" strokeWidth="2" />
              <path d="M0 210C220 150 430 260 660 220C890 190 1020 80 1200 100" stroke="rgba(20,184,166,0.18)" strokeWidth="2" />
            </svg>
            <div className="relative grid gap-6 lg:grid-cols-[1.8fr_1fr]">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-300/60 bg-sky-100/70 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-600/50 dark:bg-sky-900/40 dark:text-sky-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Glass Control Surface
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  System command with live visibility and cleaner operations flow
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Every panel and tab below keeps existing functionality while adding a structured, production-grade workspace.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70">
                  <div className="text-xs text-slate-500 dark:text-slate-400">System Health</div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    {liveStats.systemStatus}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Google Stitch MCP</div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <Workflow className={`h-4 w-4 ${stitchHealth?.connected ? 'text-emerald-500' : 'text-amber-500'}`} />
                    {stitchLoading ? 'Checking...' : stitchHealth?.connected ? 'Connected' : stitchHealth?.configured ? 'Unavailable' : 'Not configured'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Security Score</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{liveStats.securityScore}%</div>
                </div>
              </div>
            </div>
          </motion.section>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="rounded-2xl border border-white/40 bg-white/60 p-2 shadow-sm backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/60">
              <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent md:grid-cols-3 xl:grid-cols-9">
                <TabsTrigger value="overview" className="flex items-center gap-2 rounded-xl text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2 rounded-xl text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="user-roles" className="flex items-center gap-2 rounded-xl text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900">
                  <UserPlus className="h-4 w-4" />
                  Role Mgmt
                  <Badge className="bg-emerald-600 text-white text-xs">OAuth</Badge>
                </TabsTrigger>
                <TabsTrigger value="organisations" className="flex items-center gap-2 rounded-xl text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900">
                  <Building2 className="h-4 w-4" />
                  Organisations
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-xl text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="debug" className="flex items-center gap-2 rounded-xl text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900">
                  <Settings className="h-4 w-4" />
                  Debug
                  <Badge className="bg-red-500 text-white text-xs">Test</Badge>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2 rounded-xl text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900">
                  <Shield className="h-4 w-4" />
                  Security
                  <Badge variant="destructive" className="text-xs text-white">New</Badge>
                </TabsTrigger>
                <TabsTrigger value="2fa" className="flex items-center gap-2 rounded-xl text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900">
                  <Shield className="h-4 w-4" />
                  2FA
                  <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-2 rounded-xl text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900">
                  <Settings className="h-4 w-4" />
                  System
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.02 }}>
                  <Card className="border border-white/50 bg-white/65 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">System Status</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${liveStats.systemStatus === 'Optimal' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{liveStats.systemStatus}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {liveStats.failedLogins > 0 ? `${liveStats.failedLogins} failed logins today` : 'All systems operational'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 }}>
                  <Card className="border border-white/50 bg-white/65 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{liveStats.activeUsers}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {liveStats.recentLogins > 0 ? `${liveStats.recentLogins} logins today` : 'No recent activity'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                  <Card className="border border-white/50 bg-white/65 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Organisations</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                        <Building2 className="h-4 w-4 text-violet-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{liveStats.totalOrganisations}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {liveStats.totalOrganisations > 0 ? `${Math.round(liveStats.activeUsers / Math.max(liveStats.totalOrganisations, 1))} avg users/org` : 'No organisations yet'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.14 }}>
                  <Card className="border border-white/50 bg-white/65 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${liveStats.securityScore >= 90 ? 'bg-green-500' : liveStats.securityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                        <Shield className="h-4 w-4 text-orange-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{liveStats.securityScore}%</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {liveStats.securityScore >= 90 ? 'Excellent security' : liveStats.securityScore >= 70 ? 'Good security' : 'Needs attention'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <RoleBasedUserManagement />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <SuperAdminUserManagement />
            </TabsContent>

            <TabsContent value="user-roles" className="space-y-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="organisations" className="space-y-6">
              <OrganisationManagement />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard />

              <div className="mt-8">
                <LiveReportsManager />
              </div>

              <div className="mt-8">
                <LiveScheduleAutomation />
              </div>
            </TabsContent>

            <TabsContent value="debug" className="space-y-6">
              <DataDebugComponent />
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
    </div>
  );
};

export default SuperAdminDashboard;
