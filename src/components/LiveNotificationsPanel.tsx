import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Send,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth, type Profile } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import type { NotificationRecord, ScheduleRecord, TimeLogRecord } from '@/hooks/useSupabaseData';

type LiveAction = 'reminders' | 'weekly_report' | 'test_notification' | 'emergency_alert';

interface ActionResult {
  id: string;
  action: string;
  status: 'success' | 'error';
  detail: string;
  createdAt: string;
}

interface LiveNotificationsPanelProps {
  schedules?: ScheduleRecord[];
  scopedSchedules?: ScheduleRecord[];
  scopedTimeLogs?: TimeLogRecord[];
  scopedProfiles?: Profile[];
  scopedNotifications?: NotificationRecord[];
  onRefresh?: () => Promise<void> | void;
}

const isSameDay = (left: Date, right: Date) => left.toDateString() === right.toDateString();

const formatScheduleTime = (timeValue?: string | null) => {
  if (!timeValue) return '--';
  return timeValue.slice(0, 5);
};

const formatHourValue = (value: number) => `${Math.round(value * 10) / 10}h`;

const calculateWorkedHours = (clockIn?: string | null, clockOut?: string | null) => {
  if (!clockIn || !clockOut) return 0;
  const diffMs = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  if (diffMs <= 0) return 0;
  return diffMs / (1000 * 60 * 60);
};

