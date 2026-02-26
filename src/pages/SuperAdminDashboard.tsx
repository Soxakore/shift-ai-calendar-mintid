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
import { fetchOrganizationsAsAdmin, fetchProfilesAsAdmin } from '@/lib/superAdminDataAccess';
import { ActionTile, InlineStatus, SectionHeader, StatCard } from '@/components/admin/design';
import { getActionDataAttributes } from '@/config/superAdminActionRegistry';
import type { SuperAdminActionId } from '@/types/superAdminUI';

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
      // Get recent session activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const [
        scopedUsers,
        scopedOrganisations,
        { data: recentSessions, error: sessionsError }
      ] = await Promise.all([
        fetchProfilesAsAdmin(),
        fetchOrganizationsAsAdmin(),
        supabase
          .from('session_logs')
          .select('action, success, created_at')
          .gte('created_at', yesterday.toISOString())
      ]);

      if (sessionsError) {
        throw sessionsError;
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
        activeUsers: scopedUsers.length,
        totalOrganisations: scopedOrganisations.length,
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
  const isDebugEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_SUPERADMIN_DEBUG === 'true';
  const glassPanelClass = 'sa-panel relative overflow-hidden';
  const glassInsetClass = 'sa-surface-soft rounded-[var(--sa-radius-md)] p-4';
  const tabTriggerClass = 'rounded-none border-b-2 border-transparent px-3 pb-4 pt-2 sa-text-14 font-semibold text-[hsl(var(--sa-text-secondary))] transition-all duration-sa-md ease-sa-standard data-[state=active]:border-[hsl(var(--sa-accent))] data-[state=active]:bg-transparent data-[state=active]:text-[hsl(var(--sa-text-primary))]';

  const failedLoginNote = liveStats.failedLogins === 0
    ? 'No suspicious sign-in activity in the last 24h.'
    : `${liveStats.failedLogins} failed sign-in attempts in the last 24h.`;
  const userActivityNote = liveStats.recentLogins === 0
    ? 'No successful sign-ins recorded in the last 24h.'
    : `${liveStats.recentLogins} successful sign-ins recorded in the last 24h.`;
  const organisationNote = liveStats.totalOrganisations > 0
    ? `${Math.round(liveStats.activeUsers / Math.max(liveStats.totalOrganisations, 1))} average users per organisation.`
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
      tone: liveStats.systemStatus === 'Optimal' ? 'success' : 'warning',
      Icon: Shield,
    },
    {
      key: 'users',
      label: 'Directory Users',
      value: liveStats.activeUsers,
      note: userActivityNote,
      tone: 'accent',
      Icon: Users,
    },
    {
      key: 'orgs',
      label: 'Organisations',
      value: liveStats.totalOrganisations,
      note: organisationNote,
      tone: 'neutral',
      Icon: Building2,
    },
    {
      key: 'security',
      label: 'Security Score',
      value: `${liveStats.securityScore}%`,
      note: securityNote,
      tone: liveStats.securityScore >= 90 ? 'success' : liveStats.securityScore >= 70 ? 'warning' : 'danger',
      Icon: Shield,
    },
  ] as const;

  const tabActionMap: Record<string, SuperAdminActionId> = {
    overview: 'navigation.overview',
    users: 'navigation.users',
    'user-roles': 'navigation.user-roles',
    organisations: 'navigation.organisations',
    analytics: 'navigation.analytics',
    security: 'navigation.security',
    '2fa': 'navigation.2fa',
    system: 'navigation.system',
    debug: 'navigation.debug',
  };

  const quickActions = [
    {
      key: 'users',
      actionId: 'overview.manage-users' as const,
      title: 'Manage User Directory',
      subtitle: 'Create, edit, and deactivate accounts',
      tone: 'accent' as const,
      icon: <Users className="h-4 w-4" />,
      onClick: () => setActiveTab('users'),
    },
    {
      key: 'roles',
      actionId: 'overview.role-assignments' as const,
      title: 'Review Role Assignments',
      subtitle: 'Validate role scope for new and existing users',
      tone: 'neutral' as const,
      icon: <UserPlus className="h-4 w-4" />,
      onClick: () => setActiveTab('user-roles'),
    },
    {
      key: 'orgs',
      actionId: 'overview.manage-organisations' as const,
      title: 'Organisation Settings',
      subtitle: 'Update organisation profiles and ownership',
      tone: 'neutral' as const,
      icon: <Building2 className="h-4 w-4" />,
      onClick: () => setActiveTab('organisations'),
    },
    {
      key: 'analytics',
      actionId: 'overview.analytics-workspace' as const,
      title: 'Analytics Workspace',
      subtitle: 'Open performance and workforce reporting',
      tone: 'neutral' as const,
      icon: <BarChart3 className="h-4 w-4" />,
      onClick: () => setActiveTab('analytics'),
    },
    {
      key: 'security',
      actionId: 'overview.security-monitoring' as const,
      title: 'Security Monitoring',
      subtitle: 'Review authentication, policies, and alerts',
      tone: 'warning' as const,
      icon: <Shield className="h-4 w-4" />,
      onClick: () => setActiveTab('security'),
    },
    {
      key: 'history',
      actionId: 'overview.audit-history' as const,
      title: 'Audit History',
      subtitle: 'Inspect recent administrative changes',
      tone: 'neutral' as const,
      icon: <Activity className="h-4 w-4" />,
      onClick: () => navigate('/history'),
    },
  ] as const;

  // Note: Mock data and placeholder functions have been removed for production
  // All user management is now handled by the proper components:
  // - SuperAdminUserManagement for user management
  // - RoleBasedUserManagement for role-based operations
  // These components fetch real data from your live database

  return (
    <div className="super-admin-theme relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_12%_6%,hsl(var(--sa-bg))_0%,#0f172a_36%,#0f111a_100%)] text-[hsl(var(--sa-text-primary))]">
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
          searchPlaceholder="Type a name, email, username, or organisation..."
          actions={
            <>
              <div {...getActionDataAttributes('header.history')}>
                <HistoryButton variant="outline" size="sm" showBadge={false} className="h-9 w-9 p-0 border-white/20 bg-[hsl(var(--sa-surface-1)/0.75)]" />
              </div>
              <div {...getActionDataAttributes('header.notifications')}>
                <NotificationDropdown compact={true} />
              </div>
              <div {...getActionDataAttributes('header.theme-toggle')}>
                <ThemeToggle />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="sa-focus-ring text-white shadow-sm transition-shadow hover:shadow-md"
                {...getActionDataAttributes('auth.logout')}
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
              <TabsList className="h-auto min-w-max rounded-none border-b border-white/15 bg-transparent p-0">
                <TabsTrigger value="overview" className={tabTriggerClass} {...getActionDataAttributes(tabActionMap.overview)}>
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" className={tabTriggerClass} {...getActionDataAttributes(tabActionMap.users)}>
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="user-roles" className={tabTriggerClass} {...getActionDataAttributes(tabActionMap['user-roles'])}>
                  <UserPlus className="h-4 w-4" />
                  Role Mgmt
                  <Badge className="ml-1 bg-emerald-600 text-white text-[10px]">OAuth</Badge>
                </TabsTrigger>
                <TabsTrigger value="organisations" className={tabTriggerClass} {...getActionDataAttributes(tabActionMap.organisations)}>
                  <Building2 className="h-4 w-4" />
                  Organisations
                </TabsTrigger>
                <TabsTrigger value="analytics" className={tabTriggerClass} {...getActionDataAttributes(tabActionMap.analytics)}>
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="security" className={tabTriggerClass} {...getActionDataAttributes(tabActionMap.security)}>
                  <Shield className="h-4 w-4" />
                  Security
                  <Badge variant="destructive" className="ml-1 text-[10px] text-white">New</Badge>
                </TabsTrigger>
                <TabsTrigger value="2fa" className={tabTriggerClass} {...getActionDataAttributes(tabActionMap['2fa'])}>
                  <Shield className="h-4 w-4" />
                  2FA
                  <Badge className="ml-1 bg-blue-500 text-white text-[10px]">New</Badge>
                </TabsTrigger>
                <TabsTrigger value="system" className={tabTriggerClass} {...getActionDataAttributes(tabActionMap.system)}>
                  <Settings className="h-4 w-4" />
                  System
                </TabsTrigger>
                {isDebugEnabled ? (
                  <TabsTrigger value="debug" className={tabTriggerClass} {...getActionDataAttributes(tabActionMap.debug)}>
                    <Settings className="h-4 w-4" />
                    Debug
                    <Badge className="ml-1 bg-red-500 text-white text-[10px]">Test</Badge>
                  </TabsTrigger>
                ) : null}
              </TabsList>
            </div>

            {searchTerm && (
              <div className="sa-surface-soft rounded-[var(--sa-radius-md)] border px-3 py-2 sa-text-12 text-[hsl(var(--sa-text-secondary))]">
                Active filter: "{searchTerm}". All actions remain available.
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
                      transition={{ duration: 0.26, delay: 0.02 + index * 0.05, ease: 'easeOut' }}
                      whileHover={{ y: -3, scale: 1.01 }}
                    >
                      <StatCard
                        label={card.label}
                        value={card.value}
                        note={card.note}
                        tone={card.tone}
                        icon={<CardIcon className="h-4 w-4" />}
                      />
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <motion.section
                  className={`${glassPanelClass} p-6 lg:col-span-2`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: 0.12, ease: 'easeOut' }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200/35 to-transparent" />
                  <SectionHeader
                    title="Operations Snapshot"
                    description="Use this section for immediate context, then continue in tabs for complete administrative workflows."
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchLiveStats}
                        className="sa-focus-ring border-white/20 bg-[hsl(var(--sa-surface-1)/0.75)] text-[hsl(var(--sa-text-primary))] hover:bg-[hsl(var(--sa-surface-2)/0.9)]"
                        {...getActionDataAttributes('overview.refresh')}
                      >
                        Refresh
                      </Button>
                    }
                  />
                  <div className="mb-5 mt-4">
                    <InlineStatus
                      label={liveStats.systemStatus === 'Optimal' ? 'All services operational' : 'Attention required'}
                      tone={liveStats.systemStatus === 'Optimal' ? 'success' : 'warning'}
                    />
                  </div>

                  {statsError && (
                    <div className="mb-4 rounded-[var(--sa-radius-md)] border border-amber-400/30 bg-amber-500/10 px-3 py-2 sa-text-12 text-amber-100">
                      Some metrics are temporarily unavailable. Refresh or verify your data-access policies.
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className={glassInsetClass}>
                      <p className="sa-text-12 font-semibold uppercase tracking-wide text-[hsl(var(--sa-text-secondary))]">Authentication Throughput</p>
                      <p className="mt-1 sa-text-24 font-bold text-[hsl(var(--sa-text-primary))]">{liveStats.recentLogins}</p>
                      <p className="sa-text-12 text-[hsl(var(--sa-text-secondary))]">Successful logins over the last 24 hours.</p>
                    </div>
                    <div className={glassInsetClass}>
                      <p className="sa-text-12 font-semibold uppercase tracking-wide text-[hsl(var(--sa-text-secondary))]">Risk Events</p>
                      <p className="mt-1 sa-text-24 font-bold text-[hsl(var(--sa-text-primary))]">{liveStats.failedLogins}</p>
                      <p className="sa-text-12 text-[hsl(var(--sa-text-secondary))]">Failed authentication attempts in the same period.</p>
                    </div>
                    <div className={glassInsetClass}>
                      <p className="sa-text-12 font-semibold uppercase tracking-wide text-[hsl(var(--sa-text-secondary))]">Organisation Coverage</p>
                      <p className="mt-1 sa-text-24 font-bold text-[hsl(var(--sa-text-primary))]">{liveStats.totalOrganisations}</p>
                      <p className="sa-text-12 text-[hsl(var(--sa-text-secondary))]">Organisations currently managed in this tenant.</p>
                    </div>
                    <div className={glassInsetClass}>
                      <div className="flex items-center justify-between">
                        <p className="sa-text-12 font-semibold uppercase tracking-wide text-[hsl(var(--sa-text-secondary))]">Operational State</p>
                        <Activity className="h-4 w-4 text-indigo-200" />
                      </div>
                      <p className="mt-1 sa-text-24 font-bold text-[hsl(var(--sa-text-primary))]">{liveStats.systemStatus}</p>
                      <p className="sa-text-12 text-[hsl(var(--sa-text-secondary))]">Derived from authentication and platform activity signals.</p>
                    </div>
                  </div>
                </motion.section>

                <motion.section
                  className={`${glassPanelClass} p-5`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: 0.16, ease: 'easeOut' }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200/35 to-transparent" />
                  <h3 className="sa-text-18 font-bold text-[hsl(var(--sa-text-primary))]">Quick Actions</h3>
                  <div className="mt-4 space-y-3">
                    {quickActions.map((action) => (
                      <ActionTile
                        key={action.key}
                        actionId={action.actionId}
                        title={action.title}
                        description={action.subtitle}
                        tone={action.tone}
                        icon={action.icon}
                        onClick={action.onClick}
                      />
                    ))}
                  </div>
                </motion.section>
              </div>

              <motion.div
                className={`${glassPanelClass} p-3 sm:p-4`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: 0.2, ease: 'easeOut' }}
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

            {isDebugEnabled ? (
              <TabsContent value="debug" className="space-y-6">
                <DataDebugComponent />
              </TabsContent>
            ) : null}

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
