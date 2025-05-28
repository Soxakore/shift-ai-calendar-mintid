
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Download, Upload, RefreshCw, Globe, Smartphone } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    defaultLanguage: 'English',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '24h',
    pwaEnabled: true,
    offlineSupport: true,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const performBackup = () => {
    console.log('Performing system backup...');
    // Implementation would go here
  };

  const restoreBackup = () => {
    console.log('Restoring from backup...');
    // Implementation would go here
  };

  const exportData = () => {
    console.log('Exporting all data...');
    // Implementation would go here
  };

  const saveSettings = () => {
    console.log('Saving system settings:', settings);
    // Implementation would go here
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Default Language</label>
                <Select value={settings.defaultLanguage} onValueChange={(value) => updateSetting('defaultLanguage', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Svenska">Svenska</SelectItem>
                    <SelectItem value="العربية">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date Format</label>
                <Select value={settings.dateFormat} onValueChange={(value) => updateSetting('dateFormat', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Time Format</label>
                <Select value={settings.timeFormat} onValueChange={(value) => updateSetting('timeFormat', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 Hour</SelectItem>
                    <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">PWA Support</label>
                <Switch
                  checked={settings.pwaEnabled}
                  onCheckedChange={(checked) => updateSetting('pwaEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Offline Support</label>
                <Switch
                  checked={settings.offlineSupport}
                  onCheckedChange={(checked) => updateSetting('offlineSupport', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto Backup</label>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Backup Frequency</label>
                <Select value={settings.backupFrequency} onValueChange={(value) => updateSetting('backupFrequency', value)}>
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
          </div>

          <Button onClick={saveSettings} className="w-full">
            Save System Settings
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
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
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">System Status</h4>
            <div className="space-y-2 text-sm text-yellow-700">
              <p>• Last backup: Today at 03:00 AM</p>
              <p>• Database size: 2.4 MB</p>
              <p>• Active users: 3</p>
              <p>• Total shifts: 847</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
