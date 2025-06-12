// ⚡ Lightning Bolt Smart Strategic Storage Optimization
// Comprehensive storage optimization for 5GB Supabase free plan

import React from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StorageQuota {
  organisation_id: string;
  max_storage_bytes: number;
  current_usage_bytes: number;
  usage_percentage: number;
  remaining_bytes: number;
  bandwidth_limit_daily: number;
  bandwidth_used_today: number;
  bandwidth_usage_percentage: number;
  storage_status: 'good' | 'moderate' | 'warning' | 'critical';
  bandwidth_status: 'good' | 'moderate' | 'warning' | 'critical';
  is_suspended: boolean;
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressedBlob: Blob;
  savings: number;
}

export interface OptimizationStats {
  totalFiles: number;
  totalSize: number;
  compressedFiles: number;
  totalSavings: number;
  averageCompressionRatio: number;
}

// 🔥 SMART FILE COMPRESSION
export class SmartFileCompressor {
  // Compress images with dynamic quality based on file size
  static async compressImage(file: File, targetQuality: number = 0.8): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Smart dimension calculation
        let { width, height } = img;
        const maxDimension = this.getMaxDimension(file.size);
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Apply compression
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob) {
              const compressionRatio = compressedBlob.size / file.size;
              const savings = file.size - compressedBlob.size;
              
              resolve({
                originalSize: file.size,
                compressedSize: compressedBlob.size,
                compressionRatio,
                compressedBlob,
                savings
              });
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/webp', // WebP for better compression
          targetQuality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  private static getMaxDimension(fileSize: number): number {
    // Dynamic max dimension based on file size
    if (fileSize > 5 * 1024 * 1024) return 1200; // Large files
    if (fileSize > 2 * 1024 * 1024) return 1600; // Medium files
    return 1920; // Small files can keep higher resolution
  }
  
  // Compress PDF by removing metadata and optimizing
  static async compressPDF(file: File): Promise<File> {
    // Note: This is a placeholder - real PDF compression would require a library like PDF-lib
    // For now, we'll just return the original file
    console.log('PDF compression not implemented yet');
    return file;
  }
}

// 🎯 SMART UPLOAD MANAGER
export class SmartUploadManager {
  static async uploadWithOptimization(
    file: File,
    bucket: string,
    path: string,
    organisationId?: string
  ): Promise<{ data: any; error: any; savings?: number }> {
    try {
      // Check quota before upload
      if (organisationId) {
        const quotaCheck = await this.checkStorageQuota(organisationId, file.size);
        if (!quotaCheck.allowed) {
          return {
            data: null,
            error: { message: 'Storage quota exceeded. Please upgrade or free up space.' }
          };
        }
      }
      
      let uploadFile = file;
      let savings = 0;
      
      // Smart compression based on file type and size
      if (this.shouldCompress(file)) {
        try {
          const compressionResult = await SmartFileCompressor.compressImage(file);
          
          // Only use compressed version if it's significantly smaller
          if (compressionResult.savings > file.size * 0.1) {
            uploadFile = new File([compressionResult.compressedBlob], file.name, {
              type: 'image/webp'
            });
            savings = compressionResult.savings;
          }
        } catch (compressionError) {
          console.warn('Compression failed, using original file:', compressionError);
        }
      }
      
      // Upload with metadata
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, uploadFile, {
          metadata: {
            uploader: (await supabase.auth.getUser()).data.user?.id,
            organisation_id: organisationId,
            original_size: file.size.toString(),
            compressed_size: uploadFile.size.toString(),
            compression_ratio: uploadFile.size / file.size,
            is_compressed: uploadFile !== file ? 'true' : 'false'
          }
        });
      
      // Log bandwidth usage
      if (!error && organisationId) {
        await this.logBandwidthUsage('upload', uploadFile.size, bucket, organisationId);
      }
      
      return { data, error, savings };
      
    } catch (err) {
      return { data: null, error: err };
    }
  }
  
  private static shouldCompress(file: File): boolean {
    const imageTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff'];
    return imageTypes.includes(file.type) && file.size > 100 * 1024; // Compress images > 100KB
  }
  
  private static async checkStorageQuota(organisationId: string, fileSize: number) {
    const { data, error } = await supabase.rpc('update_storage_quota', {
      p_organisation_id: organisationId,
      p_file_size: fileSize
    });
    
    if (error) {
      console.error('Error checking storage quota:', error);
      return { allowed: true }; // Allow upload if check fails
    }
    
    return data;
  }
  
  private static async logBandwidthUsage(
    operation: string,
    fileSize: number,
    bucket: string,
    organisationId: string
  ) {
    try {
      await supabase.rpc('log_bandwidth_usage', {
        p_bucket_name: bucket,
        p_operation_type: operation,
        p_file_size: fileSize,
        p_organisation_id: organisationId,
        p_user_id: (await supabase.auth.getUser()).data.user?.id
      });
    } catch (error) {
      console.warn('Failed to log bandwidth usage:', error);
    }
  }
}

