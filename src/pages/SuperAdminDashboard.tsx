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
import RoleDashboardHeader from '@/components/layout/RoleDashboardHeader';

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
  const adminRole = profile?.user_type ? profile.user_type.replace('_', ' ').toUpperCase() : 'SUPER ADMIN';
  const glassPanelClass = 'relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(26,28,46,0.78)] shadow-[0_24px_60px_-38px_rgba(2,6,23,0.98)] backdrop-blur-2xl';
  const glassCardClass = 'group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(30,32,55,0.62)] p-6 shadow-[0_22px_44px_-36px_rgba(2,6,23,0.98)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300/35 hover:bg-[rgba(30,32,55,0.78)]';
  const glassInsetClass = 'rounded-xl border border-white/[0.08] bg-[rgba(15,17,26,0.62)] p-4 backdrop-blur-xl';
  const tabTriggerClass = 'rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 text-sm font-semibold text-slate-400 transition-all data-[state=active]:border-indigo-300 data-[state=active]:bg-transparent data-[state=active]:text-slate-100';

  const failedLoginNote = liveStats.failedLogins === 0
    ? 'No suspicious sign-in activity in the last 24h.'
    : `${liveStats.failedLogins} failed sign-in attempts in the last 24h.`;
  const userActivityNote = liveStats.recentLogins === 0
    ? 'No successful sign-ins recorded in the last 24h.'
    : `${liveStats.recentLogins} successful sign-ins recorded in the last 24h.`;
  const organisationNote = liveStats.totalOrganisations > 0
    ? `${Math.round(liveStats.activeUsers / Math.max(liveStats.totalOrganisations, 1))} average active users per organisation.`
    : 'No organisations are configured yet.';
  const securityNote = liveStats.securityScore >= 90
    ? 'Security posture is stable and within target.'
    : liveStats.securityScore >= 70
      ? 'Security posture is acceptable but should be monitored.'
      : 'Security posture needs immediate review.';

  const summaryCards = [
    {
      key: 'health',
      label: 'Platform Health',
      value: liveStats.systemStatus,
      note: failedLoginNote,
      dotClass: liveStats.systemStatus === 'Optimal' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse',
      iconClass: 'text-indigo-200',
      glowClass: 'bg-indigo-400/18',
      Icon: Shield,
    },
    {
      key: 'users',
      label: 'Active Users',
      value: liveStats.activeUsers,
      note: userActivityNote,
      dotClass: 'bg-emerald-500 animate-pulse',
      iconClass: 'text-blue-200',
      glowClass: 'bg-blue-400/16',
      Icon: Users,
    },
    {
      key: 'orgs',
      label: 'Organisations',
      value: liveStats.totalOrganisations,
      note: organisationNote,
      dotClass: 'bg-indigo-300 animate-pulse',
      iconClass: 'text-indigo-200',
      glowClass: 'bg-violet-400/14',
      Icon: Building2,
    },
    {
      key: 'security',
      label: 'Security Score',
      value: `${liveStats.securityScore}%`,
      note: securityNote,
      dotClass: liveStats.securityScore >= 90 ? 'bg-emerald-500 animate-pulse' : liveStats.securityScore >= 70 ? 'bg-amber-500 animate-pulse' : 'bg-rose-500 animate-pulse',
      iconClass: 'text-emerald-200',
      glowClass: 'bg-emerald-400/16',
      Icon: Shield,
    },
  ] as const;

  const quickActions = [
    {
      key: 'users',
      title: 'Manage User Directory',
      subtitle: 'Create, edit, and deactivate accounts',
      onClick: () => setActiveTab('users'),
    },
    {
      key: 'roles',
      title: 'Review Role Assignments',
      subtitle: 'Validate role scope for new and existing users',
      onClick: () => setActiveTab('user-roles'),
    },
    {
      key: 'orgs',
      title: 'Organisation Settings',
      subtitle: 'Update organisation profiles and ownership',
      onClick: () => setActiveTab('organisations'),
    },
    {
      key: 'analytics',
      title: 'Analytics Workspace',
      subtitle: 'Open performance and workforce reporting',
      onClick: () => setActiveTab('analytics'),
    },
    {
      key: 'security',
      title: 'Security Monitoring',
      subtitle: 'Review authentication, policies, and alerts',
      onClick: () => setActiveTab('security'),
    },
    {
      key: 'history',
      title: 'Audit History',
      subtitle: 'Inspect recent administrative changes',
      onClick: () => navigate('/history'),
    },
  ] as const;

  // Note: Mock data and placeholder functions have been removed for production
  // All user management is now handled by the proper components:
  // - SuperAdminUserManagement for user management
  // - RoleBasedUserManagement for role-based operations
  // These components fetch real data from your live database

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_12%_6%,#111c34_0%,#0f172a_36%,#0f111a_100%)] text-slate-100">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 1600 900" fill="none">
          <defs>
            <linearGradient id="admin-wave" x1="0" y1="0" x2="1600" y2="900">
              <stop offset="0%" stopColor="#1919e6" />
              <stop offset="42%" stopColor="#4f4ff0" />
              <stop offset="100%" stopColor="#0f111a" />
            </linearGradient>
            <linearGradient id="admin-accent" x1="0" y1="0" x2="1600" y2="0">
              <stop offset="0%" stopColor="#c7d2fe" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a5b4fc" />
            </linearGradient>
            <radialGradient id="admin-spot" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1180 140) rotate(130) scale(680 480)">
              <stop stopColor="#818cf8" stopOpacity="0.36" />
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
          <path d="M84 684C312 626 550 652 786 620C1018 588 1238 498 1468 420" stroke="#818cf8" strokeOpacity="0.18" strokeWidth="1.5" />
          <rect width="1600" height="900" filter="url(#glass-noise)" opacity="0.65" />
        </svg>
        <motion.div
          className="absolute -top-24 left-[22%] h-[26rem] w-[26rem] rounded-full bg-indigo-400/20 blur-[120px]"
          animate={{ x: [0, 26, 0], y: [0, 20, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 right-[18%] h-[30rem] w-[30rem] rounded-full bg-violet-500/16 blur-[128px]"
          animate={{ x: [0, -30, 0], y: [0, -24, 0], scale: [1, 0.96, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.svg
          className="absolute -right-36 top-14 h-[28rem] w-[28rem] text-indigo-200/25"
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
        <RoleDashboardHeader
          icon={<Calendar className="h-5 w-5" />}
          title="MinaTid Super Admin"
          subtitle="Global operations, governance, and access control"
          roleLabel="SUPER ADMIN"
          accent="indigo"
          userName={adminName}
          userRoleLabel={adminRole}
          metaItems={[
            { label: liveStats.systemStatus === 'Optimal' ? 'System healthy' : 'System warning', tone: liveStats.systemStatus === 'Optimal' ? 'success' : 'warning' },
            ...(profile?.tracking_id ? [{ label: `ID: ${profile.tracking_id}`, tone: 'accent' as const }] : []),
          ]}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search users, organisations, and logs..."
          actions={
            <>
              <HistoryButton variant="outline" size="sm" showBadge={false} className="h-9 w-9 p-0" />
              <NotificationDropdown compact={true} />
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
            </>
          }
        />

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
              <div className="rounded-xl border border-indigo-300/30 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-100 backdrop-blur-xl">
                Active filter: "{searchTerm}". Dashboard actions remain available.
              </div>
            )}

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card, index) => {
                  const CardIcon = card.Icon;

                  return (
                    <motion.div
                      key={card.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.42, delay: 0.02 + index * 0.06, ease: 'easeOut' }}
                      whileHover={{ y: -5, scale: 1.01 }}
                    >
                      <section className={glassCardClass}>
                        <div className={`absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl transition-opacity group-hover:opacity-100 ${card.glowClass}`} />
                        <header className="relative z-10 flex items-center justify-between pb-2">
                          <h3 className="text-sm font-medium text-slate-300">{card.label}</h3>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${card.dotClass}`} />
                            <CardIcon className={`h-4 w-4 ${card.iconClass}`} />
                          </div>
                        </header>
                        <div className="relative z-10">
                          <div className="text-3xl font-bold tracking-tight text-white">{card.value}</div>
                          <p className="text-xs leading-relaxed text-slate-300/90">{card.note}</p>
                        </div>
                      </section>
                    </motion.div>
                  );
                })}
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
                      <h3 className="text-lg font-bold text-white">Operations Snapshot</h3>
                      <p className="text-sm leading-relaxed text-slate-300/90">Use this section for immediate context, then continue in tabs for full administrative workflows.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchLiveStats}
                      className="border-white/20 bg-[rgba(15,17,26,0.62)] text-slate-100 hover:bg-slate-800"
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
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Authentication Throughput</p>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.recentLogins}</p>
                      <p className="text-xs text-slate-400">Successful logins over the last 24 hours.</p>
                    </div>
                    <div className={glassInsetClass}>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Risk Events</p>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.failedLogins}</p>
                      <p className="text-xs text-slate-400">Failed authentication attempts in the same period.</p>
                    </div>
                    <div className={glassInsetClass}>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Organisation Coverage</p>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.totalOrganisations}</p>
                      <p className="text-xs text-slate-400">Organisations currently managed in this tenant.</p>
                    </div>
                    <div className={glassInsetClass}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Operational State</p>
                        <Activity className="h-4 w-4 text-indigo-200" />
                      </div>
                      <p className="mt-1 text-2xl font-bold text-white">{liveStats.systemStatus}</p>
                      <p className="text-xs text-slate-400">Derived from authentication and platform activity signals.</p>
                    </div>
                  </div>
                </motion.section>

                <motion.section
                  className={`${glassPanelClass} p-5`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.48, delay: 0.22, ease: 'easeOut' }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200/40 to-transparent" />
                  <h3 className="mb-4 text-base font-bold text-white">Quick Actions</h3>
                  <div className="space-y-3">
                    {quickActions.map((action) => (
                      <button
                        key={action.key}
                        type="button"
                        onClick={action.onClick}
                        className="w-full rounded-xl border border-white/[0.08] bg-[rgba(15,17,26,0.62)] px-3 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300/40 hover:bg-indigo-500/12"
                      >
                        <p className="text-xs font-semibold text-slate-100">{action.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{action.subtitle}</p>
                      </button>
                    ))}
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