export function LiveNotificationsPanel({
  schedules = [],
  scopedSchedules = [],
  scopedTimeLogs = [],
  scopedProfiles = [],
  scopedNotifications = [],
  onRefresh,
}: LiveNotificationsPanelProps) {
  const { toast } = useToast();
  const { profile } = useSupabaseAuth();
  const [activeAction, setActiveAction] = useState<LiveAction | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [actionHistory, setActionHistory] = useState<ActionResult[]>([]);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayShift = schedules.find((schedule) => isSameDay(new Date(schedule.date), today));
  const upcomingShifts = schedules
    .filter((schedule) => new Date(schedule.date).getTime() > today.getTime())
    .slice(0, 3);

  const activeProfiles = scopedProfiles.filter(
    (entry) => !!entry.user_id && entry.is_active !== false && entry.user_type !== 'super_admin'
  );
  const userIdsInScope = activeProfiles
    .map((entry) => entry.user_id)
    .filter((userId): userId is string => typeof userId === 'string' && userId.length > 0);
  const userIdSet = new Set(userIdsInScope);
  const profileByUserId = new Map(
    activeProfiles
      .filter((entry) => !!entry.user_id)
      .map((entry) => [entry.user_id as string, entry])
  );

  const roleLabel = profile?.user_type ? profile.user_type.replace('_', ' ').toUpperCase() : 'USER';

  const todayTeamShifts = scopedSchedules.filter((entry) => {
    if (!userIdSet.has(entry.user_id)) return false;
    return isSameDay(new Date(entry.date), today);
  });

  const tomorrowTeamShifts = scopedSchedules.filter((entry) => {
    if (!userIdSet.has(entry.user_id)) return false;
    return isSameDay(new Date(entry.date), tomorrow);
  });

  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weeklyTeamLogs = scopedTimeLogs.filter((entry) => {
    if (!userIdSet.has(entry.user_id)) return false;
    const logDate = new Date(entry.date);
    return logDate >= weekStart && logDate <= weekEnd;
  });

  const weeklyHours = weeklyTeamLogs.reduce(
    (total, entry) => total + calculateWorkedHours(entry.clock_in, entry.clock_out),
    0
  );
  const unreadCount = scopedNotifications.filter((entry) => entry.read === false).length;

  const recentNotificationFeed = useMemo(() => {
    return [...scopedNotifications]
      .filter(
        (entry) =>
          ['schedule_reminder', 'weekly_report', 'system_test', 'emergency_alert'].includes(entry.type) ||
          ['Shift Reminder', 'Weekly Report', 'System Test', 'Emergency Alert'].includes(entry.title)
      )
      .sort((left, right) => {
        const leftDate = left.created_at ? new Date(left.created_at).getTime() : 0;
        const rightDate = right.created_at ? new Date(right.created_at).getTime() : 0;
        return rightDate - leftDate;
      })
      .slice(0, 5);
  }, [scopedNotifications]);

  const addActionHistory = (entry: Omit<ActionResult, 'id' | 'createdAt'>) => {
    setActionHistory((prev) => [
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...entry,
      },
      ...prev,
    ].slice(0, 6));
  };

  const withAction = async (action: LiveAction, handler: () => Promise<void>) => {
    if (typeof profile?.id !== 'number' && !profile?.user_id) return;
    setActiveAction(action);
    try {
      await handler();
      await onRefresh?.();
    } finally {
      setActiveAction(null);
    }
  };

  const getRecipientProfiles = () => {
    if (typeof profile?.id !== 'number' && !profile?.user_id) return [];

    if (profile.user_type === 'employee') {
      return activeProfiles.filter((entry) => entry.user_id === profile.user_id);
    }

    if (profile.user_type === 'manager') {
      return activeProfiles.filter(
        (entry) =>
          entry.department_id === profile.department_id &&
          entry.user_type !== 'org_admin'
      );
    }

    if (profile.user_type === 'org_admin') {
      return activeProfiles.filter((entry) => entry.organisation_id === profile.organisation_id);
    }

    return activeProfiles;
  };

  const handleSendTomorrowReminder = async () => {
    await withAction('reminders', async () => {
      const recipients = getRecipientProfiles();
      const recipientIds = new Set(
        recipients
          .map((entry) => entry.user_id)
          .filter((userId): userId is string => typeof userId === 'string' && userId.length > 0)
      );

      const shifts = tomorrowTeamShifts.filter((entry) => recipientIds.has(entry.user_id));
      if (shifts.length === 0) {
        const detail = 'No shifts found for tomorrow in your scope.';
        setLastAction(detail);
        addActionHistory({ action: 'Tomorrow reminders', status: 'error', detail });
        toast({
          title: 'No Reminders Sent',
          description: detail,
          variant: 'destructive',
        });
        return;
      }

      const notificationRows = shifts.map((shift) => {
        const recipient = profileByUserId.get(shift.user_id);
        if (!recipient || typeof recipient.id !== 'number') {
          return null;
        }

        const shiftDate = new Date(shift.date).toLocaleDateString();
        return {
          user_id: recipient.id,
          type: 'schedule_reminder',
          title: 'Shift Reminder',
          message: `Hi ${recipient?.display_name || recipient?.username || 'team member'}, you are scheduled on ${shiftDate} from ${formatScheduleTime(shift.start_time)} to ${formatScheduleTime(shift.end_time)}.`,
          data: {
            action: 'tomorrow_reminder',
            shift_id: shift.id,
            shift_date: shift.date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            shift_label: shift.shift || 'Regular',
            triggered_by: profile.user_id,
            triggered_role: profile.user_type,
          },
          is_read: false,
          sent_via: ['in_app'],
        };
      }).filter((row): row is NonNullable<typeof row> => !!row);

      if (notificationRows.length === 0) {
        throw new Error('No notification recipients with valid profile IDs were found');
      }

      const { error } = await supabase.from('notifications').insert(notificationRows);
      if (error) throw error;

      const detail = `Sent ${notificationRows.length} reminder${notificationRows.length === 1 ? '' : 's'} for tomorrow.`;
      setLastAction(detail);
      addActionHistory({ action: 'Tomorrow reminders', status: 'success', detail });
      toast({
        title: 'Reminders Sent',
        description: detail,
      });
    });
  };

  const handleGenerateWeeklyReport = async () => {
    await withAction('weekly_report', async () => {
      const recipients = getRecipientProfiles();
      const recipientIds = new Set(
        recipients
          .map((entry) => entry.user_id)
          .filter((userId): userId is string => typeof userId === 'string' && userId.length > 0)
      );

      const logs = weeklyTeamLogs.filter((entry) => recipientIds.has(entry.user_id));
      const employeesWorked = new Set(logs.map((entry) => entry.user_id)).size;
      const completedLogs = logs.filter((entry) => !!entry.clock_in && !!entry.clock_out);
      const totalHours = completedLogs.reduce(
        (total, entry) => total + calculateWorkedHours(entry.clock_in, entry.clock_out),
        0
      );

      const employeeBreakdownMap = new Map<string, { name: string; hours: number; sessions: number }>();
      for (const entry of completedLogs) {
        const person = profileByUserId.get(entry.user_id);
        const displayName = person?.display_name || person?.username || 'Unknown';
        const previous = employeeBreakdownMap.get(entry.user_id) || { name: displayName, hours: 0, sessions: 0 };
        previous.hours += calculateWorkedHours(entry.clock_in, entry.clock_out);
        previous.sessions += 1;
        employeeBreakdownMap.set(entry.user_id, previous);
      }

      const reportPayload = {
        report_type: 'weekly',
        generated_by: profile?.user_id || null,
        organisation_id: profile?.organisation_id || null,
        department_id: profile?.department_id || null,
        start_date: weekStart.toISOString().split('T')[0],
        end_date: weekEnd.toISOString().split('T')[0],
        data: {
          summary: {
            total_hours_worked: Math.round(totalHours * 100) / 100,
            total_work_sessions: completedLogs.length,
            total_employees: employeesWorked,
            scheduled_shifts: tomorrowTeamShifts.length + todayTeamShifts.length,
          },
          generated_by_role: profile?.user_type || 'unknown',
          employee_breakdown: Array.from(employeeBreakdownMap.entries()).map(([userId, info]) => ({
            user_id: userId,
            employee_name: info.name,
            total_hours: Math.round(info.hours * 100) / 100,
            total_sessions: info.sessions,
          })),
        },
      };

      const { data: reportRow, error: reportError } = await supabase
        .from('reports')
        .insert(reportPayload)
        .select('id')
        .single();
      if (reportError) throw reportError;

      const managerRecipients = recipients
        .filter((entry) => entry.user_type === 'manager' || entry.user_type === 'org_admin' || entry.user_id === profile?.user_id)
        .map((entry) => entry.id)
        .filter((id): id is number => typeof id === 'number' && Number.isFinite(id));
      const uniqueManagerRecipients = [...new Set(managerRecipients)];

      if (uniqueManagerRecipients.length > 0) {
        const reportNotifications = uniqueManagerRecipients.map((profileId) => ({
          user_id: profileId,
          type: 'weekly_report',
          title: 'Weekly Report',
          message: `Weekly report generated: ${formatHourValue(totalHours)} across ${employeesWorked} employee${employeesWorked === 1 ? '' : 's'}.`,
          data: {
            report_id: reportRow.id,
            week_start: reportPayload.start_date,
            week_end: reportPayload.end_date,
            generated_by: profile?.user_id || null,
          },
          is_read: false,
          sent_via: ['in_app'],
        }));

        const { error: notificationError } = await supabase.from('notifications').insert(reportNotifications);
        if (notificationError) throw notificationError;
      }

      const detail = `Report generated (${formatHourValue(totalHours)} / ${completedLogs.length} sessions).`;
      setLastAction(detail);
      addActionHistory({ action: 'Weekly report', status: 'success', detail });
      toast({
        title: 'Weekly Report Created',
        description: detail,
      });
    });
  };

  const handleTestNotification = async () => {
    await withAction('test_notification', async () => {
      if (typeof profile?.id !== 'number') return;

      const { error } = await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'system_test',
        title: 'System Test',
        message: `Notification test successful at ${new Date().toLocaleTimeString()}.`,
        data: {
          tested_by: profile.user_id,
          tested_role: profile.user_type,
        },
        is_read: false,
        sent_via: ['in_app'],
      });
      if (error) throw error;

      const detail = 'Test notification created in your inbox.';
      setLastAction(detail);
      addActionHistory({ action: 'Test notification', status: 'success', detail });
      toast({
        title: 'Test Successful',
        description: detail,
      });
    });
  };

  const handleEmergencyAlert = async () => {
    await withAction('emergency_alert', async () => {
      const recipients = getRecipientProfiles();
      const recipientProfileIds = recipients
        .map((entry) => entry.id)
        .filter((id): id is number => typeof id === 'number' && Number.isFinite(id));

      if (recipientProfileIds.length === 0) {
        const detail = 'No active recipients available for emergency alert.';
        setLastAction(detail);
        addActionHistory({ action: 'Emergency alert', status: 'error', detail });
        toast({
          title: 'Emergency Alert Failed',
          description: detail,
          variant: 'destructive',
        });
        return;
      }

      const alertRows = recipientProfileIds.map((profileId) => ({
        user_id: profileId,
        type: 'emergency_alert',
        title: 'Emergency Alert',
        message: 'Urgent: Please check your dashboard and follow manager instructions immediately.',
        data: {
          priority: 'urgent',
          triggered_by: profile?.user_id || null,
          triggered_role: profile?.user_type || null,
          triggered_at: new Date().toISOString(),
        },
        is_read: false,
        sent_via: ['in_app'],
      }));

      const { error } = await supabase.from('notifications').insert(alertRows);
      if (error) throw error;

      const detail = `Emergency alert sent to ${alertRows.length} recipient${alertRows.length === 1 ? '' : 's'}.`;
      setLastAction(detail);
      addActionHistory({ action: 'Emergency alert', status: 'success', detail });
      toast({
        title: 'Emergency Alert Sent',
        description: detail,
      });
    });
  };

  return (
    <Card className="w-full border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Live Notifications & Actions
          </CardTitle>
          <Badge className="bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900">
            {roleLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">Today Shifts</p>
            <p className="text-xl font-semibold text-blue-900 dark:text-blue-100">{todayTeamShifts.length}</p>
          </div>
          <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-300">Tomorrow Shifts</p>
            <p className="text-xl font-semibold text-amber-900 dark:text-amber-100">{tomorrowTeamShifts.length}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-3">
            <p className="text-xs text-emerald-700 dark:text-emerald-300">Weekly Hours</p>
            <p className="text-xl font-semibold text-emerald-900 dark:text-emerald-100">{formatHourValue(weeklyHours)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
            <p className="text-xs text-slate-700 dark:text-slate-300">Unread Alerts</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{unreadCount}</p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Current Status</h4>
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              System Active
            </Badge>
          </div>
          {todayShift ? (
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p>
                Today: {formatScheduleTime(todayShift.start_time)} - {formatScheduleTime(todayShift.end_time)}
              </p>
              <p>Shift: {todayShift.shift || 'General'}</p>
            </div>
          ) : (
            <p className="text-sm text-blue-700 dark:text-blue-300">No shift scheduled for today</p>
          )}
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Scope: {activeProfiles.length} active user{activeProfiles.length === 1 ? '' : 's'} in this role context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleSendTomorrowReminder}
            disabled={activeAction !== null}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 justify-start text-left"
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <div>
              <div className="font-medium">Send Tomorrow&apos;s Reminders</div>
              <div className="text-xs text-gray-500">
                {activeAction === 'reminders' ? 'Sending reminders...' : 'Write shift reminders to notification inboxes'}
              </div>
            </div>
          </Button>

          <Button
            onClick={handleGenerateWeeklyReport}
            disabled={activeAction !== null}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 justify-start text-left"
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <div>
              <div className="font-medium">Generate Weekly Report</div>
              <div className="text-xs text-gray-500">
                {activeAction === 'weekly_report' ? 'Generating report...' : 'Store weekly summary in reports table'}
              </div>
            </div>
          </Button>

          <Button
            onClick={handleTestNotification}
            disabled={activeAction !== null}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 justify-start text-left"
          >
            <Send className="w-4 h-4 shrink-0" />
            <div>
              <div className="font-medium">Test Notifications</div>
              <div className="text-xs text-gray-500">
                {activeAction === 'test_notification' ? 'Creating test notification...' : 'Create and verify in-app notification'}
              </div>
            </div>
          </Button>

          <Button
            onClick={handleEmergencyAlert}
            disabled={activeAction !== null}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 justify-start text-left border-red-200 hover:border-red-300"
          >
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <div>
              <div className="font-medium">Emergency Alert</div>
              <div className="text-xs text-gray-500">
                {activeAction === 'emergency_alert' ? 'Sending emergency alert...' : 'Broadcast urgent alert to users in scope'}
              </div>
            </div>
          </Button>
        </div>

        {upcomingShifts.length > 0 && (
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming Shifts
            </h4>
            <div className="space-y-2">
              {upcomingShifts.map((shift) => (
                <div key={shift.id} className="flex justify-between items-center text-sm">
                  <span>{new Date(shift.date).toLocaleDateString()}</span>
                  <span className="font-medium">
                    {formatScheduleTime(shift.start_time)} - {formatScheduleTime(shift.end_time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lastAction && (
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Last Action: {lastAction}</span>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-3">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Action History
          </h4>
          {actionHistory.length === 0 && recentNotificationFeed.length === 0 ? (
            <p className="text-sm text-gray-500">No recent actions yet.</p>
          ) : (
            <div className="space-y-2">
              {actionHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{entry.action}</span>
                  <span className={entry.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                    {entry.status === 'success' ? 'Success' : 'Error'}
                  </span>
                </div>
              ))}
              {actionHistory.length === 0 &&
                recentNotificationFeed.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{entry.title}</span>
                    <span className="text-gray-500">{entry.created_at ? new Date(entry.created_at).toLocaleTimeString() : '--'}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {activeAction && (
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">Processing request...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
