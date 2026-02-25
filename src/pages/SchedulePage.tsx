import React, { useEffect, useMemo, useState } from 'react';
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
  MapPin,
  Bell,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmployeeHeader from '@/components/EmployeeHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { LiveNotificationsPanel } from '@/components/LiveNotificationsPanel';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const isSameDay = (left: Date, right: Date) => left.toDateString() === right.toDateString();

const formatScheduleTime = (timeValue?: string | null) => {
  if (!timeValue) return '--';
  if (timeValue.includes('T')) {
    return new Date(timeValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const cleaned = timeValue.trim();
  if (cleaned.length >= 5) {
    return cleaned.slice(0, 5);
  }

  return cleaned;
};

const formatDateTime = (dateValue?: string | null) => {
  if (!dateValue) return '--';
  return new Date(dateValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const combineDateAndTime = (dateValue: string, timeValue?: string | null) => {
  if (!timeValue) return new Date(dateValue);
  const normalizedTime = timeValue.includes(':') ? timeValue.slice(0, 8) : '00:00:00';
  return new Date(`${dateValue}T${normalizedTime}`);
};

const calculateDurationHours = (startTime?: string | null, endTime?: string | null) => {
  if (!startTime || !endTime) return 0;

  const [startHour = 0, startMinute = 0] = startTime.split(':').map((value) => parseInt(value, 10) || 0);
  const [endHour = 0, endMinute = 0] = endTime.split(':').map((value) => parseInt(value, 10) || 0);

  const startTotalMinutes = startHour * 60 + startMinute;
  let endTotalMinutes = endHour * 60 + endMinute;
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }

  return (endTotalMinutes - startTotalMinutes) / 60;
};

const calculateWorkedHours = (clockIn?: string | null, clockOut?: string | null) => {
  if (!clockIn || !clockOut) return 0;
  const differenceMs = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  if (differenceMs <= 0) return 0;
  return differenceMs / (1000 * 60 * 60);
};

const SchedulePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pageMetadata = getPageMetadata('schedule');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockingOut, setIsClockingOut] = useState(false);

  const { profile, user } = useSupabaseAuth();
  const {
    organisations,
    departments,
    profiles,
    schedules,
    timeLogs,
    notifications,
    loading,
    refetch,
  } = useSupabaseData();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();

  const employeeSchedules = useMemo(() => {
    if (!profile?.user_id) return [];
    return schedules
      .filter((entry) => entry.user_id === profile.user_id)
      .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
  }, [schedules, profile?.user_id]);

  const employeeTimeLogs = useMemo(() => {
    if (!profile?.user_id) return [];
    return timeLogs
      .filter((entry) => entry.user_id === profile.user_id)
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
  }, [timeLogs, profile?.user_id]);

  const todaySchedule = employeeSchedules.find((entry) => isSameDay(new Date(entry.date), today));
  const todayTimeLog = employeeTimeLogs.find((entry) => isSameDay(new Date(entry.date), today));

  const upcomingSchedules = employeeSchedules
    .filter((entry) => new Date(entry.date).getTime() >= new Date(today.toDateString()).getTime())
    .slice(0, 3);

  const nextShift = employeeSchedules.find(
    (entry) => combineDateAndTime(entry.date, entry.start_time).getTime() > Date.now()
  );

  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weeklySchedules = employeeSchedules.filter((entry) => {
    const scheduleDate = new Date(entry.date);
    return scheduleDate >= weekStart && scheduleDate <= weekEnd;
  });

  const weeklyLogs = employeeTimeLogs.filter((entry) => {
    const logDate = new Date(entry.date);
    return logDate >= weekStart && logDate <= weekEnd;
  });

  const weeklyScheduledHours = weeklySchedules.reduce(
    (total, entry) => total + calculateDurationHours(entry.start_time, entry.end_time),
    0
  );
  const weeklyWorkedHours = weeklyLogs.reduce(
    (total, entry) => total + calculateWorkedHours(entry.clock_in, entry.clock_out),
    0
  );

  const scheduledDays = new Set(weeklySchedules.map((entry) => new Date(entry.date).toDateString()));
  const attendedDays = new Set(
    weeklyLogs.filter((entry) => entry.clock_in).map((entry) => new Date(entry.date).toDateString())
  );
  const attendanceRate =
    scheduledDays.size > 0 ? Math.round((attendedDays.size / scheduledDays.size) * 100) : null;

  const punctualityChecks = weeklySchedules
    .map((schedule) => {
      if (!schedule.start_time) return null;
      const matchingLog = weeklyLogs.find(
        (entry) => entry.clock_in && isSameDay(new Date(entry.date), new Date(schedule.date))
      );
      if (!matchingLog?.clock_in) return null;

      const scheduledStart = combineDateAndTime(schedule.date, schedule.start_time).getTime();
      const clockInTime = new Date(matchingLog.clock_in).getTime();
      return clockInTime <= scheduledStart + 5 * 60 * 1000;
    })
    .filter((value): value is boolean => typeof value === 'boolean');

  const punctualityRate =
    punctualityChecks.length > 0
      ? Math.round((punctualityChecks.filter(Boolean).length / punctualityChecks.length) * 100)
      : null;

  const workloadRate =
    weeklyScheduledHours > 0
      ? Math.min(100, Math.round((weeklyWorkedHours / weeklyScheduledHours) * 100))
      : null;

  const hasPerformanceData = [attendanceRate, punctualityRate, workloadRate].some(
    (value) => value !== null
  );
  const performanceScore = hasPerformanceData
    ? Math.round((attendanceRate || 0) * 0.5 + (punctualityRate || 0) * 0.25 + (workloadRate || 0) * 0.25)
    : null;

  const currentOrganisation = organisations.find((entry) => entry.id === profile?.organisation_id);
  const currentDepartment = departments.find((entry) => entry.id === profile?.department_id);
  const departmentMembers = profiles.filter(
    (entry) => profile?.department_id && entry.department_id === profile.department_id && entry.is_active
  );
  const departmentManager = departmentMembers.find((entry) => entry.user_type === 'manager');
  const orgAdmin = profiles.find(
    (entry) =>
      profile?.organisation_id &&
      entry.organisation_id === profile.organisation_id &&
      entry.user_type === 'org_admin' &&
      entry.is_active
  );

  const feedNotifications = notifications
    .filter((entry) => !entry.user_id || entry.user_id === profile?.user_id)
    .sort((left, right) => {
      const leftDate = left.created_at ? new Date(left.created_at).getTime() : 0;
      const rightDate = right.created_at ? new Date(right.created_at).getTime() : 0;
      return rightDate - leftDate;
    })
    .slice(0, 3);

  const unreadNotifications = feedNotifications.filter((entry) => entry.read === false).length;

  const weeklyGoalHours = weeklyScheduledHours > 0 ? Math.round(weeklyScheduledHours) : 40;
  const weeklyGoalProgress =
    weeklyGoalHours > 0 ? Math.min(100, Math.round((weeklyWorkedHours / weeklyGoalHours) * 100)) : 0;

  const completedTask = todayTimeLog?.clock_out
    ? `Shift completed at ${formatDateTime(todayTimeLog.clock_out)}`
    : weeklyWorkedHours > 0
      ? `${Math.round(weeklyWorkedHours)} hours completed this week`
      : 'No completed shift logged yet';

  const inProgressTask =
    todayTimeLog?.clock_in && !todayTimeLog.clock_out
      ? `Clocked in at ${formatDateTime(todayTimeLog.clock_in)}`
      : todaySchedule
        ? `Shift starts at ${formatScheduleTime(todaySchedule.start_time)}`
        : 'No active shift right now';

  const upcomingTask = nextShift
    ? `${new Date(nextShift.date).toLocaleDateString()} at ${formatScheduleTime(nextShift.start_time)}`
    : 'No upcoming shifts scheduled';

  const handleClockOut = async () => {
    if (!todayTimeLog || todayTimeLog.clock_out || isClockingOut) return;

    setIsClockingOut(true);
    const now = new Date().toISOString();

    try {
      const { error } = await supabase.from('time_logs').update({ clock_out: now }).eq('id', todayTimeLog.id);
      if (error) throw error;

      toast({
        title: 'Clock Out Successful',
        description: `You have been clocked out at ${currentTime.toLocaleTimeString()}`,
      });
      await refetch();
    } catch (error) {
      console.error('Clock out error:', error);
      toast({
        title: 'Error',
        description: 'Failed to clock out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsClockingOut(false);
    }
  };

  const handleViewReports = () => {
    toast({
      title: 'Weekly Summary',
      description: `${Math.round(weeklyWorkedHours)}h worked vs ${Math.round(weeklyScheduledHours)}h scheduled`,
    });
  };

  const handleViewNotifications = () => {
    toast({
      title: 'Notifications',
      description:
        unreadNotifications > 0
          ? `${unreadNotifications} unread notification${unreadNotifications > 1 ? 's' : ''}`
          : 'No unread notifications',
    });
  };

  const handleUpdateProfile = () => {
    navigate('/employee');
    toast({
      title: 'Profile',
      description: 'Use the employee dashboard profile panel to update details.',
    });
  };

  const handleViewDirectory = () => {
    toast({
      title: 'Team Directory',
      description: `${departmentMembers.length} active team member${departmentMembers.length === 1 ? '' : 's'} in ${
        currentDepartment?.name || 'your department'
      }.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading detailed dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="schedule"
      />

      <EmployeeHeader
        onUpdateProfile={handleUpdateProfile}
        userName={profile?.display_name || profile?.username || 'Employee'}
        departmentName={currentDepartment?.name || 'Unassigned Department'}
        isOnline={true}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
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

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Detailed performance metrics and insights</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                      <p className="font-medium text-gray-900 dark:text-gray-100">Today&apos;s Schedule</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatScheduleTime(todaySchedule.start_time)} - {formatScheduleTime(todaySchedule.end_time)}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-gray-100">Shift Type</p>
                      <p className="text-blue-600 dark:text-blue-400">{todaySchedule.shift || 'Regular shift'}</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-gray-100">Status</p>
                      <p className="text-blue-600 dark:text-blue-400">
                        {todayTimeLog?.clock_in && !todayTimeLog.clock_out
                          ? 'Active'
                          : todayTimeLog?.clock_out
                            ? 'Completed'
                            : 'Scheduled'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                      onClick={handleClockOut}
                      disabled={!todayTimeLog?.clock_in || !!todayTimeLog.clock_out || isClockingOut}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isClockingOut
                        ? 'Processing...'
                        : !todayTimeLog?.clock_in
                          ? 'Not Clocked In'
                          : todayTimeLog?.clock_out
                            ? 'Completed'
                            : 'Clock Out'}
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

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Calendar className="w-5 h-5" />
                My Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSchedules.length > 0 ? (
                  upcomingSchedules.map((entry) => {
                    const date = new Date(entry.date);
                    const isToday = isSameDay(date, today);
                    const dayName = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' });

                    return (
                      <div key={entry.id} className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{dayName}</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {formatScheduleTime(entry.start_time)} - {formatScheduleTime(entry.end_time)} ({entry.shift || 'Regular'})
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No upcoming shifts available.</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={() => navigate('/employee')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Full Calendar
                </Button>
              </div>
            </CardContent>
          </Card>

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
                  <p className="text-gray-600 dark:text-gray-400">
                    {Math.round(weeklyWorkedHours)}h worked / {Math.round(weeklyScheduledHours)}h scheduled
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Attendance Rate</p>
                  <p className="text-green-600 dark:text-green-400">
                    {attendanceRate !== null ? `${attendanceRate}%` : 'No schedule data'}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Performance Score</p>
                  <p className="text-green-600 dark:text-green-400">
                    {performanceScore !== null ? `${performanceScore}/100` : 'Insufficient data'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={handleViewReports}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedNotifications.length > 0 ? (
                  feedNotifications.map((entry) => (
                    <div key={entry.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-blue-600 dark:text-blue-400">{entry.title}</p>
                        {entry.read === false && (
                          <Badge variant="destructive" className="text-xs text-white">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{entry.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No notifications available.</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={handleViewNotifications}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <CheckCircle className="w-5 h-5" />
              Today&apos;s Tasks & Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-l-4 border-green-400">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <p className="font-medium text-green-800 dark:text-green-200">Completed</p>
                </div>
                <p className="text-green-700 dark:text-green-300">Shift progress</p>
                <p className="text-green-600 dark:text-green-400 text-xs">{completedTask}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="font-medium text-blue-800 dark:text-blue-200">In Progress</p>
                </div>
                <p className="text-blue-700 dark:text-blue-300">Current activity</p>
                <p className="text-blue-600 dark:text-blue-400 text-xs">{inProgressTask}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border-l-4 border-yellow-400">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Upcoming</p>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300">Next scheduled shift</p>
                <p className="text-yellow-600 dark:text-yellow-400 text-xs">{upcomingTask}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border-l-4 border-purple-400">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <p className="font-medium text-purple-800 dark:text-purple-200">Goal</p>
                </div>
                <p className="text-purple-700 dark:text-purple-300">Weekly target {weeklyGoalHours}h</p>
                <p className="text-purple-600 dark:text-purple-400 text-xs">Progress: {weeklyGoalProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {currentOrganisation?.name || 'Organisation not assigned'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Department: {currentDepartment?.name || 'Not assigned'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Organisation Admin: {orgAdmin?.display_name || 'Not assigned'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Team Lead: {departmentManager?.display_name || 'Not assigned'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Team Size: {departmentMembers.length} active member{departmentMembers.length === 1 ? '' : 's'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Next shift: {nextShift ? new Date(nextShift.date).toLocaleDateString() : 'Not scheduled'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={handleViewDirectory}
                >
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
                  <p className="font-medium text-gray-900 dark:text-gray-100">Employee ID: {profile?.id || '-'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hire Date: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Position: {currentDepartment?.name ? `${currentDepartment.name} Staff` : 'Employee'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Contact Information</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Username: {profile?.username || '-'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email: {user?.email || '-'}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={handleUpdateProfile}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => navigate('/employee')}
              >
                <Clock className="w-5 h-5" />
                <span className="text-sm">View Calendar</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={handleViewReports}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">My Reports</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={handleViewNotifications}
              >
                <Bell className="w-5 h-5" />
                <span className="text-sm">Notifications</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={handleUpdateProfile}
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm">Profile Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <LiveNotificationsPanel
            schedules={employeeSchedules}
            scopedSchedules={schedules}
            scopedTimeLogs={timeLogs}
            scopedProfiles={profiles}
            scopedNotifications={notifications}
            onRefresh={refetch}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SchedulePage;