// 📊 STORAGE ANALYTICS
export class StorageAnalytics {
  static async getStorageDashboard(organisationId?: string): Promise<StorageQuota | null> {
    let query = supabase
      .from('storage_dashboard')
      .select('*');
    
    if (organisationId) {
      query = query.eq('organisation_id', organisationId);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      console.error('Error fetching storage dashboard:', error);
      return null;
    }
    
    return data;
  }
  
  static async getOptimizationRecommendations(organisationId: string) {
    const { data, error } = await supabase
      .from('storage_optimization_recommendations')
      .select('*')
      .eq('organisation_id', organisationId)
      .neq('recommendation', 'keep')
      .order('file_size', { ascending: false });
    
    if (error) {
      console.error('Error fetching optimization recommendations:', error);
      return [];
    }
    
    return data;
  }
  
  static async getBandwidthTrends(organisationId: string, days: number = 7) {
    const { data, error } = await supabase
      .from('daily_bandwidth_summary')
      .select('*')
      .eq('organisation_id', organisationId)
      .gte('date_bucket', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date_bucket', { ascending: false });
    
    if (error) {
      console.error('Error fetching bandwidth trends:', error);
      return [];
    }
    
    return data;
  }
  
  static async getStorageByBucket(organisationId: string) {
    const { data, error } = await supabase
      .from('storage_analytics')
      .select('*')
      .eq('organisation_id', organisationId)
      .order('total_size_bytes', { ascending: false });
    
    if (error) {
      console.error('Error fetching storage by bucket:', error);
      return [];
    }
    
    return data;
  }
}

// 🧹 AUTOMATED CLEANUP
export class StorageCleanup {
  // Clean up temporary files
  static async cleanupTempFiles(): Promise<void> {
    try {
      await supabase.rpc('cleanup_temp_files');
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
  
  // Delete specific files based on recommendations
  static async implementRecommendations(fileIds: string[]): Promise<void> {
    try {
      // Get file details first
      const { data: files } = await supabase
        .from('storage_usage_tracking')
        .select('bucket_name, file_path')
        .in('id', fileIds);
      
      if (files) {
        for (const file of files) {
          await supabase.storage
            .from(file.bucket_name)
            .remove([file.file_path]);
        }
      }
      
      // Update tracking table
      await supabase
        .from('storage_usage_tracking')
        .delete()
        .in('id', fileIds);
        
    } catch (error) {
      console.error('Error implementing recommendations:', error);
    }
  }
  
  // Archive old files to cheaper storage (placeholder for future implementation)
  static async archiveOldFiles(organisationId: string, daysOld: number = 90): Promise<void> {
    console.log(`Archiving files older than ${daysOld} days for org ${organisationId}`);
    // TODO: Implement archival to external storage service
  }
}

// 🎯 BUCKET CONFIGURATIONS
export const BUCKET_CONFIGS = {
  avatars: {
    name: 'avatars',
    public: true,
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    autoCompress: true,
    retentionDays: null // Keep forever
  },
  documents: {
    name: 'documents',
    public: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    autoCompress: false,
    retentionDays: 365 // Keep for 1 year
  },
  schedules: {
    name: 'schedules',
    public: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    autoCompress: true,
    retentionDays: 180 // Keep for 6 months
  },
  reports: {
    name: 'reports',
    public: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'text/csv', 'application/json'],
    autoCompress: false,
    retentionDays: 365 // Keep for 1 year
  },
  'temp-uploads': {
    name: 'temp-uploads',
    public: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    autoCompress: true,
    retentionDays: 1 // Delete after 1 day
  }
};

// 🎯 USAGE MONITORING HOOKS
export const useStorageMonitoring = (organisationId?: string) => {
  const [quota, setQuota] = React.useState<StorageQuota | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (organisationId) {
      StorageAnalytics.getStorageDashboard(organisationId)
        .then(setQuota)
        .finally(() => setLoading(false));
    }
  }, [organisationId]);
  
  return { quota, loading, refetch: () => {
    if (organisationId) {
      StorageAnalytics.getStorageDashboard(organisationId).then(setQuota);
    }
  }};
};

// Helper function to format bytes
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Helper function to get storage status color
export const getStorageStatusColor = (status: string): string => {
  switch (status) {
    case 'good': return 'text-green-600';
    case 'moderate': return 'text-yellow-600';
    case 'warning': return 'text-orange-600';
    case 'critical': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export default {
  SmartFileCompressor,
  SmartUploadManager,
  StorageAnalytics,
  StorageCleanup,
  BUCKET_CONFIGS,
  formatBytes,
  getStorageStatusColor
};
