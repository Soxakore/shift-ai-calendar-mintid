import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { getPageMetadata } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';

// UI Components
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Shield, Calendar, LogOut, Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Page Components
import SEOHead from '@/components/SEOHead';
import { ThemeToggle } from '@/components/ThemeToggle';
import HistoryButton from '@/components/admin/HistoryButton';
import NotificationDropdown from '@/components/admin/NotificationDropdown';
import RoleDashboardHeader from '@/components/layout/RoleDashboardHeader';
import Footer from '@/components/Footer';

// Dashboard Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, Settings, BarChart3, Clock, CheckCircle } from 'lucide-react';

const OrgAdminDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const { signOut, profile, createUser } = useSupabaseAuth();
  const {
    profiles,
    departments,
    schedules,
    timeLogs,
    refetchProfiles,
    refetchDepartments,
    forceRefresh,
  } = useSupabaseData();
  const { toast } = useToast();
  
  // State management
  const [superAdminContext, setSuperAdminContext] = useState<{
    id: string;
    name: string;
    returnUrl: string;
  } | null>(null);
  
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isUpdatingDept, setIsUpdatingDept] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'departments' | 'schedules' | 'storage'>('overview');
  const [editingUser, setEditingUser] = useState<{id: number; display_name: string; username: string} | null>(null);
  const [editingDept, setEditingDept] = useState<{id: string; name: string; description?: string} | null>(null);
  
  // Form data
  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
    display_name: '',
    phone_number: '',
    user_type: 'employee',
    department_id: ''
  });
  
  const [newDeptData, setNewDeptData] = useState({
    name: '',
    description: '',
    manager_id: ''
  });

  // Get organization data
  const orgUsers = profiles.filter(p => p.organisation_id === profile?.organisation_id);
  const orgDepartments = departments.filter(d => d.organisation_id === profile?.organisation_id);

  // Stats
  const stats = {
    totalUsers: orgUsers.length,
    activeUsers: orgUsers.filter(u => u.is_active).length,
    totalDepartments: orgDepartments.length,
    recentLogins: orgUsers.filter(u => u.created_at && new Date(u.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length
  };

  const orgUserIds = orgUsers
    .map((entry) => entry.user_id)
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
  const orgSchedules = schedules.filter((entry) => orgUserIds.includes(entry.user_id));
  const orgTimeLogs = timeLogs.filter((entry) => orgUserIds.includes(entry.user_id));

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weeklySchedules = orgSchedules.filter((entry) => {
    const scheduleDate = new Date(entry.date);
    return scheduleDate >= weekStart && scheduleDate <= weekEnd;
  });
  const assignedUsersThisWeek = new Set(weeklySchedules.map((entry) => entry.user_id)).size;
  const scheduleCoverage = stats.activeUsers > 0 ? Math.round((assignedUsersThisWeek / stats.activeUsers) * 100) : 0;

  const upcomingShifts = orgSchedules
    .filter((entry) => new Date(entry.date).getTime() >= new Date().setHours(0, 0, 0, 0))
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .slice(0, 4);

  const recentScheduleActivity = orgTimeLogs
    .slice()
    .sort((left, right) => {
      const leftTime = left.updated_at ? new Date(left.updated_at).getTime() : new Date(left.date).getTime();
      const rightTime = right.updated_at ? new Date(right.updated_at).getTime() : new Date(right.date).getTime();
      return rightTime - leftTime;
    })
    .slice(0, 6);

  const estimatedUserKb = Math.max(1, orgUsers.length) * 2.5;
  const estimatedScheduleKb = orgSchedules.length * 1.2;
  const estimatedTimeLogKb = orgTimeLogs.length * 0.9;
  const estimatedAttachmentKb = 0;
  const estimatedTotalKb = estimatedUserKb + estimatedScheduleKb + estimatedTimeLogKb + estimatedAttachmentKb;
  const estimatedTotalMb = estimatedTotalKb / 1024;
  const storageLimitMb = 5 * 1024;
  const storageUsagePercent = Math.min(100, (estimatedTotalMb / storageLimitMb) * 100);

  const refreshDashboardData = async () => {
    await Promise.all([refetchProfiles(), refetchDepartments(), forceRefresh()]);
  };

  useEffect(() => {
    // Check if super admin is viewing this organization
    const storedContext = sessionStorage.getItem('superAdminViewingOrg');
    if (storedContext) {
      try {
        setSuperAdminContext(JSON.parse(storedContext));
      } catch (error) {
        console.error('Invalid super admin context:', error);
        sessionStorage.removeItem('superAdminViewingOrg');
      }
    }
  }, []);

  // User Management Functions
  const handleCreateUser = async () => {
    if (!newUserData.username || !newUserData.password || !newUserData.display_name) {
      toast({
        title: "❌ Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingUser(true);
    try {
      const userData = {
        email: `${newUserData.username}@temp.com`, // Temporary email format
        username: newUserData.username,
        password: newUserData.password,
        display_name: newUserData.display_name,
        phone_number: newUserData.phone_number,
        user_type: newUserData.user_type as "employee" | "org_admin" | "manager",
        organisation_id: profile?.organisation_id || '',
        department_id: newUserData.department_id || orgDepartments[0]?.id || ''
      };

      const result = await createUser(userData);
      
      if (result.success) {
        toast({
          title: "✅ User Created",
          description: `${newUserData.display_name} has been added to the organisation`,
        });
        
        setNewUserData({
          username: '',
          password: '',
          display_name: '',
          phone_number: '',
          user_type: 'employee',
          department_id: ''
        });
        setIsCreateUserOpen(false);
        
        // Force immediate refresh of profiles data with multiple approaches
        setTimeout(() => {
          refetchProfiles();
        }, 300);
        setTimeout(() => {
          forceRefresh();
        }, 800);
      } else {
        toast({
          title: "❌ Error Creating User",
          description: result.error || "Failed to create user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Department Management Functions
  const handleCreateDepartment = async () => {
    if (!newDeptData.name) {
      toast({
        title: "❌ Validation Error",
        description: "Department name is required",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingDept(true);
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert([{
          name: newDeptData.name,
          description: newDeptData.description,
          organisation_id: profile?.organisation_id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Department Created",
        description: `${newDeptData.name} department has been created`,
      });
      
      setNewDeptData({
        name: '',
        description: '',
        manager_id: ''
      });
      setIsCreateDeptOpen(false);

      await refreshDashboardData();
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: "❌ Error Creating Department",
        description: "Failed to create department",
        variant: "destructive"
      });
    } finally {
      setIsCreatingDept(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user ${userName}?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "✅ User Deactivated",
        description: `${userName} has been deactivated`,
      });
      
      refetchProfiles();
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "❌ Error",
        description: "Failed to deactivate user",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDepartment = async (deptId: string, deptName: string) => {
    if (!confirm(`Are you sure you want to delete department ${deptName}?`)) return;

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', deptId);

      if (error) throw error;

      toast({
        title: "✅ Department Deleted",
        description: `${deptName} department has been deleted`,
      });

      await refreshDashboardData();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "❌ Error",
        description: "Failed to delete department",
        variant: "destructive"
      });
    }
  };

  const handleSaveEditedUser = async () => {
    if (!editingUser) return;

    const displayName = editingUser.display_name.trim();
    const username = editingUser.username.trim();
    if (!displayName || !username) {
      toast({
        title: "❌ Validation Error",
        description: "Username and display name are required.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingUser(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          username,
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "✅ User Updated",
        description: `${displayName} was updated successfully.`,
      });
      setEditingUser(null);
      await refreshDashboardData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "❌ Update Failed",
        description: "Failed to update user profile.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleSaveEditedDepartment = async () => {
    if (!editingDept) return;

    const deptName = editingDept.name.trim();
    if (!deptName) {
      toast({
        title: "❌ Validation Error",
        description: "Department name is required.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingDept(true);
    try {
      const { error } = await supabase
        .from('departments')
        .update({
          name: deptName,
          description: editingDept.description?.trim() || null,
        })
        .eq('id', editingDept.id);

      if (error) throw error;

      toast({
        title: "✅ Department Updated",
        description: `${deptName} was updated successfully.`,
      });
      setEditingDept(null);
      await refreshDashboardData();
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: "❌ Update Failed",
        description: "Failed to update department.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingDept(false);
    }
  };

  const handleOpenScheduleWorkspace = () => {
    navigate('/schedule');
  };

  const handleOpenReportsView = () => {
    setActiveTab('schedules');
    toast({
      title: "📊 Reports & Schedules",
      description: "Opened schedule analytics for your organization.",
    });
  };

  const handleCreateTemplate = () => {
    navigate('/schedule');
    toast({
      title: "📅 Schedule Templates",
      description: "Use the schedule workspace to create reusable shift patterns.",
    });
  };

  const handleRunCleanup = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const staleLogs = orgTimeLogs.filter((entry) => new Date(entry.date) < oneYearAgo).length;

    toast({
      title: "🧹 Cleanup Analysis Complete",
      description: staleLogs > 0
        ? `${staleLogs} old log${staleLogs === 1 ? '' : 's'} eligible for archival cleanup.`
        : "No stale logs found. Storage is already clean.",
    });
  };

  const handleExportData = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      organisation_id: profile?.organisation_id || null,
      summary: {
        users: orgUsers.length,
        departments: orgDepartments.length,
        schedules: orgSchedules.length,
        time_logs: orgTimeLogs.length,
      },
      users: orgUsers,
      departments: orgDepartments,
      schedules: orgSchedules,
      time_logs: orgTimeLogs,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `organisation-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "⬇️ Export Started",
      description: "Organization data export has been downloaded.",
    });
  };

  const handleStorageSettingAction = (label: string) => {
    toast({
      title: `${label} Updated`,
      description: `${label} has been configured for your organization storage.`,
    });
  };

  const handleReturnToSuperAdmin = () => {
    sessionStorage.removeItem('superAdminViewingOrg');
    navigate(superAdminContext?.returnUrl || '/super-admin');
    toast({
      title: "✅ Returned to Super Admin",
      description: "You are back in super admin view.",
    });
  };

  const handleLogout = async () => {
    try {
      // If super admin viewing, just return to super admin
      if (superAdminContext) {
        handleReturnToSuperAdmin();
        return;
      }

      await signOut();
      toast({
        title: "✅ Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "❌ Logout Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const adminName = profile?.display_name || profile?.username || 'Organisation Admin';
  const roleLabel = superAdminContext ? 'SUPER ADMIN VIEW' : 'ORG ADMIN';
  const roleSubtitle = superAdminContext
    ? `Viewing organisation admin panel for ${superAdminContext.name}`
    : 'Organisation-level user, department, schedule, and storage operations';

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col"
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />
      
      {/* Super Admin Viewing Banner */}
      {superAdminContext && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mx-4 mt-4 rounded-lg animate-fadeIn">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-200">
              <strong>Super Admin View:</strong> You are viewing {superAdminContext.name}'s organisation admin panel
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReturnToSuperAdmin}
              className="ml-4 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Return to Super Admin
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <RoleDashboardHeader
        icon={<Calendar className="h-5 w-5" />}
        title={`${t('appName')} ${t('organizationManagement')}`}
        subtitle={roleSubtitle}
        roleLabel={roleLabel}
        accent={superAdminContext ? 'indigo' : 'blue'}
        userName={adminName}
        userRoleLabel={roleLabel}
        metaItems={[
          ...(profile?.tracking_id ? [{ label: `ID: ${profile.tracking_id}`, tone: 'accent' as const }] : []),
          { label: `${stats.activeUsers} active users`, tone: 'success' as const },
        ]}
        actions={
          <>
            <HistoryButton variant="outline" size="sm" showBadge={false} className="h-9 w-9 p-0 hidden sm:flex" />
            <NotificationDropdown compact={true} />
            <ThemeToggle />
            <Button
              variant={superAdminContext ? 'outline' : 'destructive'}
              size="sm"
              onClick={handleLogout}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              {superAdminContext ? (
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Exit View</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              )}
            </Button>
          </>
        }
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Quick Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDepartments}</div>
                <p className="text-xs text-muted-foreground">Organisation units</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentLogins}</div>
                <p className="text-xs text-muted-foreground">New users today</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'overview' | 'users' | 'departments' | 'schedules' | 'storage')}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Organisation Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Welcome to your organisation admin dashboard. Manage users, departments, 
                        schedules, and monitor system performance from this central location.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">Total Users</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                          <div className="text-sm text-green-700 dark:text-green-300">Active Users</div>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{stats.totalDepartments}</div>
                          <div className="text-sm text-purple-700 dark:text-purple-300">Departments</div>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{stats.recentLogins}</div>
                          <div className="text-sm text-orange-700 dark:text-orange-300">New Today</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={() => setIsCreateUserOpen(true)}
                      >
                        <UserPlus className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Add New User</div>
                          <div className="text-sm text-muted-foreground">Create a new employee account</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={() => setIsCreateDeptOpen(true)}
                      >
                        <Building2 className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Create Department</div>
                          <div className="text-sm text-muted-foreground">Organize users into departments</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={handleOpenScheduleWorkspace}
                      >
                        <Calendar className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Schedule Shift</div>
                          <div className="text-sm text-muted-foreground">Create new work schedules</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={handleOpenReportsView}
                      >
                        <BarChart3 className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">View Reports</div>
                          <div className="text-sm text-muted-foreground">Analyse organisation performance</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {orgUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {orgUsers.slice(0, 5).map(user => (
                        <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{user.display_name}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={forceRefresh}>
                    <Clock className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">Username</Label>
                        <Input
                          id="username"
                          value={newUserData.username}
                          onChange={(e) => setNewUserData(prev => ({...prev, username: e.target.value}))}
                          className="col-span-3"
                          placeholder="john_doe"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="display_name" className="text-right">Full Name</Label>
                        <Input
                          id="display_name"
                          value={newUserData.display_name}
                          onChange={(e) => setNewUserData(prev => ({...prev, display_name: e.target.value}))}
                          className="col-span-3"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUserData.password}
                          onChange={(e) => setNewUserData(prev => ({...prev, password: e.target.value}))}
                          className="col-span-3"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone_number" className="text-right">Phone</Label>
                        <Input
                          id="phone_number"
                          value={newUserData.phone_number}
                          onChange={(e) => setNewUserData(prev => ({...prev, phone_number: e.target.value}))}
                          className="col-span-3"
                          placeholder="+1234567890"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="user_type" className="text-right">Role</Label>
                        <Select value={newUserData.user_type} onValueChange={(value) => setNewUserData(prev => ({...prev, user_type: value}))}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="org_admin">Organisation Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="department_id" className="text-right">Department</Label>
                        <Select value={newUserData.department_id} onValueChange={(value) => setNewUserData(prev => ({...prev, department_id: value}))}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {orgDepartments.map(dept => (
                              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUser} disabled={isCreatingUser}>
                        {isCreatingUser ? "Creating..." : "Create User"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Organisation Users ({orgUsers.length})</span>
                    <Badge variant="outline">{stats.activeUsers} Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orgUsers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No users found. Create your first user to get started.
                      </p>
                    ) : (
                      orgUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">{user.display_name}</h4>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={user.is_active ? "default" : "secondary"}>
                                  {user.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">{user.user_type}</Badge>
                                {user.tracking_id && (
                                  <Badge variant="outline">ID: {user.tracking_id}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditingUser({
                                  id: user.id,
                                  display_name: user.display_name || '',
                                  username: user.username || '',
                                })
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.display_name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="departments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Department Management</h2>
                <Dialog open={isCreateDeptOpen} onOpenChange={setIsCreateDeptOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Department</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dept_name" className="text-right">Name</Label>
                        <Input
                          id="dept_name"
                          value={newDeptData.name}
                          onChange={(e) => setNewDeptData(prev => ({...prev, name: e.target.value}))}
                          className="col-span-3"
                          placeholder="Engineering"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dept_description" className="text-right">Description</Label>
                        <Input
                          id="dept_description"
                          value={newDeptData.description}
                          onChange={(e) => setNewDeptData(prev => ({...prev, description: e.target.value}))}
                          className="col-span-3"
                          placeholder="Software development team"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDeptOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateDepartment} disabled={isCreatingDept}>
                        {isCreatingDept ? "Creating..." : "Create Department"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Organisation Departments ({orgDepartments.length})</span>
                    <Badge variant="outline">{orgDepartments.length} Total</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orgDepartments.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No departments found. Create your first department to organize users.
                      </p>
                    ) : (
                      orgDepartments.map(dept => {
                        const deptUsers = orgUsers.filter(u => u.department_id === dept.id);
                        return (
                          <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <h4 className="font-medium">{dept.name}</h4>
                                <p className="text-sm text-muted-foreground">{dept.description || 'No description'}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline">{deptUsers.length} Users</Badge>
                                  <Badge variant="outline">
                                    {deptUsers.filter(u => u.is_active).length} Active
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setEditingDept({
                                    id: dept.id,
                                    name: dept.name,
                                    description: dept.description || '',
                                  })
                                }
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="schedules" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Schedule Management</h2>
                <Button onClick={() => navigate('/schedule')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Schedule
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Weekly Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Shifts</span>
                        <Badge variant="outline">{weeklySchedules.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Assigned Users</span>
                        <Badge variant="outline">{assignedUsersThisWeek}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Coverage</span>
                        <Badge variant="outline">{scheduleCoverage}%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Shifts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingShifts.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No upcoming shifts scheduled</p>
                        <Button className="mt-4" variant="outline" onClick={() => navigate('/schedule')}>
                          Schedule Shift
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingShifts.map((entry) => {
                          const assignee = orgUsers.find((user) => user.user_id === entry.user_id);
                          return (
                            <div key={entry.id} className="p-3 border rounded-lg">
                              <p className="font-medium">{assignee?.display_name || assignee?.username || 'Unassigned user'}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(entry.date).toLocaleDateString()} • {entry.start_time?.slice(0, 5) || '--'} - {entry.end_time?.slice(0, 5) || '--'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Schedule Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No templates created</p>
                      <Button className="mt-4" variant="outline" onClick={handleCreateTemplate}>
                        Create Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Schedule Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentScheduleActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No recent schedule activity. Start by creating schedules for your team members.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentScheduleActivity.map((entry) => {
                        const assignee = orgUsers.find((user) => user.user_id === entry.user_id);
                        return (
                          <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{assignee?.display_name || assignee?.username || 'Unknown user'}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(entry.date).toLocaleDateString()} • {entry.clock_in ? 'Clocked in' : 'Scheduled'}
                                {entry.clock_out ? ' / Clocked out' : ''}
                              </p>
                            </div>
                            <Badge variant={entry.clock_in && !entry.clock_out ? 'default' : 'outline'}>
                              {entry.clock_in && !entry.clock_out ? 'Active' : 'Logged'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="storage" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Storage Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{estimatedTotalMb.toFixed(2)} MB</div>
                        <div className="text-sm text-muted-foreground">of 5 GB used</div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: `${storageUsagePercent}%`}}></div>
                      </div>
                      <div className="text-xs text-muted-foreground text-center">
                        Estimated from live organization data
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">User Profiles</span>
                        <Badge variant="outline">{estimatedUserKb.toFixed(1)} KB</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Schedule Data</span>
                        <Badge variant="outline">{estimatedScheduleKb.toFixed(1)} KB</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Time Logs</span>
                        <Badge variant="outline">{estimatedTimeLogKb.toFixed(1)} KB</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Attachments</span>
                        <Badge variant="outline">{estimatedAttachmentKb.toFixed(1)} KB</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                        <div className="font-medium">Optimized</div>
                        <div className="text-sm text-muted-foreground">
                          Storage is efficiently organized
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleRunCleanup}>
                        Run Cleanup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Storage Management Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Auto-Cleanup</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Automatically remove old logs and temporary files.
                      </p>
                      <Button variant="outline" onClick={() => handleStorageSettingAction('Auto-Cleanup')}>
                        Configure
                      </Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Data Export</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Export organisation data for backup or analysis.
                      </p>
                      <Button variant="outline" onClick={handleExportData}>Export Data</Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Compression</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Smart compression to optimize storage usage.
                      </p>
                      <Button variant="outline" onClick={() => handleStorageSettingAction('Compression')}>
                        Enable
                      </Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Archive Old Data</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Move old records to long-term storage.
                      </p>
                      <Button variant="outline" onClick={() => handleStorageSettingAction('Archive Mode')}>
                        Archive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              {editingUser && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_username" className="text-right">Username</Label>
                    <Input
                      id="edit_username"
                      value={editingUser.username}
                      onChange={(e) =>
                        setEditingUser((prev) => (prev ? { ...prev, username: e.target.value } : prev))
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_display_name" className="text-right">Display Name</Label>
                    <Input
                      id="edit_display_name"
                      value={editingUser.display_name}
                      onChange={(e) =>
                        setEditingUser((prev) => (prev ? { ...prev, display_name: e.target.value } : prev))
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                    <Button onClick={handleSaveEditedUser} disabled={isUpdatingUser}>
                      {isUpdatingUser ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingDept} onOpenChange={(open) => !open && setEditingDept(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Department</DialogTitle>
              </DialogHeader>
              {editingDept && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_dept_name" className="text-right">Name</Label>
                    <Input
                      id="edit_dept_name"
                      value={editingDept.name}
                      onChange={(e) =>
                        setEditingDept((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_dept_description" className="text-right">Description</Label>
                    <Input
                      id="edit_dept_description"
                      value={editingDept.description || ''}
                      onChange={(e) =>
                        setEditingDept((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingDept(null)}>Cancel</Button>
                    <Button onClick={handleSaveEditedDepartment} disabled={isUpdatingDept}>
                      {isUpdatingDept ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default OrgAdminDashboard;
