
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const AISettings = () => {
  const [settings, setSettings] = useState({
    maxHoursPerDay: [8],
    minRestHours: [12],
    maxHoursPerWeek: [40],
    autoAssignShifts: false,
    requireApproval: true,
    detectConflicts: true,
    ocrConfidence: [85],
    customRules: ''
  });

  const [pendingShifts] = useState([
    { id: '1', user: 'John Smith', date: '2024-05-15', time: '08:00-16:00', confidence: 92 },
    { id: '2', user: 'Jane Doe', date: '2024-05-15', time: '16:00-00:00', confidence: 87 },
    { id: '3', user: 'Mike Brown', date: '2024-05-16', time: '00:00-08:00', confidence: 94 }
  ]);

  const updateSetting = (key: string, value: string | number | boolean | number[]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const approveShift = (id: string) => {
    console.log(`Approved shift ${id}`);
  };

  const rejectShift = (id: string) => {
    console.log(`Rejected shift ${id}`);
  };

  const saveSettings = () => {
    console.log('Saving AI settings:', settings);
    // Implementation would go here
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Behavior Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Maximum hours per day: {settings.maxHoursPerDay[0]}h
                </label>
                <Slider
                  value={settings.maxHoursPerDay}
                  onValueChange={(value) => updateSetting('maxHoursPerDay', value)}
                  max={16}
                  min={4}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Minimum rest hours: {settings.minRestHours[0]}h
                </label>
                <Slider
                  value={settings.minRestHours}
                  onValueChange={(value) => updateSetting('minRestHours', value)}
                  max={24}
                  min={8}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Maximum hours per week: {settings.maxHoursPerWeek[0]}h
                </label>
                <Slider
                  value={settings.maxHoursPerWeek}
                  onValueChange={(value) => updateSetting('maxHoursPerWeek', value)}
                  max={60}
                  min={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-assign shifts</label>
                <Switch
                  checked={settings.autoAssignShifts}
                  onCheckedChange={(checked) => updateSetting('autoAssignShifts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Require manual approval</label>
                <Switch
                  checked={settings.requireApproval}
                  onCheckedChange={(checked) => updateSetting('requireApproval', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-detect conflicts</label>
                <Switch
                  checked={settings.detectConflicts}
                  onCheckedChange={(checked) => updateSetting('detectConflicts', checked)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  OCR Confidence threshold: {settings.ocrConfidence[0]}%
                </label>
                <Slider
                  value={settings.ocrConfidence}
                  onValueChange={(value) => updateSetting('ocrConfidence', value)}
                  max={100}
                  min={50}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Custom AI Rules</label>
            <Textarea
              placeholder="Enter custom rules for AI processing (e.g., 'No night shifts for users under 18', 'Weekend shifts require manager approval')"
              value={settings.customRules}
              onChange={(e) => updateSetting('customRules', e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={saveSettings} className="w-full">
            Save AI Settings
          </Button>
        </CardContent>
      </Card>

      {/* Pending AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Pending AI Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingShifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    shift.confidence >= 90 ? 'bg-green-500' : 
                    shift.confidence >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">{shift.user}</p>
                    <p className="text-sm text-gray-600">{shift.date} • {shift.time}</p>
                  </div>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {shift.confidence}% confidence
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveShift(shift.id)}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rejectShift(shift.id)}>
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISettings;
