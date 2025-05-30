
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, FileText, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ImageUpload = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image (JPG, PNG, GIF) or PDF file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    processFile(file);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate AI processing with progress updates
      const steps = [
        { step: 'Uploading file...', progress: 20 },
        { step: 'Analyzing image...', progress: 40 },
        { step: 'Extracting text...', progress: 60 },
        { step: 'Parsing schedule data...', progress: 80 },
        { step: 'Validating results...', progress: 100 }
      ];

      for (const { step, progress } of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(progress);
        
        toast({
          title: "🤖 AI Processing",
          description: step,
        });
      }

      // Simulate extracted schedule data
      const mockExtractedData = {
        scheduleFound: true,
        shifts: [
          { date: '2025-06-02', startTime: '08:00', endTime: '16:00', notes: 'Regular shift' },
          { date: '2025-06-03', startTime: '20:50', endTime: '07:08', notes: 'Night shift' },
          { date: '2025-06-04', startTime: '09:00', endTime: '17:00', notes: 'Day shift' },
          { date: '2025-06-05', startTime: '14:00', endTime: '22:00', notes: 'Evening shift' }
        ],
        confidence: 92,
        warnings: [
          'Night shift detected crossing midnight',
          'One shift has unusual duration (10+ hours)'
        ]
      };

      setExtractedData(mockExtractedData);
      
      toast({
        title: "✅ Processing Complete",
        description: `Found ${mockExtractedData.shifts.length} shifts with ${mockExtractedData.confidence}% confidence`,
      });

    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplySchedule = () => {
    if (!extractedData) return;

    // Here you would integrate with your calendar/schedule management system
    toast({
      title: "📅 Schedule Applied",
      description: `${extractedData.shifts.length} shifts have been added to your calendar`,
    });

    // Reset the upload state
    setUploadedFile(null);
    setExtractedData(null);
    setProgress(0);
  };

  const handleReject = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setProgress(0);
    
    toast({
      title: "❌ Results Rejected",
      description: "Upload results have been cleared. Try uploading a different image.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          AI Schedule Parser
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload a photo of your schedule and let AI extract the shifts automatically
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {!uploadedFile && (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={handleFileSelect}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Schedule Image</h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop or click to select an image or PDF
            </p>
            <Button variant="outline">
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Processing State */}
        {uploadedFile && isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image className="w-6 h-6 text-blue-600" />
              <span className="font-medium">{uploadedFile.name}</span>
              <Badge variant="secondary">Processing...</Badge>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 text-center">
              AI is analyzing your schedule image...
            </p>
          </div>
        )}

        {/* Results */}
        {extractedData && !isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-medium">{uploadedFile?.name}</span>
                <Badge className="bg-green-100 text-green-800">
                  {extractedData.confidence}% confidence
                </Badge>
              </div>
            </div>

            {/* Extracted Shifts */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Detected Shifts ({extractedData.shifts.length})</h4>
              <div className="space-y-2">
                {extractedData.shifts.map((shift: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div>
                      <span className="font-medium">{shift.date}</span>
                      <span className="ml-3 text-gray-600">{shift.startTime} - {shift.endTime}</span>
                    </div>
                    <Badge variant="outline">{shift.notes}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {extractedData.warnings && extractedData.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Warnings</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {extractedData.warnings.map((warning: string, index: number) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleApplySchedule} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply to Calendar
              </Button>
              <Button variant="outline" onClick={handleReject}>
                Reject & Retry
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">📸 Tips for Best Results</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure the schedule is clearly visible and well-lit</li>
            <li>• Include dates, times, and any relevant notes</li>
            <li>• Supported formats: JPG, PNG, GIF, PDF (max 5MB)</li>
            <li>• Both handwritten and digital schedules work</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
