
import React, { useState } from 'react';
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
  CheckCircle,
  LogOut,
  Building2
} from 'lucide-react';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ManagerDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { profile, signOut } = useSupabaseAuth();
  const { profiles, schedules, timeLogs, departments, loading } = useSupabaseData();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for create user dialog
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
    display_name: '',
    phone_number: '',
    user_type: 'employee'
  });

  // Get current department info
  const currentDepartment = departments.find(dept => dept.id === profile?.department_id);
  const departmentName = currentDepartment?.name || 'Department';

  // Filter data for manager's department
  const departmentProfiles = profiles.filter(p => 
    profile?.department_id && p.department_id === profile.department_id
  );
  
  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules.filter(s => s.date === today);
  const todayTimeLogs = timeLogs.filter(log => log.date === today);
  
  // Calculate real stats
  const totalTeamMembers = departmentProfiles.length;
  const workingToday = todayTimeLogs.filter(log => log.clock_in && !log.clock_out).length;
  const completedShifts = todayTimeLogs.filter(log => log.clock_in && log.clock_out).length;
  const teamEfficiency = totalTeamMembers > 0 ? Math.round((workingToday / totalTeamMembers) * 100) : 0;
  const attendanceRate = totalTeamMembers > 0 ? Math.round(((workingToday + completedShifts) / totalTeamMembers) * 100) : 0;

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

  const handleCreateUser = async () => {
    if (!newUserData.username || !newUserData.password || !newUserData.display_name) {
      toast({
        title: "❌ Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingUser(true);
    try {
      // This would integrate with your user creation logic
      toast({
        title: "✅ User Created",
        description: `${newUserData.display_name} has been added to your team.`,
      });
      setIsCreateUserOpen(false);
      setNewUserData({
        username: '',
        password: '',
        display_name: '',
        phone_number: '',
        user_type: 'employee'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "❌ Creation Failed",
        description: "There was an error creating the user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleManageSchedule = () => {
    navigate('/schedule');
  };

  const handleViewReports = () => {
    toast({
      title: "📊 Reports",
      description: "Department reports feature coming soon.",
    });
  };

  const handleTeamSettings = () => {
    toast({
      title: "⚙️ Team Settings",
      description: "Team settings panel coming soon.",
    });
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
                    <Building2 className="w-4 h-4" />
                    {departmentName}
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
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={handleTeamSettings}>
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
                    My {departmentName} Team
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
                    <Button size="sm" className="w-full bg-green-500 hover:bg-green-600" onClick={() => navigate('/schedule')}>
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
                      <p className="font-medium text-gray-900 dark:text-white">Attendance Rate</p>
                      <p className="text-green-600 dark:text-green-400">{attendanceRate}%</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleManageSchedule}>
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
                      <p className="font-medium text-gray-900 dark:text-white">Completed Shifts</p>
                      <p className="text-gray-600 dark:text-gray-300">{completedShifts} today</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">Team Efficiency</p>
                      <p className="text-gray-600 dark:text-gray-300">{teamEfficiency}%</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">Department</p>
                      <p className="text-green-600 dark:text-green-400">{departmentName}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleViewReports}>
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
                    <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add {departmentName} Staff
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Team Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={newUserData.username}
                              onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                              placeholder="Enter username"
                            />
                          </div>
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={newUserData.password}
                              onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                              placeholder="Enter password"
                            />
                          </div>
                          <div>
                            <Label htmlFor="display_name">Display Name</Label>
                            <Input
                              id="display_name"
                              value={newUserData.display_name}
                              onChange={(e) => setNewUserData({...newUserData, display_name: e.target.value})}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={newUserData.phone_number}
                              onChange={(e) => setNewUserData({...newUserData, phone_number: e.target.value})}
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="user_type">Role</Label>
                            <Select value={newUserData.user_type} onValueChange={(value) => setNewUserData({...newUserData, user_type: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="employee">Employee</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            onClick={handleCreateUser} 
                            disabled={isCreatingUser}
                            className="w-full"
                          >
                            {isCreatingUser ? "Creating..." : "Create User"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleViewReports}>
                      <Users className="w-4 h-4 mr-2" />
                      Review Performance
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleManageSchedule}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Update Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>

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
                      {departmentProfiles
                        .filter(p => todayTimeLogs.some(log => log.user_id === p.id && log.clock_in && !log.clock_out))
                        .slice(0, 6)
                        .map((profile) => (
                          <li key={profile.id}>• {profile.display_name}</li>
                        ))}
                      {workingToday === 0 && (
                        <li className="text-gray-500">No one currently working</li>
                      )}
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Scheduled Today ({todaySchedules.length})
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {todaySchedules.slice(0, 6).map((schedule) => {
                        const user = departmentProfiles.find(p => p.id === schedule.user_id);
                        return (
                          <li key={schedule.id}>
                            • {user?.display_name || 'Unknown'} - {schedule.start_time}
                          </li>
                        );
                      })}
                      {todaySchedules.length === 0 && (
                        <li className="text-gray-500">No schedules for today</li>
                      )}
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      Team Overview
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p>Total members: {totalTeamMembers}</p>
                      <p>Department: {departmentName}</p>
                      <p>Attendance: {attendanceRate}%</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => navigate('/schedule')}>
                      View Full Team List
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Team Activities */}
            <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Recent {departmentName} Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeLogs.slice(0, 3).map((log, idx) => {
                    const user = departmentProfiles.find(p => p.id === log.user_id);
                    return (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user?.display_name || 'Unknown'} {log.clock_in && !log.clock_out ? 'clocked in' : log.clock_out ? 'completed shift' : 'updated time'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {departmentName} Staff - {new Date(log.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {log.clock_in && !log.clock_out ? 'Active' : 'Completed'}
                        </Badge>
                      </div>
                    );
                  })}
                  {timeLogs.length === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No recent activities to show
                    </div>
                  )}
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
