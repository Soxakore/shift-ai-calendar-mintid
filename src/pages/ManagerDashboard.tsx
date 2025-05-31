
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck,
  Settings, 
  BarChart3,
  Plus,
  Calendar,
  Clock,
  Utensils,
  CheckCircle,
  LogOut
} from 'lucide-react';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { profile, signOut } = useSupabaseAuth();
  const { profiles, schedules, timeLogs, loading } = useSupabaseData();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filter data for manager's department
  const departmentProfiles = profiles.filter(p => 
    profile?.department_id && p.department_id === profile.department_id
  );
  
  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules.filter(s => s.date === today);
  const todayTimeLogs = timeLogs.filter(log => log.date === today);
  
  // Calculate stats
  const totalTeamMembers = departmentProfiles.length;
  const workingToday = todayTimeLogs.filter(log => log.clock_in).length;
  const completedOrders = Math.floor(Math.random() * 900) + 800; // Demo data
  const avgPrepTime = 2.8; // Demo data
  const teamEfficiency = 96.2; // Demo data

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">MinTid Manager Dashboard</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white text-xs">MANAGER</Badge>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <Utensils className="w-4 h-4" />
                    Kitchen Department
                  </div>
                  {profile?.tracking_id && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                      ID: {profile.tracking_id}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Settings className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Team </span>Settings
            </Button>
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
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              {/* My Team Overview */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Users className="w-5 h-5" />
                    My Kitchen Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">Total Team Members</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalTeamMembers}</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">Working Today</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{workingToday}</p>
                    </div>
                    <Button size="sm" className="w-full bg-green-500 hover:bg-green-600">
                      <Users className="w-4 h-4 mr-2" />
                      View Team Members
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Schedule */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Clock className="w-5 h-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">Total Shifts Today</p>
                      <p className="text-gray-600 dark:text-gray-300">{todaySchedules.length} scheduled</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">Active Workers</p>
                      <p className="text-gray-600 dark:text-gray-300">{workingToday} currently working</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">My Shift</p>
                      <p className="text-green-600 dark:text-green-400">8 AM - 6 PM</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Manage Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Team Performance */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <BarChart3 className="w-5 h-5" />
                    Team Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">Orders Completed</p>
                      <p className="text-gray-600 dark:text-gray-300">{completedOrders} today</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">Average Prep Time</p>
                      <p className="text-gray-600 dark:text-gray-300">{avgPrepTime} minutes</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">Team Efficiency</p>
                      <p className="text-green-600 dark:text-green-400">{teamEfficiency}%</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Add Team Member */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Plus className="w-5 h-5" />
                    Team Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Kitchen Staff
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Review Performance
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Update Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Kitchen Operations Dashboard */}
            <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Utensils className="w-5 h-5" />
                  Kitchen Operations Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="font-medium text-blue-800 dark:text-blue-300">Orders Prepared</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completedOrders}</p>
                    <p className="text-blue-600 dark:text-blue-400">Target: 800</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="font-medium text-green-800 dark:text-green-300">Food Safety Score</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">98%</p>
                    <p className="text-green-600 dark:text-green-400">Excellent</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="font-medium text-yellow-800 dark:text-yellow-300">Average Prep Time</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{avgPrepTime}min</p>
                    <p className="text-yellow-600 dark:text-yellow-400">Target: 3.0min</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="font-medium text-purple-800 dark:text-purple-300">Team Attendance</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {totalTeamMembers > 0 ? Math.round((workingToday / totalTeamMembers) * 100) : 0}%
                    </p>
                    <p className="text-purple-600 dark:text-purple-400">{workingToday}/{totalTeamMembers} present</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Team Status */}
            <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Users className="w-5 h-5" />
                  Current Team Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Currently Working ({workingToday})
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {departmentProfiles.slice(0, 6).map((profile, idx) => (
                        <li key={profile.id}>• {profile.display_name} - Station {idx + 1}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Coming Next Shift ({Math.max(0, totalTeamMembers - workingToday)})
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {departmentProfiles.slice(workingToday).map((profile) => (
                        <li key={profile.id}>• {profile.display_name} - 2:00 PM</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      Off Today ({Math.max(0, 24 - totalTeamMembers)})
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {Math.max(0, 24 - totalTeamMembers)} team members are scheduled off today
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      View Full Team List
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Team Activities */}
            <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Recent Kitchen Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {departmentProfiles.slice(0, 3).map((member, idx) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.display_name} {idx === 0 ? 'completed food safety training' : 
                           idx === 1 ? 'achieved prep time goal' : 'updated schedule'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Kitchen Staff - {idx + 1} hour{idx === 0 ? '' : 's'} ago
                        </p>
                      </div>
                      <Badge variant="outline">
                        {idx === 0 ? 'Training' : idx === 1 ? 'Achievement' : 'Schedule'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ManagerDashboard;
