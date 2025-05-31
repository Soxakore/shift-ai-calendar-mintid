import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Upload, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface ParsedSchedule {
  userId: string;
  organizationId: string;
  departmentId: string;
  date: string;
  startTime: string;
  endTime: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'scheduled' | 'checked-in' | 'checked-out' | 'absent' | 'sick';
}

interface ImageScheduleParserProps {
  onScheduleParsed?: (schedules: ParsedSchedule[]) => void;
}

export const ImageScheduleParser: React.FC<ImageScheduleParserProps> = ({ onScheduleParsed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedSchedules, setParsedSchedules] = useState<ParsedSchedule[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Mock user data
  const user = {
    id: 'mock-user-id',
    organizationId: 'mock-org-id',
    departmentId: 'mock-dept-id'
  };
  
  // Mock translation function
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'success': 'Success',
      'error': 'Error'
    };
    return translations[key] || key;
  };
  
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsProcessing(true);
    
    try {
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Enhanced AI parsing simulation with better mock data
      const simulateAIParsing = async (file: File): Promise<ParsedSchedule[]> => {
        // Simulate processing time based on file size
        const processingTime = Math.min(3000, Math.max(1000, file.size / 1000));
        await new Promise(resolve => setTimeout(resolve, processingTime));
        
        // Generate more realistic mock schedules
        const shifts = ['morning', 'afternoon', 'night'] as const;
        const statuses = ['scheduled', 'checked-in'] as const;
        const today = new Date();
        
        const mockSchedules: ParsedSchedule[] = [];
        
        // Generate 3-7 schedule entries
        const numEntries = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < numEntries; i++) {
          const scheduleDate = new Date(today);
          scheduleDate.setDate(today.getDate() + i);
          
          const shiftType = shifts[Math.floor(Math.random() * shifts.length)];
          const startTimes = {
            morning: ['06:00', '07:00', '08:00', '09:00'],
            afternoon: ['12:00', '13:00', '14:00', '15:00'],
            night: ['18:00', '19:00', '20:00', '21:00']
          };
          
          const startTime = startTimes[shiftType][Math.floor(Math.random() * startTimes[shiftType].length)];
          const startHour = parseInt(startTime.split(':')[0]);
          const endTime = `${String(startHour + 8).padStart(2, '0')}:00`;
          
          mockSchedules.push({
            userId: user?.id || '',
            organizationId: user?.organizationId || '',
            departmentId: user?.departmentId || '',
            date: scheduleDate.toISOString().split('T')[0],
            startTime,
            endTime,
            shift: shiftType,
            status: statuses[Math.floor(Math.random() * statuses.length)]
          });
        }
        
        return mockSchedules;
      };

      // Simulate AI parsing (in real implementation, this would call an AI service)
      const mockSchedules = await simulateAIParsing(file);

      setParsedSchedules(mockSchedules);
      
      toast({
        title: t('success'),
        description: `Parsed ${mockSchedules.length} schedule entries from image`
      });

    } catch (error) {
      toast({
        title: t('error'),
        description: "Failed to process image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToCalendar = async () => {
    if (parsedSchedules.length === 0) return;

    try {
      // Mock data store implementation
      const addedSchedules = parsedSchedules.map(schedule => ({
        ...schedule,
        id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: t('success'),
        description: `Added ${addedSchedules.length} schedule entries to calendar`
      });

      onScheduleParsed?.(addedSchedules);
      
      // Reset state
      setParsedSchedules([]);
      setUploadedImage(null);
      
    } catch (error) {
      toast({
        title: t('error'),
        description: "Failed to add schedules to calendar",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Image Schedule Parser
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {uploadedImage ? (
            <div className="space-y-4">
              <img 
                src={uploadedImage} 
                alt="Uploaded schedule" 
                className="max-h-40 mx-auto rounded-lg"
              />
              <p className="text-sm text-gray-600">Schedule image uploaded</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium">Upload Schedule Image</p>
                <p className="text-sm text-gray-600">
                  Upload an image containing schedule information to automatically parse and add to calendar
                </p>
              </div>
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="schedule-upload"
            disabled={isProcessing}
          />
          <label htmlFor="schedule-upload">
            <Button 
              variant="outline" 
              className="mt-4"
              disabled={isProcessing}
              asChild
            >
              <span>
                {isProcessing ? t('loading') : 'Choose Image'}
              </span>
            </Button>
          </label>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Processing image with AI...</p>
          </div>
        )}

        {/* Parsed Results */}
        {parsedSchedules.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Parsed Schedule Entries
              </h4>
              <Badge variant="outline">
                {parsedSchedules.length} entries
              </Badge>
            </div>
            
            <div className="space-y-2">
              {parsedSchedules.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium">{schedule.date}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                        <Badge variant="outline" className="text-xs">
                          {schedule.shift}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button onClick={handleAddToCalendar} className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageScheduleParser;
