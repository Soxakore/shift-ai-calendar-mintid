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
  const glassPanelClass = 'relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/52 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.95)] backdrop-blur-2xl';
  const glassCardClass = 'group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-[0_22px_44px_-36px_rgba(8,47,73,0.95)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-slate-900/64';
  const glassInsetClass = 'rounded-xl border border-white/10 bg-slate-950/45 p-4 backdrop-blur-xl';
  const tabTriggerClass = 'rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 text-sm font-semibold text-slate-400 transition-all data-[state=active]:border-cyan-300 data-[state=active]:bg-transparent data-[state=active]:text-cyan-100';

  // Note: Mock data and placeholder functions have been removed for production
  // All user management is now handled by the proper components:
  // - SuperAdminUserManagement for user management
  // - RoleBasedUserManagement for role-based operations
  // These components fetch real data from your live database

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_12%_6%,#0d1f3a_0%,#0a152a_38%,#070d18_100%)] text-slate-100">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full opacity-45" viewBox="0 0 1600 900" fill="none">
          <defs>
            <linearGradient id="admin-wave" x1="0" y1="0" x2="1600" y2="900">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="42%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="admin-accent" x1="0" y1="0" x2="1600" y2="0">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
            <radialGradient id="admin-spot" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1180 140) rotate(130) scale(680 480)">
              <stop stopColor="#7dd3fc" stopOpacity="0.42" />
              <stop offset="1" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <filter id="glass-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="table" tableValues="0 0.035" />
              </feComponentTransfer>
            </filter>
          </defs>
          <rect width="1600" height="900" fill="url(#admin-spot)" />
          <path d="M0 180C210 258 460 84 706 152C948 222 1190 410 1600 248V0H0V180Z" fill="url(#admin-wave)" fillOpacity="0.22" />
          <path d="M0 772C270 680 442 820 710 776C980 730 1254 526 1600 604V900H0V772Z" fill="url(#admin-wave)" fillOpacity="0.18" />
          <path d="M110 612C332 542 612 560 902 502C1118 458 1320 374 1510 298" stroke="url(#admin-accent)" strokeOpacity="0.22" strokeWidth="2" />
          <path d="M84 684C312 626 550 652 786 620C1018 588 1238 498 1468 420" stroke="#38bdf8" strokeOpacity="0.18" strokeWidth="1.5" />
          <rect width="1600" height="900" filter="url(#glass-noise)" opacity="0.65" />
        </svg>
        <motion.div
          className="absolute -top-24 left-[22%] h-[26rem] w-[26rem] rounded-full bg-cyan-400/20 blur-[120px]"
          animate={{ x: [0, 26, 0], y: [0, 20, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 right-[18%] h-[30rem] w-[30rem] rounded-full bg-blue-500/16 blur-[128px]"
          animate={{ x: [0, -30, 0], y: [0, -24, 0], scale: [1, 0.96, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.svg
          className="absolute -right-36 top-14 h-[28rem] w-[28rem] text-cyan-200/25"
          viewBox="0 0 400 400"
          fill="none"
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="1.6" strokeDasharray="6 10" />
          <circle cx="200" cy="200" r="118" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8" />
          <path d="M54 262C102 144 196 82 312 108" stroke="currentColor" strokeWidth="1.4" />
        </motion.svg>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '18px 18px' }} />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/48 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <div className="rounded-xl border border-cyan-300/40 bg-cyan-500/16 p-2.5 shadow-[0_0_28px_rgba(34,211,238,0.28)]">
                <Calendar className="h-5 w-5 text-cyan-100" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">MinaTid Super Admin</h1>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <Badge className="border-0 bg-cyan-500/90 text-slate-950">Executive Control Center</Badge>
                  <span className="hidden sm:inline">Live operations, governance and role control</span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex w-80 max-w-[36vw] items-center">
              <div className="group relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-200" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search users, orgs, logs..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/55 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/60"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/52 px-3 py-2 backdrop-blur-xl">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{adminName}</p>
                  <p className="text-xs text-slate-400">{adminRole}</p>
                </div>
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-semibold text-slate-950">
                    {adminInitials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
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
              <TabsList className="h-auto min-w-max rounded-none border-b border-white/10 bg-transparent p-0">
                <TabsTrigger value="overview" className={tabTriggerClass}>
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" className={tabTriggerClass}>
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="user-roles" className={tabTriggerClass}>
                  <UserPlus className="h-4 w-4" />
                  Role Mgmt
                  <Badge className="ml-1 bg-emerald-600 text-white text-[10px]">OAuth</Badge>
                </TabsTrigger>
                <TabsTrigger value="organisations" className={tabTriggerClass}>
                  <Building2 className="h-4 w-4" />
                  Organisations
                </TabsTrigger>
                <TabsTrigger value="analytics" className={tabTriggerClass}>
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="security" className={tabTriggerClass}>
                  <Shield className="h-4 w-4" />
                  Security
                  <Badge variant="destructive" className="ml-1 text-[10px] text-white">New</Badge>
                </TabsTrigger>
                <TabsTrigger value="2fa" className={tabTriggerClass}>
                  <Shield className="h-4 w-4" />
                  2FA
                  <Badge className="ml-1 bg-blue-500 text-white text-[10px]">New</Badge>
                </TabsTrigger>
                <TabsTrigger value="system" className={tabTriggerClass}>
                  <Settings className="h-4 w-4" />
                  System
                </TabsTrigger>
                <TabsTrigger value="debug" className={tabTriggerClass}>
                  <Settings className="h-4 w-4" />
                  Debug
                  <Badge className="ml-1 bg-red-500 text-white text-[10px]">Test</Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            {searchTerm && (
              <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100 backdrop-blur-xl">
                Search filter active: "{searchTerm}". Tabs and widgets remain fully functional.
              </div>
            )}

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: 0.02, ease: 'easeOut' }}
                  whileHover={{ y: -5, scale: 1.01 }}
                >
                  <section className={glassCardClass}>
                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl transition-opacity group-hover:opacity-100" />
                    <header className="relative z-10 flex items-center justify-between pb-2">
                      <h3 className="text-sm font-medium text-slate-300">System Health</h3>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${liveStats.systemStatus === 'Optimal' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
                        <Shield className="h-4 w-4 text-cyan-200" />
                      </div>
                    </header>
                    <div className="relative z-10">
                      <div className="text-3xl font-bold tracking-tight text-white">{liveStats.systemStatus}</div>
                      <p className="text-xs text-slate-300/90">
                        {liveStats.failedLogins > 0 ? `${liveStats.failedLogins} failed logins today` : 'All systems operational'}
                      </p>
                    </div>
                  </section>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: 0.08, ease: 'easeOut' }}
                  whileHover={{ y: -5, scale: 1.01 }}
                >
                  <section className={glassCardClass}>
                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-400/18 blur-2xl transition-opacity group-hover:opacity-100" />
                    <header className="relative z-10 flex items-center justify-between pb-2">
                      <h3 className="text-sm font-medium text-slate-300">Active Users</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <Users className="h-4 w-4 text-blue-200" />
                      </div>
                    </header>
                    <div className="relative z-10">
                      <div className="text-3xl font-bold tracking-tight text-white">{liveStats.activeUsers}</div>
                      <p className="text-xs text-slate-300/90">
                        {liveStats.recentLogins > 0 ? `${liveStats.recentLogins} logins today` : 'No recent activity'}
                      </p>
                    </div>
                  </section>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: 0.14, ease: 'easeOut' }}
                  whileHover={{ y: -5, scale: 1.01 }}
                >
                  <section className={glassCardClass}>
                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-300/14 blur-2xl transition-opacity group-hover:opacity-100" />
                    <header className="relative z-10 flex items-center justify-between pb-2">
                      <h3 className="text-sm font-medium text-slate-300">Organisations</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        <Building2 className="h-4 w-4 text-cyan-100" />
                      </div>
                    </header>
                    <div className="relative z-10">
                      <div className="text-3xl font-bold tracking-tight text-white">{liveStats.totalOrganisations}</div>
                      <p className="text-xs text-slate-300/90">
                        {liveStats.totalOrganisations > 0 ? `${Math.round(liveStats.activeUsers / Math.max(liveStats.totalOrganisations, 1))} avg users/org` : 'No organisations yet'}
                      </p>
                    </div>
                  </section>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: 0.2, ease: 'easeOut' }}
                  whileHover={{ y: -5, scale: 1.01 }}
                >
                  <section className={glassCardClass}>
                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl transition-opacity group-hover:opacity-100" />
                    <header className="relative z-10 flex items-center justify-between pb-2">
                      <h3 className="text-sm font-medium text-slate-300">Security Score</h3>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${liveStats.securityScore >= 90 ? 'bg-green-500' : liveStats.securityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                        <Shield className="h-4 w-4 text-emerald-200" />
                      </div>
                    </header>
                    <div className="relative z-10">
                      <div className="text-3xl font-bold tracking-tight text-white">{liveStats.securityScore}%</div>
                      <p className="text-xs text-slate-300/90">
                        {liveStats.securityScore >= 90 ? 'Excellent security' : liveStats.securityScore >= 70 ? 'Good security' : 'Needs attention'}
                      </p>
                    </div>
                  </section>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <motion.section
                  className={`${glassPanelClass} p-6 lg:col-span-2`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Super Admin Overview</h3>
                      <p className="text-sm text-slate-300/90">Use tabs to manage users, role assignments, organisations, security, analytics and system settings.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchLiveStats}
                      className="border-white/20 bg-slate-950/55 text-slate-100 hover:bg-slate-800"
                    >
                      Refresh
                    </Button>
                  </div>

                  {statsError && (
                    <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 backdrop-blur-xl">
                      Some dashboard metrics are temporarily unavailable. Refresh or check your data access policies.
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className={glassInsetClass}>
                      <p className="text-xs text-slate-400">Live User Activity</p>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.recentLogins}</p>
                      <p className="text-xs text-slate-400">Successful logins in the last 24h</p>
                    </div>
                    <div className={glassInsetClass}>
                      <p className="text-xs text-slate-400">Failed Login Attempts</p>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.failedLogins}</p>
                      <p className="text-xs text-slate-400">Security-relevant authentication events</p>
                    </div>
                    <div className={glassInsetClass}>
                      <p className="text-xs text-slate-400">Active Organisations</p>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.totalOrganisations}</p>
                      <p className="text-xs text-slate-400">Total managed organisations</p>
                    </div>
                    <div className={glassInsetClass}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">Operational State</p>
                        <Activity className="h-4 w-4 text-cyan-200" />
                      </div>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.systemStatus}</p>
                      <p className="text-xs text-slate-400">Calculated from current security and activity data</p>
                    </div>
                  </div>
                </motion.section>

                <motion.section
                  className={`${glassPanelClass} p-5`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.48, delay: 0.22, ease: 'easeOut' }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
                  <h3 className="mb-4 text-base font-bold text-white">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('users')}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-500/12 hover:text-white"
                    >
                      Add or Manage Users
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('user-roles')}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-500/12 hover:text-white"
                    >
                      Review Role Assignments
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('organisations')}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-500/12 hover:text-white"
                    >
                      Organisation Management
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('analytics')}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-500/12 hover:text-white"
                    >
                      Open Analytics
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('security')}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-500/12 hover:text-white"
                    >
                      Security Monitoring
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/history')}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-left text-xs font-medium text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-500/12 hover:text-white"
                    >
                      View Audit History
                    </button>
                  </div>
                </motion.section>
              </div>

              <motion.div
                className={`${glassPanelClass} p-3 sm:p-4`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.26, ease: 'easeOut' }}
              >
                <RoleBasedUserManagement />
              </motion.div>
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
