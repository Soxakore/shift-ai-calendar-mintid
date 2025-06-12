import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Image, 
  FileText, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  ArrowDownToLine,
  HardDrive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import {
  SmartUploadManager,
  BUCKET_CONFIGS,
  formatBytes,
  type CompressionResult
} from '@/lib/storageOptimizationMock';

interface SmartFileUploadProps {
  bucket: string;
  onUploadSuccess?: (data: { path: string; url?: string }, savings?: number) => void;
  onUploadError?: (error: Error | string) => void;
  allowMultiple?: boolean;
  maxFiles?: number;
  className?: string;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'compressing' | 'uploading' | 'success' | 'error';
  error?: string;
  compressionResult?: CompressionResult;
  finalSize?: number;
  savings?: number;
}

const SmartFileUpload: React.FC<SmartFileUploadProps> = ({
  bucket,
  onUploadSuccess,
  onUploadError,
  allowMultiple = false,
  maxFiles = 5,
  className = ""
}) => {
  const { profile } = useSupabaseAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const bucketConfig = BUCKET_CONFIGS[bucket as keyof typeof BUCKET_CONFIGS];
  
  if (!bucketConfig) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Invalid bucket configuration for: {bucket}
        </AlertDescription>
      </Alert>
    );
  }
  
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!bucketConfig.allowedTypes.includes(file.type)) {
      return `File type ${file.type} not allowed. Allowed types: ${bucketConfig.allowedTypes.join(', ')}`;
    }
    
    // Check file size
    if (file.size > bucketConfig.maxSize) {
      return `File size ${formatBytes(file.size)} exceeds maximum ${formatBytes(bucketConfig.maxSize)}`;
    }
    
    return null;
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };
  
  const addFiles = (files: File[]) => {
    const validFiles: UploadFile[] = [];
    
    for (const file of files) {
      // Check max files limit
      if (uploadFiles.length + validFiles.length >= maxFiles) {
        toast({
          title: "⚠️ Too Many Files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive"
        });
        break;
      }
      
      // Validate file
      const validation = validateFile(file);
      if (validation) {
        toast({
          title: "❌ Invalid File",
          description: validation,
          variant: "destructive"
        });
        continue;
      }
      
      validFiles.push({
        file,
        id: `${Date.now()}-${Math.random()}`,
        progress: 0,
        status: 'pending'
      });
    }
    
    setUploadFiles(prev => [...prev, ...validFiles]);
  };
  
  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));    };
  
  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    
    setIsUploading(true);
    let totalSavings = 0;
    
    try {
      for (const uploadFile of uploadFiles) {
        if (uploadFile.status !== 'pending') continue;
        
        // Update status to compressing if needed
        if (bucketConfig.autoCompress && uploadFile.file.type.startsWith('image/')) {
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, status: 'compressing' as const } : f
          ));
        }
        
        // Update status to uploading
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
        ));
        
        const path = `${profile?.organisation_id}/${Date.now()}-${uploadFile.file.name}`;
        
        try {
          const result = await SmartUploadManager.uploadWithOptimization(
            uploadFile.file,
            bucket,
            path,
            profile?.organisation_id
          );
          
          if (result.error) {
            throw new Error('Upload failed');
          }
          
          const savings = result.savings || 0;
          totalSavings += savings;
          
          // Update file status
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { 
              ...f, 
              status: 'success' as const, 
              progress: 100,
              savings,
              finalSize: uploadFile.file.size - savings
            } : f
          ));
          
          if (onUploadSuccess) {
            onUploadSuccess(result.data, savings);
          }
          
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { 
              ...f, 
              status: 'error' as const, 
              error: errorMessage 
            } : f
          ));
          
          if (onUploadError) {
            onUploadError(error instanceof Error ? error : new Error(errorMessage));
          }
        }
      }
      
      if (totalSavings > 0) {
        toast({
          title: "🎯 Upload Optimized!",
          description: `Saved ${formatBytes(totalSavings)} through smart compression`,
        });
      } else {
        toast({
          title: "✅ Upload Complete",
          description: "All files uploaded successfully",
        });
      }
      
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };
  
  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return <FileText className="w-4 h-4 text-gray-500" />;
      case 'compressing': return <ArrowDownToLine className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'uploading': return <Upload className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };
  
  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return 'Ready to upload';
      case 'compressing': return 'Optimizing...';
      case 'uploading': return 'Uploading...';
      case 'success': return 'Complete';
      case 'error': return 'Failed';
    }
  };
  
  const totalSavings = uploadFiles.reduce((total, file) => total + (file.savings || 0), 0);
  const successfulUploads = uploadFiles.filter(f => f.status === 'success').length;
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Smart File Upload
          <Badge variant="outline">{bucket}</Badge>
        </CardTitle>
        <div className="text-sm text-gray-600">
          <p>Max size: {formatBytes(bucketConfig.maxSize)} • Compression: {bucketConfig.autoCompress ? 'Enabled' : 'Disabled'}</p>
          <p>Allowed: {bucketConfig.allowedTypes.join(', ')}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400'
          }`}
          onClick={handleFileSelect}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                {bucketConfig.autoCompress && (
                  <Zap className="w-6 h-6 text-blue-500" />
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {dragActive ? 'Drop files here' : 'Upload Files'}
              </h3>
              <p className="text-sm text-gray-600">
                Drag and drop or click to select {allowMultiple ? 'files' : 'a file'}
              </p>
              {bucketConfig.autoCompress && (
                <p className="text-xs text-blue-600 mt-1">
                  ⚡ Smart compression enabled
                </p>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={bucketConfig.allowedTypes.join(',')}
            multiple={allowMultiple}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        {/* Upload Queue */}
        {uploadFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Upload Queue ({uploadFiles.length})</h4>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || uploadFiles.every(f => f.status !== 'pending')}
                  size="sm"
                >
                  {isUploading ? 'Uploading...' : 'Upload All'}
                </Button>
                <Button
                  onClick={() => setUploadFiles([])}
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(uploadFile.status)}
                      <span className="font-medium text-sm truncate">
                        {uploadFile.file.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {formatBytes(uploadFile.file.size)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">
                        {getStatusText(uploadFile.status)}
                      </span>
                      {uploadFile.status === 'pending' && (
                        <Button
                          onClick={() => removeFile(uploadFile.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="h-1" />
                  )}
                  
                  {uploadFile.status === 'success' && uploadFile.savings && uploadFile.savings > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      ⚡ Saved {formatBytes(uploadFile.savings)} ({Math.round((uploadFile.savings / uploadFile.file.size) * 100)}% compression)
                    </div>
                  )}
                  
                  {uploadFile.status === 'error' && uploadFile.error && (
                    <div className="text-xs text-red-600 mt-1">
                      {uploadFile.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Summary */}
            {(successfulUploads > 0 || totalSavings > 0) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Upload Summary</span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  {successfulUploads > 0 && <p>{successfulUploads} files uploaded successfully</p>}
                  {totalSavings > 0 && (
                    <p>Total storage saved: {formatBytes(totalSavings)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Storage Optimization Info */}
        <Alert>
          <HardDrive className="h-4 w-4" />
          <AlertDescription>
            <strong>Storage Optimization Active:</strong> Files are automatically compressed when possible, 
            temporary files are cleaned up daily, and unused files are identified for removal.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SmartFileUpload;
