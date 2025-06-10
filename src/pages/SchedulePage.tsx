import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock,
  User,
  Settings, 
  BarChart3,
  CheckCircle,
  Utensils,
  MapPin,
  Bell,
  AlertTriangle,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmployeeHeader from '@/components/EmployeeHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { LiveNotificationsPanel } from '@/components/LiveNotificationsPanel';

const SchedulePage = () => {
  const navigate = useNavigate();
  interface DatabaseTimeLog {
  id: string;
  user_id: string;
  organisation_id: string;
  department_id: string;
  date: string;
  clock_in?: string | null;
  clock_out?: string | null;
  method: string;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
}

const { toast } = useToast();
  const pageMetadata = getPageMetadata('schedule');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [systemStatus, setSystemStatus] = useState('operational');
  const [isClockingOut, setIsClockingOut] = useState(false);
  const [todayTimeLog, setTodayTimeLog] = useState<DatabaseTimeLog | null>(null);

  const { profile, user } = useSupabaseAuth();
  const { schedules, timeLogs, refetch } = useSupabaseData();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel('schedule-page-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules',
          filter: `user_id=eq.${profile.id}`
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_logs',
          filter: `user_id=eq.${profile.id}`
        },
        () => {
          refetch();
          loadTodayTimeLog();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, refetch]);

  // Load today's time log
  const loadTodayTimeLog = async () => {
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('time_logs')
      .select('*')
      .eq('user_id', profile.id)
      .eq('date', today)
      .single();

    setTodayTimeLog(data);
  };

  useEffect(() => {
    loadTodayTimeLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Get today's schedule
  const todaySchedule = schedules.find(schedule => {
    const scheduleDate = new Date(schedule.date).toDateString();
    const today = new Date().toDateString();
    return scheduleDate === today;
  });

  // Get this week's hours
  const getThisWeekHours = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate >= weekStart && scheduleDate <= weekEnd;
    }).reduce((total, schedule) => {
      const start = schedule.start_time.split(':');
      const end = schedule.end_time.split(':');
      const startHours = parseInt(start[0]) + parseInt(start[1]) / 60;
      const endHours = parseInt(end[0]) + parseInt(end[1]) / 60;
      return total + (endHours - startHours);
    }, 0);
  };

  const handleClockOut = async () => {
    if (!todayTimeLog || todayTimeLog.clock_out || isClockingOut) return;

    setIsClockingOut(true);
    const now = new Date().toISOString();

    try {
      const { error } = await supabase
        .from('time_logs')
        .update({ clock_out: now })
        .eq('id', todayTimeLog.id);

      if (error) throw error;

      toast({
        title: "Clock Out Successful",
        description: "You have been clocked out at " + currentTime.toLocaleTimeString(),
      });
    } catch (error) {
      console.error('Clock out error:', error);
      toast({
        title: "Error",
        description: "Failed to clock out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsClockingOut(false);
    }
  };

  const handleViewSchedule = () => {
    navigate('/employee');
  };

  const handleViewReports = () => {
    toast({
      title: "Reports Opened",
      description: "Loading your performance reports...",
    });
  };

  const handleViewNotifications = () => {
    toast({
      title: "Notifications",
      description: "You have 2 new notifications",
    });
  };

  const handleUpdateProfile = () => {
    toast({
      title: "Profile Settings",
      description: "Opening profile settings...",
    });
  };

  const handleViewDirectory = () => {
    toast({
      title: "Store Directory",
      description: "Loading store directory...",
    });
  };

  const weeklyHours = getThisWeekHours();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="schedule"
      />

      <EmployeeHeader onUpdateProfile={handleUpdateProfile} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/employee')}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schedule Calendar
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Detailed performance metrics and insights</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Current Shift */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Clock className="w-5 h-5" />
                Current Shift
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule ? (
                  <>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-gray-100">Today's Schedule</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {todaySchedule.start_time} - {todaySchedule.end_time}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-gray-100">Station Assignment</p>
                      <p className="text-blue-600 dark:text-blue-400">Grill Station</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-gray-100">Status</p>
                      <p className="text-blue-600 dark:text-blue-400">
                        {todayTimeLog?.clock_in && !todayTimeLog?.clock_out ? 'Active' : 
                         todayTimeLog?.clock_out ? 'Completed' : 'Scheduled'}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700" 
                      onClick={handleClockOut}
                      disabled={!todayTimeLog?.clock_in || !!todayTimeLog?.clock_out || isClockingOut}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isClockingOut ? 'Processing...' : 
                       !todayTimeLog?.clock_in ? 'Not Clocked In' :
                       todayTimeLog?.clock_out ? 'Completed' : 'Clock Out'}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 dark:text-gray-400">No shift scheduled for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Schedule */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Calendar className="w-5 h-5" />
                My Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedules.slice(0, 3).map((schedule, index) => {
                  const date = new Date(schedule.date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const dayName = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' });
                  
                  return (
                    <div key={schedule.id} className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{dayName}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {schedule.start_time} - {schedule.end_time} ({schedule.shift || 'Regular'})
                      </p>
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleViewSchedule}>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Full Calendar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Performance */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <BarChart3 className="w-5 h-5" />
                My Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-gray-100">This Week</p>
                  <p className="text-gray-600 dark:text-gray-400">{Math.round(weeklyHours)} hours worked</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Attendance Rate</p>
                  <p className="text-green-600 dark:text-green-400">
                    {timeLogs.length > 0 ? '100%' : 'No data'}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Performance Score</p>
                  <p className="text-green-600 dark:text-green-400">95/100</p>
                </div>
                <Button variant="outline" size="sm" className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleViewReports}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-blue-600 dark:text-blue-400">Schedule Update</p>
                  <p className="text-gray-600 dark:text-gray-400">Next week schedule available</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-600 dark:text-green-400">Achievement</p>
                  <p className="text-gray-600 dark:text-gray-400">Perfect attendance this month!</p>
                </div>
                <Button variant="outline" size="sm" className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleViewNotifications}>
                  <Bell className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Today's Tasks */}
        <Card className="mt-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <CheckCircle className="w-5 h-5" />
              Today's Tasks & Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-l-4 border-green-400">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <p className="font-medium text-green-800 dark:text-green-200">Completed</p>
                </div>
                <p className="text-green-700 dark:text-green-300">Food safety check</p>
                <p className="text-green-600 dark:text-green-400 text-xs">Completed at 9:15 AM</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="font-medium text-blue-800 dark:text-blue-200">In Progress</p>
                </div>
                <p className="text-blue-700 dark:text-blue-300">Grill station operations</p>
                <p className="text-blue-600 dark:text-blue-400 text-xs">Started at 11:00 AM</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border-l-4 border-yellow-400">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Upcoming</p>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300">Lunch rush prep</p>
                <p className="text-yellow-600 dark:text-yellow-400 text-xs">Starts at 2:00 PM</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border-l-4 border-purple-400">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <p className="font-medium text-purple-800 dark:text-purple-200">Goal</p>
                </div>
                <p className="text-purple-700 dark:text-purple-300">Complete 50 orders</p>
                <p className="text-purple-600 dark:text-purple-400 text-xs">Progress: 32/50</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Location Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <MapPin className="w-5 h-5" />
                Work Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">McDonald's - Downtown Branch</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">123 Main Street, Downtown</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Store Manager: Jennifer Smith</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Department: Kitchen</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Department Manager: John Kitchen</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Team Size: 24 employees</p>
                </div>
                <Button variant="outline" size="sm" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleViewDirectory}>
                  <MapPin className="w-4 h-4 mr-2" />
                  View Store Directory
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <User className="w-5 h-5" />
                My Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Employee ID: {profile?.id || '#MC-K-001'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hire Date: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'January 15, 2024'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Position: Kitchen Staff</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Contact Information</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Username: {profile?.username || 'mary.cook'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email: {user?.email || 'mary.cook@example.com'}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleUpdateProfile}>
                  <Settings className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleViewSchedule}>
                <Clock className="w-5 h-5" />
                <span className="text-sm">View Calendar</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleViewReports}>
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">My Reports</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleViewNotifications}>
                <Bell className="w-5 h-5" />
                <span className="text-sm">Notifications</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleUpdateProfile}>
                <Settings className="w-5 h-5" />
                <span className="text-sm">Profile Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Notifications Panel */}
        <div className="mt-6">
          <LiveNotificationsPanel 
            schedules={schedules} 
            currentUser={profile}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SchedulePage;
