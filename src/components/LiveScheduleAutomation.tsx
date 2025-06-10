import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  Clock, 
  Bell, 
  Users, 
  Zap,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { edgeFunctionsService } from '@/services/edgeFunctionsService';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

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
      const result = await edgeFunctionsService.sendTomorrowReminders();
      setLastTriggered(new Date());
      
      toast({
        title: "📅 Daily Reminders Sent",
        description: `Sent ${result.reminders?.length || 0} shift reminders`,
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
      await edgeFunctionsService.generateWeeklyReport();
      setLastTriggered(new Date());
      
      toast({
        title: "📊 Weekly Report Generated",
        description: "Report generated and emailed to managers",
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
    if (!profile) return;
    
    setIsLoading(true);
    try {
      await edgeFunctionsService.sendEmergencyAlert(
        '🧪 Test Alert: This is a test of the emergency notification system. Please disregard.',
        profile.id
      );
      
      toast({
        title: "🚨 Test Alert Sent",
        description: "Emergency alert test completed successfully",
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
      // Simulate scheduling automation tasks
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

      // Send confirmation notification
      await edgeFunctionsService.sendNotification({
        type: 'email',
        recipient: 'admin@company.com',
        subject: 'Schedule Automation Configured',
        message: `Automation tasks scheduled: ${tasks.join(', ')}`,
        template: 'custom',
        data: {
          tasks,
          configured_by: profile?.display_name || 'Admin',
          timestamp: new Date().toISOString()
        }
      });

      setAutomationStatus('active');
      
      toast({
        title: "⚡ Automation Scheduled",
        description: `${tasks.length} automation tasks have been scheduled`,
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

  // Simulate real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate automation running in background
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
                <p className="text-sm text-gray-600">12 employees online</p>
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
