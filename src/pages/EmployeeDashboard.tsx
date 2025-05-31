
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload,
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
  PieChart
} from 'lucide-react';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import WorkHoursStats from '@/components/WorkHoursStats';
import HoursWorkedChart from '@/components/HoursWorkedChart';
import MonthlyPrecisionChart from '@/components/MonthlyPrecisionChart';
import EnhancedScheduleCalendar from '@/components/EnhancedScheduleCalendar';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

const EmployeeDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [systemStatus, setSystemStatus] = useState('operational');
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPrecisionChart, setShowPrecisionChart] = useState(false);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [todayTimeLog, setTodayTimeLog] = useState<any>(null);

  const { profile } = useSupabaseAuth();
  const { schedules, timeLogs, refetch } = useSupabaseData();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time subscription for schedules and time logs
  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel('employee-dashboard-changes')
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
  }, [profile]);

  // Convert Supabase schedule data to component format
  const scheduleData = schedules.map(schedule => ({
    day: new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short' }),
    date: new Date(schedule.date).getDate(),
    hours: calculateHours(schedule.start_time, schedule.end_time).toString(),
    time: `${schedule.start_time}-${schedule.end_time}`
  }));

  const calculateHours = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const start = startHour + (startMin || 0) / 60;
    let end = endHour + (endMin || 0) / 60;
    
    if (end < start) {
      end += 24;
    }
    
    return Math.round((end - start) * 10) / 10;
  };

  const handleClockInOut = async () => {
    if (!profile || isClockingIn) return;

    setIsClockingIn(true);
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    try {
      if (!todayTimeLog) {
        // Clock in
        const { error } = await supabase
          .from('time_logs')
          .insert({
            user_id: profile.id,
            organization_id: profile.organization_id,
            department_id: profile.department_id,
            date: today,
            clock_in: now,
            method: 'manual'
          });

        if (error) throw error;

        toast({
          title: "Clocked In Successfully",
          description: `You clocked in at ${currentTime.toLocaleTimeString()}`,
        });
      } else if (!todayTimeLog.clock_out) {
        // Clock out
        const { error } = await supabase
          .from('time_logs')
          .update({ clock_out: now })
          .eq('id', todayTimeLog.id);

        if (error) throw error;

        toast({
          title: "Clocked Out Successfully",
          description: `You clocked out at ${currentTime.toLocaleTimeString()}`,
        });
      }
    } catch (error) {
      console.error('Clock in/out error:', error);
      toast({
        title: "Error",
        description: "Failed to clock in/out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsClockingIn(false);
    }
  };

  // Get today's schedule
  const todaySchedule = schedules.find(schedule => {
    const scheduleDate = new Date(schedule.date).toDateString();
    const today = new Date().toDateString();
    return scheduleDate === today;
  });

  const handleViewSchedule = () => {
    navigate('/schedule');
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

  const handleUploadImage = () => {
    toast({
      title: "Upload Schedule",
      description: "Opening image upload for schedule...",
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const urloardData = [
    { label: 'Total', hours: '32 h' },
    { label: 'Hours', hours: '148 h' }
  ];

  const toggleChartView = () => {
    setShowPrecisionChart(!showPrecisionChart);
    toast({
      title: showPrecisionChart ? "Weekly Chart View" : "Monthly Precision View",
      description: showPrecisionChart 
        ? "Switched to weekly hours chart" 
        : "Switched to monthly precision chart with detailed analytics",
    });
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

      {/* System Status Banner */}
      {systemStatus !== 'operational' && (
        <Alert className={`mx-4 mt-4 ${
          systemStatus === 'emergency' 
            ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' 
            : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
        }`}>
          <AlertTriangle className={`h-4 w-4 ${
            systemStatus === 'emergency' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
          }`} />
          <AlertDescription className={
            systemStatus === 'emergency' 
              ? 'text-red-800 dark:text-red-200' 
              : 'text-yellow-800 dark:text-yellow-200'
          }>
            <strong>System Status:</strong> {systemStatus === 'emergency' ? 'Emergency Mode Active' : 'Maintenance Mode'} - 
            Contact your manager for updates
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 dark:text-gray-400" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to MinTid, {profile?.display_name || 'Employee'}</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-500 text-white text-xs">EMPLOYEE</Badge>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <Utensils className="w-4 h-4" />
                    Kitchen Department
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={handleUpdateProfile}>
            <Settings className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">My </span>Profile
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Calendar className="w-5 h-5" />
                    Calendar
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      className="border-gray-300 dark:border-slate-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[120px] text-center">
                      {monthName}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      className="border-gray-300 dark:border-slate-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <EnhancedScheduleCalendar 
                  currentDate={currentDate}
                  scheduleData={scheduleData}
                />

                {/* Upload Button */}
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleUploadImage}
                    className="flex items-center gap-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <Upload className="w-4 h-4" />
                    Upload image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            {/* Current Shift with Clock In/Out */}
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
                        <p className="font-medium text-gray-900 dark:text-gray-100">Status</p>
                        <p className="text-blue-600 dark:text-blue-400">
                          {todayTimeLog?.clock_in && !todayTimeLog?.clock_out ? 'Clocked In' : 
                           todayTimeLog?.clock_out ? 'Completed' : 'Not Started'}
                        </p>
                      </div>
                      {todayTimeLog?.clock_in && (
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {todayTimeLog.clock_out ? 'Worked' : 'Started at'}
                          </p>
                          <p className="text-blue-600 dark:text-blue-400">
                            {new Date(todayTimeLog.clock_in).toLocaleTimeString()}
                            {todayTimeLog.clock_out && ` - ${new Date(todayTimeLog.clock_out).toLocaleTimeString()}`}
                          </p>
                        </div>
                      )}
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                        onClick={handleClockInOut}
                        disabled={isClockingIn}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {isClockingIn ? 'Processing...' : 
                         !todayTimeLog ? 'Clock In' :
                         !todayTimeLog.clock_out ? 'Clock Out' : 'Completed'}
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

            {/* Live Hours Worked Stats */}
            <WorkHoursStats scheduleData={scheduleData} currentDate={currentDate} />

            {/* Chart with Toggle */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    {showPrecisionChart ? <PieChart className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    {showPrecisionChart ? 'Monthly Analytics' : 'Weekly Chart'}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleChartView}
                    className="flex items-center gap-2"
                  >
                    {showPrecisionChart ? <BarChart3 className="w-4 h-4" /> : <PieChart className="w-4 h-4" />}
                    {showPrecisionChart ? 'Weekly' : 'Monthly'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showPrecisionChart ? (
                  <MonthlyPrecisionChart scheduleData={scheduleData} currentDate={currentDate} />
                ) : (
                  <HoursWorkedChart scheduleData={scheduleData} currentDate={currentDate} />
                )}
              </CardContent>
            </Card>

            {/* Urloard across */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Urloard across</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {urloardData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation to Detailed Dashboard */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  View detailed dashboard with performance metrics, tasks, and more.
                </p>
                <Button 
                  onClick={handleViewSchedule}
                  className="w-full flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Detailed Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EmployeeDashboard;
