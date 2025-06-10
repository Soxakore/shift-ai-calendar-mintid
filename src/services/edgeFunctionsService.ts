import { supabase } from '@/integrations/supabase/client';

export interface NotificationRequest {
  type: 'email' | 'sms' | 'push';
  recipient: string;
  subject?: string;
  message: string;
  template?: 'schedule_reminder' | 'task_assigned' | 'shift_change' | 'custom';
  data?: Record<string, any>;
}

export interface ScheduleReminderRequest {
  employee_id?: string;
  days_ahead?: number;
}

export interface ReportRequest {
  report_type: 'monthly' | 'weekly' | 'custom';
  start_date?: string;
  end_date?: string;
  employee_id?: string;
  department_id?: string;
  organisation_id?: string;
}

export interface PresenceNotificationRequest {
  type: 'team_alert' | 'emergency' | 'announcement' | 'shift_change';
  message: string;
  channels?: string[];
  target_users?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sender_id: string;
}

class EdgeFunctionsService {
  
  /**
   * Send schedule reminders for upcoming shifts
   */
  async sendScheduleReminder(request: ScheduleReminderRequest) {
    try {
      const { data, error } = await supabase.functions.invoke('schedule-reminder', {
        body: request
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Schedule reminder error:', error);
      throw error;
    }
  }

  /**
   * Generate work hour reports and analytics
   */
  async generateReport(request: ReportRequest) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: request
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }

  /**
   * Send notifications via multiple channels
   */
  async sendNotification(request: NotificationRequest) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: request
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Notification sending error:', error);
      throw error;
    }
  }

  /**
   * Send presence-aware team notifications
   */
  async sendPresenceNotification(request: PresenceNotificationRequest) {
    try {
      const { data, error } = await supabase.functions.invoke('presence-notifications', {
        body: request
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Presence notification error:', error);
      throw error;
    }
  }

  /**
   * Auto-send reminder for tomorrow's shifts
   */
  async sendTomorrowReminders(employeeId?: string) {
    return this.sendScheduleReminder({
      employee_id: employeeId,
      days_ahead: 1
    });
  }

  /**
   * Generate and email weekly report
   */
  async generateWeeklyReport(employeeId?: string) {
    const reportData = await this.generateReport({
      report_type: 'weekly',
      employee_id: employeeId
    });

    // Auto-send the report via email if successful
    if (reportData.success) {
      await this.sendNotification({
        type: 'email',
        recipient: 'manager@company.com', // Could be dynamic
        subject: 'Weekly Work Hours Report',
        message: `Weekly report generated. Total hours: ${reportData.report.summary.total_hours_worked}`,
        template: 'custom',
        data: reportData.report
      });
    }

    return reportData;
  }

  /**
   * Send shift change notification to affected employees
   */
  async notifyShiftChange(changeData: {
    employee_id: string;
    employee_name: string;
    date: string;
    old_time: string;
    new_time: string;
    reason?: string;
  }) {
    return this.sendNotification({
      type: 'email',
      recipient: `${changeData.employee_id}@company.com`,
      template: 'shift_change',
      message: 'Your shift schedule has been updated',
      data: {
        employee_name: changeData.employee_name,
        date: changeData.date,
        change_type: 'Schedule Update',
        new_start_time: changeData.new_time.split('-')[0],
        new_end_time: changeData.new_time.split('-')[1],
        reason: changeData.reason || 'Schedule optimization'
      }
    });
  }

  /**
   * Send emergency alert to all online team members
   */
  async sendEmergencyAlert(message: string, senderId: string) {
    return this.sendPresenceNotification({
      type: 'emergency',
      message,
      priority: 'urgent',
      sender_id: senderId,
      channels: ['employee_workspace', 'manager_workspace']
    });
  }
}

export const edgeFunctionsService = new EdgeFunctionsService();
