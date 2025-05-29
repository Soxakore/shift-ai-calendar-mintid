import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileImage, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { shiftsStorage } from '@/lib/storage';

interface ParsedShift {
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  type?: 'Day' | 'Night' | 'Overtime';
  confidence: number;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  parsedShifts?: ParsedShift[];
  error?: string;
}

const ImageUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate OCR processing with realistic delay and mock data
  const simulateOCRProcessing = async (file: File): Promise<ParsedShift[]> => {
    // Simulate different processing scenarios based on filename
    const fileName = file.name.toLowerCase();
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Mock different schedule formats
    if (fileName.includes('schedule') || fileName.includes('shift')) {
      return [
        {
          date: '2025-05-30',
          startTime: '08:00',
          endTime: '16:00',
          hours: 8,
          type: 'Day',
          confidence: 0.95
        },
        {
          date: '2025-05-31',
          startTime: '20:00',
          endTime: '06:00',
          hours: 10,
          type: 'Night',
          confidence: 0.88
        }
      ];
    } else if (fileName.includes('weekly')) {
      return [
        {
          date: '2025-06-02',
          startTime: '09:00',
          endTime: '17:00',
          hours: 8,
          type: 'Day',
          confidence: 0.92
        },
        {
          date: '2025-06-03',
          startTime: '09:00',
          endTime: '17:00',
          hours: 8,
          type: 'Day',
          confidence: 0.90
        },
        {
          date: '2025-06-04',
          startTime: '14:00',
          endTime: '22:00',
          hours: 8,
          type: 'Day',
          confidence: 0.85
        }
      ];
    } else {
      // Random schedule for other images
      const dates = ['2025-06-05', '2025-06-06', '2025-06-07'];
      return dates.map(date => ({
        date,
        startTime: '08:30',
        endTime: '16:30',
        hours: 8,
        type: 'Day' as const,
        confidence: 0.75 + Math.random() * 0.2
      }));
    }
  };

  const processFile = useCallback(async (uploadedFile: UploadedFile) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === uploadedFile.id 
        ? { ...f, status: 'processing', progress: 20 }
        : f
    ));

    try {
      // Simulate progress updates
      for (let progress = 30; progress <= 80; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, progress }
            : f
        ));
      }

      const parsedShifts = await simulateOCRProcessing(uploadedFile.file);
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100, 
              parsedShifts 
            }
          : f
      ));
    } catch (error) {
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              status: 'error', 
              error: 'Failed to process image. Please try again.' 
            }
          : f
      ));
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(),
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (const newFile of newFiles) {
      await processFile(newFile);
    }
    
    setIsProcessing(false);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const addShiftsToCalendar = (shifts: ParsedShift[]) => {
    shifts.forEach(shift => {
      shiftsStorage.add({
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        hours: shift.hours,
        type: shift.type,
        description: `Imported from image (${Math.round(shift.confidence * 100)}% confidence)`
      });
    });
    
    // Show success message
    alert(`Successfully added ${shifts.length} shifts to your calendar!`);
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          AI Schedule Upload
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload images of your work schedule and let AI automatically parse and add shifts to your calendar.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <FileImage className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the images here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag & drop schedule images here, or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Supports PNG, JPG, GIF, BMP, WebP (max 10MB each)
              </p>
            </div>
          )}
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <Alert>
            <Loader2 className="w-4 h-4 animate-spin" />
            <AlertDescription>
              Processing images with AI... This may take a few moments.
            </AlertDescription>
          </Alert>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Uploaded Files</h3>
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={uploadedFile.preview}
                    alt="Schedule preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(uploadedFile.status)}
                        <span className="font-medium">{uploadedFile.file.name}</span>
                        <Badge variant="outline">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(1)}MB
                        </Badge>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadedFile.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {uploadedFile.status === 'processing' && (
                      <div className="space-y-1">
                        <Progress value={uploadedFile.progress} className="h-2" />
                        <p className="text-sm text-gray-600">
                          {uploadedFile.progress < 50 ? 'Analyzing image...' : 'Extracting schedule data...'}
                        </p>
                      </div>
                    )}
                    
                    {uploadedFile.status === 'error' && (
                      <Alert variant="destructive">
                        <AlertDescription>{uploadedFile.error}</AlertDescription>
                      </Alert>
                    )}
                    
                    {uploadedFile.status === 'completed' && uploadedFile.parsedShifts && (
                      <div className="space-y-3">
                        <Alert>
                          <CheckCircle className="w-4 h-4" />
                          <AlertDescription>
                            Successfully parsed {uploadedFile.parsedShifts.length} shifts from the image.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Detected Shifts:</h4>
                          {uploadedFile.parsedShifts.map((shift, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium">{shift.date}</span>
                                  <span className="mx-2">•</span>
                                  <span>{shift.startTime} - {shift.endTime}</span>
                                  <span className="mx-2">•</span>
                                  <span>{shift.hours}h</span>
                                  {shift.type && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <Badge variant="outline" className="text-xs">
                                        {shift.type}
                                      </Badge>
                                    </>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(shift.confidence * 100)}% confidence
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          onClick={() => addShiftsToCalendar(uploadedFile.parsedShifts!)}
                          className="w-full"
                        >
                          Add All Shifts to Calendar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
