/**
 * Mock Storage Optimization System
 * Provides functional UI components while database migrations are pending
 */

import React from 'react';

// Mock types
export interface StorageQuota {
  organisation_id: string;
  max_storage_bytes: number;
  current_usage_bytes: number;
  usage_percentage: number;
  remaining_bytes: number;
  max_storage_human: string;
  current_usage_human: string;
  remaining_human: string;
  storage_status: 'optimal' | 'warning' | 'critical';
  bandwidth_used_bytes: number;
  bandwidth_used_human: string;
  bandwidth_usage_percentage: number;
  bandwidth_status: 'optimal' | 'warning' | 'critical';
  last_updated: string;
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  quality: number;
}

export interface StorageRecommendation {
  id: string;
  file_path: string;
  file_size: number;
  recommendation: 'delete_candidate' | 'archive_candidate' | 'compression_candidate' | 'temp_cleanup';
  potential_savings: number;
  last_accessed: string;
  reason: string;
}

// Mock bucket configurations
export const BUCKET_CONFIGS = {
  avatars: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    autoCompress: true
  },
  documents: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'text/plain'],
    autoCompress: false
  },
  schedules: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/json', 'text/csv'],
    autoCompress: false
  },
  reports: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/vnd.ms-excel'],
    autoCompress: false
  },
  'temp-uploads': {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/*', 'application/*', 'text/*'],
    autoCompress: true
  }
};

// Utility functions
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStorageStatusColor = (status: string): string => {
  switch (status) {
    case 'optimal': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'critical': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

// Mock Smart File Compressor
export class SmartFileCompressor {
  async compressImage(
    file: File, 
    options: { quality?: number; maxWidth?: number; format?: string } = {}
  ): Promise<{ data: Blob; error: null; compressionResult: CompressionResult }> {
    // Simulate compression
    const originalSize = file.size;
    const compressionRatio = 0.3; // 70% reduction
    const compressedSize = Math.floor(originalSize * compressionRatio);
    
    return {
      data: new Blob([file], { type: options.format || 'image/webp' }),
      error: null,
      compressionResult: {
        originalSize,
        compressedSize,
        compressionRatio: 1 - compressionRatio,
        format: options.format || 'webp',
        quality: options.quality || 80
      }
    };
  }

  getOptimalDimensions(fileSize: number): { width: number; height: number } {
    if (fileSize > 5 * 1024 * 1024) return { width: 1200, height: 1200 };
    if (fileSize > 2 * 1024 * 1024) return { width: 1600, height: 1600 };
    return { width: 1920, height: 1920 };
  }
}

// Mock Smart Upload Manager
export class SmartUploadManager {
  static async checkQuota(organisationId: string, fileSize: number): Promise<{
    allowed: boolean;
    quota: StorageQuota;
    reason?: string;
  }> {
    // Mock quota check
    const mockQuota: StorageQuota = {
      organisation_id: organisationId,
      max_storage_bytes: 5 * 1024 * 1024 * 1024, // 5GB
      current_usage_bytes: 1.5 * 1024 * 1024 * 1024, // 1.5GB used
      usage_percentage: 30,
      remaining_bytes: 3.5 * 1024 * 1024 * 1024,
      max_storage_human: '5.00 GB',
      current_usage_human: '1.50 GB',
      remaining_human: '3.50 GB',
      storage_status: 'optimal',
      bandwidth_used_bytes: 100 * 1024 * 1024, // 100MB
      bandwidth_used_human: '100 MB',
      bandwidth_usage_percentage: 10,
      bandwidth_status: 'optimal',
      last_updated: new Date().toISOString()
    };

    return {
      allowed: fileSize < mockQuota.remaining_bytes,
      quota: mockQuota,
      reason: fileSize >= mockQuota.remaining_bytes ? 'File size exceeds remaining quota' : undefined
    };
  }

  static async uploadWithOptimization(
    file: File,
    bucket: string,
    path: string,
    organisationId?: string
  ): Promise<{ data: { path: string; url?: string }; error: null; savings?: number }> {
    // Simulate upload with compression
    const compressor = new SmartFileCompressor();
    
    let savings = 0;
    if (file.type.startsWith('image/')) {
      const compressed = await compressor.compressImage(file);
      savings = compressed.compressionResult.originalSize - compressed.compressionResult.compressedSize;
    }

    // Simulate successful upload
    return {
      data: {
        path,
        url: `https://mock-storage.supabase.co/storage/v1/object/public/${bucket}/${path}`
      },
      error: null,
      savings
    };
  }
}

// Mock Storage Analytics
export class StorageAnalytics {
  static async getStorageDashboard(organisationId: string): Promise<StorageQuota> {
    // Return mock dashboard data
    return {
      organisation_id: organisationId,
      max_storage_bytes: 5 * 1024 * 1024 * 1024, // 5GB
      current_usage_bytes: 1.5 * 1024 * 1024 * 1024, // 1.5GB used
      usage_percentage: 30,
      remaining_bytes: 3.5 * 1024 * 1024 * 1024,
      max_storage_human: '5.00 GB',
      current_usage_human: '1.50 GB',
      remaining_human: '3.50 GB',
      storage_status: 'optimal',
      bandwidth_used_bytes: 100 * 1024 * 1024, // 100MB
      bandwidth_used_human: '100 MB',
      bandwidth_usage_percentage: 10,
      bandwidth_status: 'optimal',
      last_updated: new Date().toISOString()
    };
  }

  static async getOptimizationRecommendations(organisationId: string): Promise<StorageRecommendation[]> {
    // Return mock recommendations
    return [
      {
        id: 'rec1',
        file_path: 'temp-uploads/old-image.jpg',
        file_size: 2.5 * 1024 * 1024,
        recommendation: 'compression_candidate',
        potential_savings: 1.75 * 1024 * 1024,
        last_accessed: '2025-06-01T10:00:00Z',
        reason: 'Large uncompressed image'
      },
      {
        id: 'rec2',
        file_path: 'temp-uploads/temp-file.pdf',
        file_size: 5 * 1024 * 1024,
        recommendation: 'temp_cleanup',
        potential_savings: 5 * 1024 * 1024,
        last_accessed: '2025-05-15T15:30:00Z',
        reason: 'Temporary file older than 30 days'
      }
    ];
  }

  static async getBandwidthTrends(organisationId: string, days: number): Promise<any[]> {
    // Return mock bandwidth trends
    const trends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        bandwidth_used: Math.random() * 100 * 1024 * 1024, // Random 0-100MB
        requests: Math.floor(Math.random() * 1000)
      });
    }
    return trends.reverse();
  }

  static async getStorageByBucket(organisationId: string): Promise<any[]> {
    // Return mock storage by bucket
    return [
      { bucket_name: 'avatars', total_size: 50 * 1024 * 1024, file_count: 25 },
      { bucket_name: 'documents', total_size: 800 * 1024 * 1024, file_count: 150 },
      { bucket_name: 'schedules', total_size: 25 * 1024 * 1024, file_count: 500 },
      { bucket_name: 'reports', total_size: 600 * 1024 * 1024, file_count: 75 },
      { bucket_name: 'temp-uploads', total_size: 25 * 1024 * 1024, file_count: 10 }
    ];
  }
}

// Mock Storage Cleanup
export class StorageCleanup {
  static async cleanupTempFiles(): Promise<{ deleted: number; savedBytes: number }> {
    // Simulate cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      deleted: 5,
      savedBytes: 25 * 1024 * 1024 // 25MB saved
    };
  }

  static async implementRecommendations(recommendationIds: string[]): Promise<{ optimized: number; savedBytes: number }> {
    // Simulate implementing recommendations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      optimized: recommendationIds.length,
      savedBytes: recommendationIds.length * 2 * 1024 * 1024 // 2MB per recommendation
    };
  }
}

// Mock hook for storage monitoring
export const useStorageMonitoring = (organisationId?: string) => {
  const [quota, setQuota] = React.useState<StorageQuota | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (organisationId) {
      const loadData = async () => {
        setLoading(true);
        try {
          const quotaData = await StorageAnalytics.getStorageDashboard(organisationId);
          setQuota(quotaData);
        } catch (error) {
          console.error('Error loading storage data:', error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [organisationId]);

  return { quota, loading };
};
