
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, Download, Upload, RefreshCw, Globe, Smartphone, 
  Clock, Users, Building, Shield, Bell, Settings as SettingsIcon,
  Calendar, Mail, FileText, QrCode
} from 'lucide-react';

const SystemSettings = () => {
  const { toast } = useToast();
  
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'MinTid',
    defaultLanguage: 'English',
    defaultTimezone: 'Europe/Stockholm',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    weekStartDay: 'monday',
    currency: 'SEK'
  });

  const [timeTrackingSettings, setTimeTrackingSettings] = useState({
    autoClockOut: true,
    autoClockOutHours: 12,
    allowManualTimeEntry: true,
    requireLocationTracking: false,
    allowBreakTracking: true,
    roundingEnabled: true,
    roundingMinutes: 15,
    overtimeThreshold: 8
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    clockInReminders: true,
    clockOutReminders: true,
    overtimeAlerts: true,
    scheduleChanges: true,
    systemMaintenance: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 480, // minutes
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    maxLoginAttempts: 5,
    accountLockoutDuration: 30, // minutes
    twoFactorAuth: false,
    ipWhitelisting: false
  });

  const [systemSettings, setSystemSettings] = useState({
    pwaEnabled: true,
    offlineSupport: true,
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365, // days
    maintenanceMode: false,
    debugMode: false,
    analyticsEnabled: true
  });

  const updateGeneralSetting = (key: string, value: string | number | boolean) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateTimeTrackingSetting = (key: string, value: string | number | boolean) => {
    setTimeTrackingSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNotificationSetting = (key: string, value: string | number | boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSecuritySetting = (key: string, value: string | number | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSystemSetting = (key: string, value: string | number | boolean) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveAllSettings = () => {
    toast({
      title: "✅ Settings Saved",
      description: "All system settings have been saved successfully",
    });
    console.log('Saving all settings:', {
      general: generalSettings,
      timeTracking: timeTrackingSettings,
      notifications: notificationSettings,
      security: securitySettings,
      system: systemSettings
    });
  };

  const performBackup = () => {
    toast({
      title: "🔄 Backup Started",
      description: "System backup is being created...",
    });
    console.log('Performing system backup...');
  };

  const restoreBackup = () => {
    toast({
      title: "🔄 Restore Started",
      description: "Restoring from backup...",
    });
    console.log('Restoring from backup...');
  };

  const exportData = () => {
    toast({
      title: "📊 Export Started",
      description: "Exporting all system data...",
    });
    console.log('Exporting all data...');
  };

  const testNotifications = () => {
    toast({
      title: "🔔 Test Notification",
      description: "Test notification sent successfully!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Settings</h2>
          <p className="text-slate-600 dark:text-slate-400">Configure your MinTid workforce management system</p>
        </div>
        <Button onClick={saveAllSettings} className="bg-gradient-to-r from-blue-500 to-blue-600">
          Save All Settings
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="timetracking" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Tracking
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">System Name</label>
                    <Input 
                      value={generalSettings.systemName}
                      onChange={(e) => updateGeneralSetting('systemName', e.target.value)}
                      placeholder="MinTid"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Default Language</label>
                    <Select value={generalSettings.defaultLanguage} onValueChange={(value) => updateGeneralSetting('defaultLanguage', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Svenska">Svenska (Swedish)</SelectItem>
                        <SelectItem value="العربية">العربية (Arabic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Default Timezone</label>
                    <Select value={generalSettings.defaultTimezone} onValueChange={(value) => updateGeneralSetting('defaultTimezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Stockholm">Europe/Stockholm</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Currency</label>
                    <Select value={generalSettings.currency} onValueChange={(value) => updateGeneralSetting('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEK">SEK (Swedish Krona)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="AED">AED (UAE Dirham)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Format</label>
                    <Select value={generalSettings.dateFormat} onValueChange={(value) => updateGeneralSetting('dateFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-01-15)</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (15/01/2024)</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (01/15/2024)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Time Format</label>
                    <Select value={generalSettings.timeFormat} onValueChange={(value) => updateGeneralSetting('timeFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24 Hour (14:30)</SelectItem>
                        <SelectItem value="12h">12 Hour (2:30 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Week Start Day</label>
                    <Select value={generalSettings.weekStartDay} onValueChange={(value) => updateGeneralSetting('weekStartDay', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tracking Settings */}
        <TabsContent value="timetracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Tracking Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto Clock Out</label>
                    <Switch
                      checked={timeTrackingSettings.autoClockOut}
                      onCheckedChange={(checked) => updateTimeTrackingSetting('autoClockOut', checked)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Auto Clock Out After (Hours)</label>
                    <Input 
                      type="number"
                      value={timeTrackingSettings.autoClockOutHours}
                      onChange={(e) => updateTimeTrackingSetting('autoClockOutHours', parseInt(e.target.value))}
                      min="1" max="24"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Allow Manual Time Entry</label>
                    <Switch
                      checked={timeTrackingSettings.allowManualTimeEntry}
                      onCheckedChange={(checked) => updateTimeTrackingSetting('allowManualTimeEntry', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Require Location Tracking</label>
                    <Switch
                      checked={timeTrackingSettings.requireLocationTracking}
                      onCheckedChange={(checked) => updateTimeTrackingSetting('requireLocationTracking', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Allow Break Tracking</label>
                    <Switch
                      checked={timeTrackingSettings.allowBreakTracking}
                      onCheckedChange={(checked) => updateTimeTrackingSetting('allowBreakTracking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Time Rounding</label>
                    <Switch
                      checked={timeTrackingSettings.roundingEnabled}
                      onCheckedChange={(checked) => updateTimeTrackingSetting('roundingEnabled', checked)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Rounding Interval (Minutes)</label>
                    <Select 
                      value={timeTrackingSettings.roundingMinutes.toString()} 
                      onValueChange={(value) => updateTimeTrackingSetting('roundingMinutes', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Minutes</SelectItem>
                        <SelectItem value="15">15 Minutes</SelectItem>
                        <SelectItem value="30">30 Minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Overtime Threshold (Hours)</label>
                    <Input 
                      type="number"
                      value={timeTrackingSettings.overtimeThreshold}
                      onChange={(e) => updateTimeTrackingSetting('overtimeThreshold', parseInt(e.target.value))}
                      min="1" max="12"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Notification Channels</h4>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Email Notifications</label>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => updateNotificationSetting('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">SMS Notifications</label>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => updateNotificationSetting('smsNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Push Notifications</label>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => updateNotificationSetting('pushNotifications', checked)}
                    />
                  </div>

                  <Button onClick={testNotifications} variant="outline" size="sm" className="mt-2">
                    Test Notifications
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Notification Types</h4>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Clock In Reminders</label>
                    <Switch
                      checked={notificationSettings.clockInReminders}
                      onCheckedChange={(checked) => updateNotificationSetting('clockInReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Clock Out Reminders</label>
                    <Switch
                      checked={notificationSettings.clockOutReminders}
                      onCheckedChange={(checked) => updateNotificationSetting('clockOutReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Overtime Alerts</label>
                    <Switch
                      checked={notificationSettings.overtimeAlerts}
                      onCheckedChange={(checked) => updateNotificationSetting('overtimeAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Schedule Changes</label>
                    <Switch
                      checked={notificationSettings.scheduleChanges}
                      onCheckedChange={(checked) => updateNotificationSetting('scheduleChanges', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">System Maintenance</label>
                    <Switch
                      checked={notificationSettings.systemMaintenance}
                      onCheckedChange={(checked) => updateNotificationSetting('systemMaintenance', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Session Security</h4>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Session Timeout (Minutes)</label>
                    <Input 
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                      min="30" max="1440"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Login Attempts</label>
                    <Input 
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => updateSecuritySetting('maxLoginAttempts', parseInt(e.target.value))}
                      min="3" max="10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Account Lockout Duration (Minutes)</label>
                    <Input 
                      type="number"
                      value={securitySettings.accountLockoutDuration}
                      onChange={(e) => updateSecuritySetting('accountLockoutDuration', parseInt(e.target.value))}
                      min="5" max="120"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Password Policy</h4>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Minimum Password Length</label>
                    <Input 
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => updateSecuritySetting('passwordMinLength', parseInt(e.target.value))}
                      min="6" max="20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Require Special Characters</label>
                    <Switch
                      checked={securitySettings.requireSpecialChars}
                      onCheckedChange={(checked) => updateSecuritySetting('requireSpecialChars', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Require Numbers</label>
                    <Switch
                      checked={securitySettings.requireNumbers}
                      onCheckedChange={(checked) => updateSecuritySetting('requireNumbers', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Two-Factor Authentication</label>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => updateSecuritySetting('twoFactorAuth', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">IP Whitelisting</label>
                    <Switch
                      checked={securitySettings.ipWhitelisting}
                      onCheckedChange={(checked) => updateSecuritySetting('ipWhitelisting', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">PWA Support</label>
                    <Switch
                      checked={systemSettings.pwaEnabled}
                      onCheckedChange={(checked) => updateSystemSetting('pwaEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Offline Support</label>
                    <Switch
                      checked={systemSettings.offlineSupport}
                      onCheckedChange={(checked) => updateSystemSetting('offlineSupport', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto Backup</label>
                    <Switch
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) => updateSystemSetting('autoBackup', checked)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Backup Frequency</label>
                    <Select value={systemSettings.backupFrequency} onValueChange={(value) => updateSystemSetting('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Retention (Days)</label>
                    <Input 
                      type="number"
                      value={systemSettings.dataRetention}
                      onChange={(e) => updateSystemSetting('dataRetention', parseInt(e.target.value))}
                      min="30" max="3650"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Maintenance Mode</label>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => updateSystemSetting('maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Debug Mode</label>
                    <Switch
                      checked={systemSettings.debugMode}
                      onCheckedChange={(checked) => updateSystemSetting('debugMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Analytics Enabled</label>
                    <Switch
                      checked={systemSettings.analyticsEnabled}
                      onCheckedChange={(checked) => updateSystemSetting('analyticsEnabled', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Data Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={performBackup} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Create Backup
                  </Button>
                  
                  <Button variant="outline" onClick={restoreBackup} className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Restore Backup
                  </Button>
                  
                  <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Export All Data
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  System Status
                </h4>
                <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <div className="flex items-center justify-between">
                    <span>• Last backup:</span>
                    <Badge variant="secondary">Today at 03:00 AM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Database size:</span>
                    <Badge variant="secondary">2.4 MB</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Active users:</span>
                    <Badge variant="secondary">247</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Total time logs:</span>
                    <Badge variant="secondary">15,847</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• System uptime:</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">99.9%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
