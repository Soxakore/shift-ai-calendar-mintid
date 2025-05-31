
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar,
  LogOut,
  Users,
  Clock,
  TrendingUp,
  UserCheck,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import HistoryButton from '@/components/admin/HistoryButton';

const ManagerDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { signOut, profile } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [superAdminContext, setSuperAdminContext] = useState<{
    id: string;
    name: string;
    returnUrl: string;
  } | null>(null);

  const [stats, setStats] = useState({
    teamMembers: 12,
    activeSchedules: 8,
    pendingApprovals: 3,
    thisWeekHours: 320
  });

  useEffect(() => {
    // Check if super admin is viewing this manager
    const storedContext = sessionStorage.getItem('superAdminViewingManager');
    if (storedContext) {
      setSuperAdminContext(JSON.parse(storedContext));
    }
  }, []);

  const handleReturnToSuperAdmin = () => {
    sessionStorage.removeItem('superAdminViewingManager');
    navigate('/super-admin');
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />
      
      {/* Super Admin Viewing Banner */}
      {superAdminContext && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mx-4 mt-4 rounded-lg">
          <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-200">
              <strong>Super Admin View:</strong> You are viewing {superAdminContext.name}'s manager panel
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReturnToSuperAdmin}
              className="ml-4 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              Return to Super Admin
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  MinTid Manager Dashboard
                  {superAdminContext && (
                    <span className="text-blue-600 dark:text-blue-400 ml-2">
                      - {superAdminContext.name}
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    {superAdminContext ? 'SUPER ADMIN VIEW' : 'MANAGER'}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Team Management & Scheduling</span>
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
            <ThemeToggle />
            {!superAdminContext && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                className="shadow-sm hover:shadow-md transition-shadow text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Team Members</CardTitle>
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.teamMembers}</div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Active employees
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Active Schedules</CardTitle>
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeSchedules}</div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  This week
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pendingApprovals}</div>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Total Hours</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.thisWeekHours}</div>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  This week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 bg-blue-600 hover:bg-blue-700 text-white">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Manage Team
              </div>
            </Button>
            <Button className="h-20 bg-green-600 hover:bg-green-700 text-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Management
              </div>
            </Button>
            <Button className="h-20 bg-purple-600 hover:bg-purple-700 text-white">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Team Reports
              </div>
            </Button>
          </div>

          {/* Manager-specific content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Team Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your team members, approve schedules, and monitor performance.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Schedule Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Create and manage schedules for your department.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ManagerDashboard;
