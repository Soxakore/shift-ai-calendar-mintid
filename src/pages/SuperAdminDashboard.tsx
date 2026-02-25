import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  BarChart3,
  Building2,
  Calendar,
  LogOut,
  Search,
  Settings,
  Shield,
  UserPlus,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import SecurityMonitoring from '@/components/admin/SecurityMonitoring';
import SystemSettings from '@/components/admin/SystemSettings';
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

const SuperAdminDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { signOut, profile } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statsError, setStatsError] = useState<string | null>(null);
  
  // Live dashboard stats
  const [liveStats, setLiveStats] = useState({
    systemStatus: 'Optimal',
    activeUsers: 0,
    totalOrganisations: 0,
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

      if (profilesError || orgsError || sessionsError) {
        throw new Error(
          [profilesError?.message, orgsError?.message, sessionsError?.message]
            .filter(Boolean)
            .join(' | ')
        );
      }

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
      
      setStatsError(null);
      setLiveStats({
        systemStatus: failedLogins > 50 ? 'Warning' : 'Optimal',
        activeUsers: profiles?.length || 0,
        totalOrganisations: organisations?.length || 0,
        securityScore: Math.max(securityScore, 60), // Minimum 60%
        recentLogins: successfulLogins,
        failedLogins: failedLogins
      });
    } catch (error) {
      console.error('Error fetching live stats:', error);
      setStatsError(error instanceof Error ? error.message : 'Failed to load live dashboard data');
      setLiveStats(prev => ({
        ...prev,
        systemStatus: 'Warning'
      }));
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

  const adminName = profile?.display_name || profile?.username || profile?.email || 'Super Admin';
  const adminRole = profile?.role ? profile.role.replace('_', ' ').toUpperCase() : 'SUPER ADMIN';
  const adminInitials = adminName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(name => name[0]?.toUpperCase())
    .join('') || 'SA';

  // Note: Mock data and placeholder functions have been removed for production
  // All user management is now handled by the proper components:
  // - SuperAdminUserManagement for user management
  // - RoleBasedUserManagement for role-based operations
  // These components fetch real data from your live database

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f111a] text-slate-100">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 1600 900" fill="none">
          <defs>
            <linearGradient id="admin-wave" x1="0" y1="0" x2="1600" y2="900">
              <stop offset="0%" stopColor="#1919e6" />
              <stop offset="52%" stopColor="#4338ca" />
              <stop offset="100%" stopColor="#0f111a" />
            </linearGradient>
          </defs>
          <path d="M0 190C260 270 470 80 710 160C940 230 1180 430 1600 270V0H0V190Z" fill="url(#admin-wave)" fillOpacity="0.24" />
          <path d="M0 760C280 680 430 815 700 770C980 720 1260 530 1600 610V900H0V760Z" fill="url(#admin-wave)" fillOpacity="0.2" />
        </svg>
        <motion.div
          className="absolute -top-20 left-1/4 h-80 w-80 rounded-full bg-indigo-500/25 blur-[110px]"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: 'mirror' }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 h-[460px] w-[460px] rounded-full bg-cyan-500/10 blur-[120px]"
          animate={{ x: [0, -28, 0], y: [0, -24, 0] }}
          transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror' }}
        />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '20px 20px' }} />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b border-slate-700/70 bg-slate-950/65 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/20 p-2.5 shadow-[0_0_20px_rgba(79,70,229,0.35)]">
                <Calendar className="h-5 w-5 text-indigo-100" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">MinaTid Super Admin</h1>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <Badge className="border-0 bg-indigo-500/90 text-white">Executive Control Center</Badge>
                  <span className="hidden sm:inline">Live operations, governance and role control</span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex w-80 max-w-[36vw] items-center">
              <div className="group relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-300" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search users, orgs, logs..."
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900/70 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{adminName}</p>
                  <p className="text-xs text-slate-400">{adminRole}</p>
                </div>
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
                    {adminInitials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                </div>
              </div>
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

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="overflow-x-auto pb-1">
              <TabsList className="h-auto min-w-max rounded-none border-b border-slate-700/70 bg-transparent p-0">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 text-sm font-semibold text-slate-400 data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent data-[state=active]:text-white">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 text-sm font-semibold text-slate-400 data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent data-[state=active]:text-white">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="user-roles" className="rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 text-sm font-semibold text-slate-400 data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent data-[state=active]:text-white">
                  <UserPlus className="h-4 w-4" />
                  Role Mgmt
                  <Badge className="ml-1 bg-emerald-600 text-white text-[10px]">OAuth</Badge>
                </TabsTrigger>
                <TabsTrigger value="organisations" className="rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 text-sm font-semibold text-slate-400 data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent data-[state=active]:text-white">
                  <Building2 className="h-4 w-4" />
                  Organisations
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 text-sm font-semibold text-slate-400 data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent data-[state=active]:text-white">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 text-sm font-semibold text-slate-400 data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent data-[state=active]:text-white">
                  <Shield className="h-4 w-4" />
                  Security
                  <Badge variant="destructive" className="ml-1 text-[10px] text-white">New</Badge>
                </TabsTrigger>
                <TabsTrigger value="2fa" className="rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 text-sm font-semibold text-slate-400 data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent data-[state=active]:text-white">
                  <Shield className="h-4 w-4" />
                  2FA
                  <Badge className="ml-1 bg-blue-500 text-white text-[10px]">New</Badge>
                </TabsTrigger>
                <TabsTrigger value="system" className="rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 text-sm font-semibold text-slate-400 data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent data-[state=active]:text-white">
                  <Settings className="h-4 w-4" />
                  System
                </TabsTrigger>
                <TabsTrigger value="debug" className="rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 text-sm font-semibold text-slate-400 data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent data-[state=active]:text-white">
                  <Settings className="h-4 w-4" />
                  Debug
                  <Badge className="ml-1 bg-red-500 text-white text-[10px]">Test</Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            {searchTerm && (
              <div className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-200">
                Search filter active: "{searchTerm}". Tabs and widgets remain fully functional.
              </div>
            )}

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.02 }}>
                  <section className="group relative overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900/55 p-5 backdrop-blur-xl transition-all hover:border-indigo-400/40 hover:bg-slate-900/65">
                    <div className="absolute -right-7 -top-8 h-20 w-20 rounded-full bg-indigo-500/20 blur-2xl transition-opacity group-hover:opacity-90" />
                    <header className="relative z-10 flex items-center justify-between pb-2">
                      <h3 className="text-sm font-medium text-slate-300">System Health</h3>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${liveStats.systemStatus === 'Optimal' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
                        <Shield className="h-4 w-4 text-indigo-300" />
                      </div>
                    </header>
                    <div className="relative z-10">
                      <div className="text-3xl font-bold tracking-tight text-white">{liveStats.systemStatus}</div>
                      <p className="text-xs text-slate-400">
                        {liveStats.failedLogins > 0 ? `${liveStats.failedLogins} failed logins today` : 'All systems operational'}
                      </p>
                    </div>
                  </section>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 }}>
                  <section className="group relative overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900/55 p-5 backdrop-blur-xl transition-all hover:border-indigo-400/40 hover:bg-slate-900/65">
                    <div className="absolute -right-7 -top-8 h-20 w-20 rounded-full bg-blue-500/20 blur-2xl transition-opacity group-hover:opacity-90" />
                    <header className="relative z-10 flex items-center justify-between pb-2">
                      <h3 className="text-sm font-medium text-slate-300">Active Users</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <Users className="h-4 w-4 text-blue-300" />
                      </div>
                    </header>
                    <div className="relative z-10">
                      <div className="text-3xl font-bold tracking-tight text-white">{liveStats.activeUsers}</div>
                      <p className="text-xs text-slate-400">
                        {liveStats.recentLogins > 0 ? `${liveStats.recentLogins} logins today` : 'No recent activity'}
                      </p>
                    </div>
                  </section>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                  <section className="group relative overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900/55 p-5 backdrop-blur-xl transition-all hover:border-indigo-400/40 hover:bg-slate-900/65">
                    <div className="absolute -right-7 -top-8 h-20 w-20 rounded-full bg-violet-500/20 blur-2xl transition-opacity group-hover:opacity-90" />
                    <header className="relative z-10 flex items-center justify-between pb-2">
                      <h3 className="text-sm font-medium text-slate-300">Organisations</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                        <Building2 className="h-4 w-4 text-violet-300" />
                      </div>
                    </header>
                    <div className="relative z-10">
                      <div className="text-3xl font-bold tracking-tight text-white">{liveStats.totalOrganisations}</div>
                      <p className="text-xs text-slate-400">
                        {liveStats.totalOrganisations > 0 ? `${Math.round(liveStats.activeUsers / Math.max(liveStats.totalOrganisations, 1))} avg users/org` : 'No organisations yet'}
                      </p>
                    </div>
                  </section>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.14 }}>
                  <section className="group relative overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900/55 p-5 backdrop-blur-xl transition-all hover:border-indigo-400/40 hover:bg-slate-900/65">
                    <div className="absolute -right-7 -top-8 h-20 w-20 rounded-full bg-emerald-500/20 blur-2xl transition-opacity group-hover:opacity-90" />
                    <header className="relative z-10 flex items-center justify-between pb-2">
                      <h3 className="text-sm font-medium text-slate-300">Security Score</h3>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${liveStats.securityScore >= 90 ? 'bg-green-500' : liveStats.securityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                        <Shield className="h-4 w-4 text-emerald-300" />
                      </div>
                    </header>
                    <div className="relative z-10">
                      <div className="text-3xl font-bold tracking-tight text-white">{liveStats.securityScore}%</div>
                      <p className="text-xs text-slate-400">
                        {liveStats.securityScore >= 90 ? 'Excellent security' : liveStats.securityScore >= 70 ? 'Good security' : 'Needs attention'}
                      </p>
                    </div>
                  </section>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-xl border border-slate-700/70 bg-slate-900/55 p-6 backdrop-blur-xl lg:col-span-2">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Super Admin Overview</h3>
                      <p className="text-sm text-slate-400">Use tabs to manage users, role assignments, organisations, security, analytics and system settings.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchLiveStats}
                      className="border-slate-600 bg-slate-900/60 text-slate-100 hover:bg-slate-800"
                    >
                      Refresh
                    </Button>
                  </div>

                  {statsError && (
                    <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                      Some dashboard metrics are temporarily unavailable. Refresh or check your data access policies.
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-700/70 bg-slate-950/50 p-4">
                      <p className="text-xs text-slate-400">Live User Activity</p>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.recentLogins}</p>
                      <p className="text-xs text-slate-500">Successful logins in the last 24h</p>
                    </div>
                    <div className="rounded-lg border border-slate-700/70 bg-slate-950/50 p-4">
                      <p className="text-xs text-slate-400">Failed Login Attempts</p>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.failedLogins}</p>
                      <p className="text-xs text-slate-500">Security-relevant authentication events</p>
                    </div>
                    <div className="rounded-lg border border-slate-700/70 bg-slate-950/50 p-4">
                      <p className="text-xs text-slate-400">Active Organisations</p>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.totalOrganisations}</p>
                      <p className="text-xs text-slate-500">Total managed organisations</p>
                    </div>
                    <div className="rounded-lg border border-slate-700/70 bg-slate-950/50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">Operational State</p>
                        <Activity className="h-4 w-4 text-indigo-300" />
                      </div>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.systemStatus}</p>
                      <p className="text-xs text-slate-500">Calculated from current security and activity data</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-700/70 bg-slate-900/55 p-5 backdrop-blur-xl">
                  <h3 className="mb-4 text-base font-bold text-white">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('users')}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/15 hover:text-white"
                    >
                      Add or Manage Users
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('user-roles')}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/15 hover:text-white"
                    >
                      Review Role Assignments
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('organisations')}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/15 hover:text-white"
                    >
                      Organisation Management
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('analytics')}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/15 hover:text-white"
                    >
                      Open Analytics
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('security')}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/15 hover:text-white"
                    >
                      Security Monitoring
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/history')}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/15 hover:text-white"
                    >
                      View Audit History
                    </button>
                  </div>
                </section>
              </div>

              <div className="rounded-xl border border-slate-700/70 bg-slate-900/45 p-3 backdrop-blur-xl sm:p-4">
                <RoleBasedUserManagement />
              </div>
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
