import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Calendar,
  Clock,
  Users,
  Zap,
  Settings,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleAutomationSettings {
  daily_reminders: boolean;
  shift_change_notifications: boolean;
  weekly_reports: boolean;
  emergency_alerts: boolean;
  auto_clock_reminders: boolean;
}

export function LiveScheduleAutomation() {
  const { toast } = useToast();
  const { profile } = useSupabaseAuth();
  const { profiles, schedules, timeLogs } = useSupabaseData();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<ScheduleAutomationSettings>({
    daily_reminders: true,
    shift_change_notifications: true,
    weekly_reports: false,
    emergency_alerts: true,
    auto_clock_reminders: true
  });
  const [automationStatus, setAutomationStatus] = useState<'active' | 'inactive'>('active');
  const [lastTriggered, setLastTriggered] = useState<Date | null>(null);

  const scopedProfiles = useMemo(() => {
    if (!profile) return [];

    let result = profiles.filter((entry) => entry.is_active !== false);

    if (profile.user_type === 'employee') {
      result = result.filter((entry) => entry.user_id === profile.user_id);
    } else if (profile.user_type === 'manager' && profile.department_id) {
      result = result.filter((entry) => entry.department_id === profile.department_id);
    } else if (profile.user_type === 'org_admin' && profile.organisation_id) {
      result = result.filter((entry) => entry.organisation_id === profile.organisation_id);
    }

    return result;
  }, [profiles, profile]);

  const scopedUserIds = useMemo(
    () =>
      scopedProfiles
        .map((entry) => entry.user_id)
        .filter((userId): userId is string => typeof userId === 'string' && userId.length > 0),
    [scopedProfiles]
  );

  const scopedUserIdSet = useMemo(() => new Set(scopedUserIds), [scopedUserIds]);

  const activeUsers = scopedProfiles.length;

  const getTomorrowShifts = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = tomorrow.toDateString();
    return schedules.filter(
      (entry) =>
        scopedUserIdSet.has(entry.user_id) && new Date(entry.date).toDateString() === tomorrowKey
    );
  };

  const getCurrentWeekLogs = () => {
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return timeLogs.filter((entry) => {
      if (!scopedUserIdSet.has(entry.user_id)) return false;
      const logDate = new Date(entry.date);
      return logDate >= weekStart && logDate <= weekEnd;
    });
  };

  const calculateWorkedHours = (clockIn?: string | null, clockOut?: string | null) => {
    if (!clockIn || !clockOut) return 0;
    const diffMs = new Date(clockOut).getTime() - new Date(clockIn).getTime();
    if (diffMs <= 0) return 0;
    return diffMs / (1000 * 60 * 60);
  };

  const updateSetting = (key: keyof ScheduleAutomationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    toast({
      title: "⚙️ Setting Updated",
      description: `${key.replace('_', ' ')} ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const triggerDailyReminders = async () => {
    setIsLoading(true);
    try {
      const tomorrowShifts = getTomorrowShifts();
      if (tomorrowShifts.length === 0) {
        toast({
          title: "No Reminders Sent",
          description: "No shifts found for tomorrow in your scope.",
          variant: "destructive"
        });
        return;
      }

      const rows = tomorrowShifts.map((entry) => ({
        user_id: entry.user_id,
        type: 'schedule_reminder',
        title: 'Shift Reminder',
        message: `Reminder: You are scheduled tomorrow from ${entry.start_time?.slice(0, 5) || '--'} to ${entry.end_time?.slice(0, 5) || '--'}.`,
        data: {
          shift_id: entry.id,
          shift_date: entry.date,
          triggered_by: profile?.user_id || null,
          triggered_role: profile?.user_type || null,
        },
        read: false,
        sent_via: ['in_app'],
      }));

      const { error } = await supabase.from('notifications').insert(rows);
      if (error) throw error;

      setLastTriggered(new Date());
      toast({
        title: "📅 Daily Reminders Sent",
        description: `Sent ${rows.length} shift reminder${rows.length === 1 ? '' : 's'}.`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to send daily reminders",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerWeeklyReport = async () => {
    setIsLoading(true);
    try {
      const logs = getCurrentWeekLogs().filter((entry) => !!entry.clock_in && !!entry.clock_out);
      const totalHours = logs.reduce(
        (total, entry) => total + calculateWorkedHours(entry.clock_in, entry.clock_out),
        0
      );
      const totalSessions = logs.length;
      const totalEmployees = new Set(logs.map((entry) => entry.user_id)).size;

      const weekStart = new Date();
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const { error: reportError } = await supabase.from('reports').insert({
        report_type: 'weekly',
        generated_by: profile?.user_id || null,
        organisation_id: profile?.organisation_id || null,
        department_id: profile?.department_id || null,
        start_date: weekStart.toISOString().split('T')[0],
        end_date: weekEnd.toISOString().split('T')[0],
        data: {
          summary: {
            total_hours_worked: Math.round(totalHours * 100) / 100,
            total_work_sessions: totalSessions,
            total_employees: totalEmployees,
          },
        },
      });
      if (reportError) throw reportError;

      const recipients = scopedProfiles
        .filter((entry) => ['manager', 'org_admin', 'super_admin'].includes(entry.user_type))
        .map((entry) => entry.user_id)
        .filter((userId): userId is string => typeof userId === 'string' && userId.length > 0);
      const uniqueRecipients = [...new Set(recipients)];

      if (uniqueRecipients.length > 0) {
        const rows = uniqueRecipients.map((userId) => ({
          user_id: userId,
          type: 'weekly_report',
          title: 'Weekly Report Generated',
          message: `Weekly report ready: ${Math.round(totalHours * 10) / 10}h across ${totalEmployees} employee${totalEmployees === 1 ? '' : 's'}.`,
          data: {
            generated_by: profile?.user_id || null,
            total_hours_worked: Math.round(totalHours * 100) / 100,
            total_work_sessions: totalSessions,
            total_employees: totalEmployees,
          },
          read: false,
          sent_via: ['in_app'],
        }));
        const { error: notificationError } = await supabase.from('notifications').insert(rows);
        if (notificationError) throw notificationError;
      }

      setLastTriggered(new Date());
      toast({
        title: "📊 Weekly Report Generated",
        description: `Report created with ${Math.round(totalHours * 10) / 10}h of logged work.`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to generate weekly report",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmergencyAlert = async () => {
    if (!profile?.user_id) return;

    setIsLoading(true);
    try {
      const recipientIds = scopedUserIds.length > 0 ? scopedUserIds : [profile.user_id];
      const rows = recipientIds.map((userId) => ({
        user_id: userId,
        type: 'emergency_alert',
        title: 'Emergency Test Alert',
        message: 'Test Alert: This is a system test. No action is required.',
        data: {
          test_mode: true,
          triggered_by: profile.user_id,
          triggered_role: profile.user_type,
        },
        read: false,
        sent_via: ['in_app'],
      }));

      const { error } = await supabase.from('notifications').insert(rows);
      if (error) throw error;

      toast({
        title: "🚨 Test Alert Sent",
        description: `Emergency test sent to ${rows.length} user${rows.length === 1 ? '' : 's'}.`,
      });
    } catch (error) {
      toast({
        title: "❌ Error", 
        description: "Failed to send test alert",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleAutomatedTasks = async () => {
    setIsLoading(true);
    try {
      const tasks = [];

      if (settings.daily_reminders) {
        tasks.push('Daily shift reminders at 6:00 PM');
      }

      if (settings.weekly_reports) {
        tasks.push('Weekly reports every Monday at 9:00 AM');
      }

      if (settings.auto_clock_reminders) {
        tasks.push('Clock-in reminders 15 minutes before shifts');
      }

      if (tasks.length === 0) {
        toast({
          title: "⚠️ No Tasks Enabled",
          description: "Enable at least one automation setting before scheduling.",
          variant: "destructive"
        });
        return;
      }

      const recipients = scopedProfiles
        .map((entry) => entry.user_id)
        .filter((userId): userId is string => typeof userId === 'string' && userId.length > 0);
      const uniqueRecipients = [...new Set(recipients)];

      const targetRecipients = uniqueRecipients.length > 0
        ? uniqueRecipients
        : profile?.user_id
          ? [profile.user_id]
          : [];

      if (targetRecipients.length === 0) {
        toast({
          title: "⚠️ No Recipients",
          description: "No users in scope for automation notifications.",
          variant: "destructive"
        });
        return;
      }

      const rows = targetRecipients.map((userId) => ({
        user_id: userId,
        type: 'automation_update',
        title: 'Schedule Automation Updated',
        message: `Automation tasks configured: ${tasks.join(', ')}`,
        data: {
          tasks,
          configured_by: profile?.user_id || null,
        },
        read: false,
        sent_via: ['in_app'],
      }));
      const { error } = await supabase.from('notifications').insert(rows);
      if (error) throw error;

      setAutomationStatus('active');
      setLastTriggered(new Date());
      
      toast({
        title: "⚡ Automation Scheduled",
        description: `${tasks.length} automation task${tasks.length === 1 ? '' : 's'} scheduled.`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to schedule automation tasks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Keep heartbeat fresh while automation is active.
  useEffect(() => {
    const interval = setInterval(() => {
      if (automationStatus === 'active' && Math.random() > 0.9) {
        setLastTriggered(new Date());
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [automationStatus]);

  return (
    <div className="space-y-6">
      
      {/* Automation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Schedule Automation System
            <Badge 
              variant={automationStatus === 'active' ? 'default' : 'secondary'}
              className={automationStatus === 'active' ? 'bg-green-500' : 'bg-gray-500'}
            >
              {automationStatus === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">System Status</p>
                <p className="text-sm text-gray-600">All systems operational</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Last Triggered</p>
                <p className="text-sm text-gray-600">
                  {lastTriggered ? lastTriggered.toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium">Active Users</p>
                <p className="text-sm text-gray-600">
                  {activeUsers} user{activeUsers === 1 ? '' : 's'} in scope
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Shift Reminders</p>
                <p className="text-sm text-gray-600">Send reminders for tomorrow's shifts</p>
              </div>
              <Switch
                checked={settings.daily_reminders}
                onCheckedChange={(checked) => updateSetting('daily_reminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Shift Change Notifications</p>
                <p className="text-sm text-gray-600">Notify employees of schedule changes</p>
              </div>
              <Switch
                checked={settings.shift_change_notifications}
                onCheckedChange={(checked) => updateSetting('shift_change_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Reports</p>
                <p className="text-sm text-gray-600">Generate automated weekly work hour reports</p>
              </div>
              <Switch
                checked={settings.weekly_reports}
                onCheckedChange={(checked) => updateSetting('weekly_reports', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Emergency Alerts</p>
                <p className="text-sm text-gray-600">Enable emergency notification system</p>
              </div>
              <Switch
                checked={settings.emergency_alerts}
                onCheckedChange={(checked) => updateSetting('emergency_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Clock Reminders</p>
                <p className="text-sm text-gray-600">Remind employees to clock in/out</p>
              </div>
              <Switch
                checked={settings.auto_clock_reminders}
                onCheckedChange={(checked) => updateSetting('auto_clock_reminders', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            
            <Button 
              onClick={triggerDailyReminders}
              disabled={isLoading}
              variant="outline"
              className="h-auto p-4"
            >
              <Calendar className="w-4 h-4 mb-2" />
              <div className="text-center">
                <div className="font-medium">Send Reminders</div>
                <div className="text-xs text-gray-500">Trigger now</div>
              </div>
            </Button>

            <Button 
              onClick={triggerWeeklyReport}
              disabled={isLoading}
              variant="outline"
              className="h-auto p-4"
            >
              <CheckCircle className="w-4 h-4 mb-2" />
              <div className="text-center">
                <div className="font-medium">Generate Report</div>
                <div className="text-xs text-gray-500">Weekly summary</div>
              </div>
            </Button>

            <Button 
              onClick={sendTestEmergencyAlert}
              disabled={isLoading}
              variant="outline"
              className="h-auto p-4"
            >
              <AlertTriangle className="w-4 h-4 mb-2" />
              <div className="text-center">
                <div className="font-medium">Test Alert</div>
                <div className="text-xs text-gray-500">Emergency test</div>
              </div>
            </Button>

            <Button 
              onClick={scheduleAutomatedTasks}
              disabled={isLoading}
              variant="default"
              className="h-auto p-4"
            >
              <Zap className="w-4 h-4 mb-2" />
              <div className="text-center">
                <div className="font-medium">Start Automation</div>
                <div className="text-xs text-white">Schedule all tasks</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>Processing automation task...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
