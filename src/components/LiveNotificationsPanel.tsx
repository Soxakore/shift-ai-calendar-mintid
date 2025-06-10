import React, { useState } from 'react';
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
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { edgeFunctionsService } from '@/services/edgeFunctionsService';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface LiveNotificationsPanelProps {
  schedules?: any[];
  currentUser?: any;
}

export function LiveNotificationsPanel({ schedules = [], currentUser }: LiveNotificationsPanelProps) {
  const { toast } = useToast();
  const { profile } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleSendTomorrowReminder = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      const result = await edgeFunctionsService.sendTomorrowReminders(profile.id);
      setLastAction('Tomorrow\'s shift reminders sent');
      toast({
        title: "✅ Reminders Sent",
        description: `Sent ${result.reminders?.length || 0} shift reminders for tomorrow`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to send reminders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWeeklyReport = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      const result = await edgeFunctionsService.generateWeeklyReport(profile.id);
      setLastAction('Weekly report generated and emailed');
      toast({
        title: "📊 Report Generated",
        description: `Weekly report: ${result.report?.summary?.total_hours_worked || 0} hours worked`,
      });
    } catch (error) {
      toast({
        title: "❌ Error", 
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      await edgeFunctionsService.sendNotification({
        type: 'email',
        recipient: `${profile.username}@company.com`,
        subject: 'Test Notification from MinTid',
        message: 'This is a test notification to verify the system is working correctly.',
        template: 'custom',
        data: {
          employee_name: profile.display_name || profile.username,
          timestamp: new Date().toLocaleString()
        }
      });
      
      setLastAction('Test notification sent');
      toast({
        title: "📧 Test Sent",
        description: "Test notification sent successfully",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to send test notification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyAlert = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      await edgeFunctionsService.sendEmergencyAlert(
        '🚨 Emergency Alert: Please check your assigned station immediately',
        profile.id
      );
      
      setLastAction('Emergency alert sent to all team members');
      toast({
        title: "🚨 Emergency Alert Sent",
        description: "Alert sent to all online team members",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to send emergency alert",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const todayShift = schedules.find(schedule => {
    const scheduleDate = new Date(schedule.date).toDateString();
    const today = new Date().toDateString();
    return scheduleDate === today;
  });

  const upcomingShifts = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return scheduleDate >= tomorrow;
  }).slice(0, 3);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Live Notifications & Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current Status */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Current Status</h4>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              System Active
            </Badge>
          </div>
          
          {todayShift ? (
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p>📅 Today: {todayShift.start_time} - {todayShift.end_time}</p>
              <p>📍 Station: {todayShift.shift || 'General'}</p>
            </div>
          ) : (
            <p className="text-sm text-blue-700 dark:text-blue-300">No shift scheduled for today</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          <Button 
            onClick={handleSendTomorrowReminder}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4"
          >
            <Calendar className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">Send Tomorrow's Reminders</div>
              <div className="text-xs text-gray-500">Notify team of upcoming shifts</div>
            </div>
          </Button>

          <Button 
            onClick={handleGenerateWeeklyReport}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4"
          >
            <CheckCircle className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">Generate Weekly Report</div>
              <div className="text-xs text-gray-500">Create & email work summary</div>
            </div>
          </Button>

          <Button 
            onClick={handleTestNotification}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4"
          >
            <Send className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">Test Notifications</div>
              <div className="text-xs text-gray-500">Verify system connectivity</div>
            </div>
          </Button>

          <Button 
            onClick={handleEmergencyAlert}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 border-red-200 hover:border-red-300"
          >
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <div className="text-left">
              <div className="font-medium">Emergency Alert</div>
              <div className="text-xs text-gray-500">Send urgent team notification</div>
            </div>
          </Button>
        </div>

        {/* Upcoming Shifts Preview */}
        {upcomingShifts.length > 0 && (
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming Shifts
            </h4>
            <div className="space-y-2">
              {upcomingShifts.map((shift, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{new Date(shift.date).toLocaleDateString()}</span>
                  <span className="font-medium">{shift.start_time} - {shift.end_time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Action Status */}
        {lastAction && (
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Last Action: {lastAction}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
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
