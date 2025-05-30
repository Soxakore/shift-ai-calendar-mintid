
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import dataStore from '@/lib/dataStore';

interface ImageScheduleParserProps {
  onScheduleParsed?: (schedules: any[]) => void;
}

export const ImageScheduleParser: React.FC<ImageScheduleParserProps> = ({ onScheduleParsed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedSchedules, setParsedSchedules] = useState<any[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { t } = useTranslation();
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

      // Simulate AI parsing (in real implementation, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock parsed schedule data
      const mockSchedules = [
        {
          userId: user.id,
          organizationId: user.organizationId || '',
          departmentId: user.departmentId || '',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
          shift: 'morning' as const,
          status: 'scheduled' as const
        },
        {
          userId: user.id,
          organizationId: user.organizationId || '',
          departmentId: user.departmentId || '',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
          startTime: '10:00',
          endTime: '18:00',
          shift: 'afternoon' as const,
          status: 'scheduled' as const
        }
      ];

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
      const addedSchedules = dataStore.addScheduleFromImage(parsedSchedules);
      
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
