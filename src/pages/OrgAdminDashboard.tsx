
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, LogOut, Users, Building, BarChart3, Shield, Settings,
  AlertTriangle, CheckCircle, Activity, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

const OrgAdminDashboard = () => {
  const { signOut, profile } = useSupabaseAuth();
  const { systemStatus } = useSystemStatus();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    MinTid Organization Admin
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm">
                      ORG ADMIN CONSOLE
                    </Badge>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {profile?.display_name || 'Organization Administrator'}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${systemStatus.isEmergencyMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <span className={`text-xs ${systemStatus.isEmergencyMode ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {systemStatus.isEmergencyMode ? 'EMERGENCY' : 'LIVE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
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

      {/* Emergency Alert */}
      {systemStatus.isEmergencyMode && (
        <Alert className="mx-4 mt-4 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>🚨 SYSTEM EMERGENCY MODE ACTIVE</strong><br />
            Contact your super administrator immediately. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Live System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Organization Users</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{systemStatus.activeUsers}</div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Active employees</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">System Health</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${systemStatus.systemHealth.database === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {Object.values(systemStatus.systemHealth).filter(s => s === 'online').length}/5
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300">Services online</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Recent Activity</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <Activity className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{systemStatus.recentLogins}</div>
                  <p className="text-xs text-orange-700 dark:text-orange-300">Logins today</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Security Score</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${systemStatus.securityScore >= 90 ? 'bg-green-500' : systemStatus.securityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{systemStatus.securityScore}%</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {systemStatus.securityScore >= 90 ? 'Excellent' : systemStatus.securityScore >= 70 ? 'Good' : 'Needs attention'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => setActiveTab('users')}
                className="h-20 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Manage Organization Users
              </Button>
              <Button 
                onClick={() => setActiveTab('analytics')}
                className="h-20 bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Analytics
              </Button>
              <Button 
                onClick={() => setActiveTab('settings')}
                className="h-20 bg-green-600 hover:bg-green-700 text-white"
              >
                Organization Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">Organization User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">Manage users within your organization here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">Organization Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">View detailed analytics for your organization.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">Organization Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">Configure organization-wide settings here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OrgAdminDashboard;
