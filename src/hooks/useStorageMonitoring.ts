import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export interface StorageMetrics {
  // Current storage state
  currentUsage: number;
  maxStorage: number;
  usagePercentage: number;
  remainingStorage: number;
  
  // Bandwidth metrics
  dailyBandwidthUsed: number;
  dailyBandwidthLimit: number;
  bandwidthPercentage: number;
  
  // Status indicators
  storageStatus: 'good' | 'moderate' | 'warning' | 'critical';
  bandwidthStatus: 'good' | 'moderate' | 'warning' | 'critical';
  
  // Optimization metrics
  compressionSavings: number;
  totalFilesCompressed: number;
  averageCompressionRatio: number;
  
  // Cleanup metrics
  tempFilesCount: number;
  unusedFilesCount: number;
  potentialSavings: number;
  
  // Trends
  weeklyGrowth: number;
  monthlyGrowth: number;
  
  // Alert flags
  needsAttention: boolean;
  criticalIssues: string[];
  recommendations: string[];
}

export interface StorageAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  action?: string;
  timestamp: Date;
}

export const useStorageMonitoring = (organisationId?: string) => {
  const { profile } = useSupabaseAuth();
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [alerts, setAlerts] = useState<StorageAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentOrgId = organisationId || profile?.organisation_id;
  
  const fetchStorageMetrics = useCallback(async () => {
    if (!currentOrgId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get storage dashboard data
      const { data: dashboardData, error: dashboardError } = await supabase
        .from('storage_dashboard')
        .select('*')
        .eq('organisation_id', currentOrgId)
        .single();
      
      if (dashboardError && dashboardError.code !== 'PGRST116') {
        throw dashboardError;
      }
      
      // Get storage analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('storage_analytics')
        .select('*')
        .eq('organisation_id', currentOrgId);
      
      if (analyticsError) {
        throw analyticsError;
      }
      
      // Get optimization recommendations
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('storage_optimization_recommendations')
        .select('*')
        .eq('organisation_id', currentOrgId);
      
      if (recommendationsError) {
        throw recommendationsError;
      }
      
      // Calculate metrics
      const currentUsage = dashboardData?.current_usage_bytes || 0;
      const maxStorage = dashboardData?.max_storage_bytes || 1073741824; // 1GB default
      const usagePercentage = (currentUsage / maxStorage) * 100;
      
      const dailyBandwidthUsed = dashboardData?.bandwidth_used_today || 0;
      const dailyBandwidthLimit = dashboardData?.bandwidth_limit_daily || 10737418240; // 10GB default
      const bandwidthPercentage = (dailyBandwidthUsed / dailyBandwidthLimit) * 100;
      
      // Calculate compression savings
      const totalCompressed = analyticsData?.reduce((sum, bucket) => sum + (bucket.compressed_files || 0), 0) || 0;
      const avgCompressionRatio = analyticsData?.reduce((sum, bucket) => sum + (bucket.avg_compression_ratio || 1), 0) / (analyticsData?.length || 1) || 1;
      const compressionSavings = currentUsage * (1 - avgCompressionRatio);
      
      // Count optimization opportunities
      const tempFiles = recommendationsData?.filter(r => r.recommendation === 'temp_cleanup').length || 0;
      const unusedFiles = recommendationsData?.filter(r => r.recommendation === 'delete_candidate').length || 0;
      const potentialSavings = recommendationsData?.reduce((sum, r) => sum + (r.file_size || 0), 0) || 0;
      
      // Determine status
      const storageStatus = getStorageStatus(usagePercentage);
      const bandwidthStatus = getStorageStatus(bandwidthPercentage);
      
      // Generate alerts and recommendations
      const { generatedAlerts, recommendations } = generateAlertsAndRecommendations({
        usagePercentage,
        bandwidthPercentage,
        tempFiles,
        unusedFiles,
        potentialSavings
      });
      
      const newMetrics: StorageMetrics = {
        currentUsage,
        maxStorage,
        usagePercentage,
        remainingStorage: maxStorage - currentUsage,
        dailyBandwidthUsed,
        dailyBandwidthLimit,
        bandwidthPercentage,
        storageStatus,
        bandwidthStatus,
        compressionSavings,
        totalFilesCompressed: totalCompressed,
        averageCompressionRatio: avgCompressionRatio,
        tempFilesCount: tempFiles,
        unusedFilesCount: unusedFiles,
        potentialSavings,
        weeklyGrowth: 0, // Would need historical data
        monthlyGrowth: 0, // Would need historical data
        needsAttention: storageStatus === 'warning' || storageStatus === 'critical' || bandwidthStatus === 'warning' || bandwidthStatus === 'critical',
        criticalIssues: generatedAlerts.filter(a => a.type === 'critical').map(a => a.title),
        recommendations
      };
      
      setMetrics(newMetrics);
      setAlerts(generatedAlerts);
      
    } catch (err) {
      console.error('Error fetching storage metrics:', err);
      setError('Failed to load storage metrics');
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchStorageMetrics();
    
    const interval = setInterval(fetchStorageMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchStorageMetrics]);
  
  const runCleanup = async (jobName?: string) => {
    try {
      const { data, error } = await supabase.rpc('run_storage_cleanup', {
        p_job_name: jobName || null
      });
      
      if (error) throw error;
      
      // Refresh metrics after cleanup
      setTimeout(fetchStorageMetrics, 1000);
      
      return data;
    } catch (error) {
      console.error('Error running cleanup:', error);
      throw error;
    }
  };
  
  const optimizeQuotas = async () => {
    try {
      const { data, error } = await supabase.rpc('optimize_storage_quotas');
      
      if (error) throw error;
      
      // Refresh metrics after optimization
      setTimeout(fetchStorageMetrics, 1000);
      
      return data;
    } catch (error) {
      console.error('Error optimizing quotas:', error);
      throw error;
    }
  };
  
  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };
  
  return {
    metrics,
    alerts,
    loading,
    error,
    refresh: fetchStorageMetrics,
    runCleanup,
    optimizeQuotas,
    dismissAlert
  };
};

// Helper functions
function getStorageStatus(percentage: number): 'good' | 'moderate' | 'warning' | 'critical' {
  if (percentage >= 95) return 'critical';
  if (percentage >= 85) return 'warning';
  if (percentage >= 70) return 'moderate';
  return 'good';
}

function generateAlertsAndRecommendations(data: {
  usagePercentage: number;
  bandwidthPercentage: number;
  tempFiles: number;
  unusedFiles: number;
  potentialSavings: number;
}): { generatedAlerts: StorageAlert[]; recommendations: string[] } {
  const alerts: StorageAlert[] = [];
  const recommendations: string[] = [];
  
  // Storage alerts
  if (data.usagePercentage >= 95) {
    alerts.push({
      id: 'storage-critical',
      type: 'critical',
      title: 'Storage Critical',
      message: 'Storage usage is above 95%. Immediate action required.',
      action: 'Run cleanup now',
      timestamp: new Date()
    });
    recommendations.push('Delete unused files immediately');
    recommendations.push('Run automated cleanup');
  } else if (data.usagePercentage >= 85) {
    alerts.push({
      id: 'storage-warning',
      type: 'warning',
      title: 'Storage Warning',
      message: 'Storage usage is above 85%. Consider cleanup.',
      action: 'Review files',
      timestamp: new Date()
    });
    recommendations.push('Review and remove unnecessary files');
  }
  
  // Bandwidth alerts
  if (data.bandwidthPercentage >= 90) {
    alerts.push({
      id: 'bandwidth-warning',
      type: 'warning',
      title: 'Bandwidth Limit Approaching',
      message: 'Daily bandwidth usage is above 90%.',
      timestamp: new Date()
    });
    recommendations.push('Reduce file transfers today');
  }
  
  // Cleanup opportunities
  if (data.tempFiles > 10) {
    alerts.push({
      id: 'temp-files',
      type: 'info',
      title: 'Temporary Files Found',
      message: `${data.tempFiles} temporary files can be cleaned up.`,
      action: 'Clean now',
      timestamp: new Date()
    });
    recommendations.push('Clean up temporary files');
  }
  
  if (data.unusedFiles > 5) {
    alerts.push({
      id: 'unused-files',
      type: 'info',
      title: 'Unused Files Detected',
      message: `${data.unusedFiles} files haven't been accessed recently.`,
      action: 'Review files',
      timestamp: new Date()
    });
    recommendations.push('Review and archive unused files');
  }
  
  // Optimization recommendations
  if (data.potentialSavings > 50 * 1024 * 1024) { // 50MB
    recommendations.push('Compress large images for additional savings');
  }
  
  recommendations.push('Enable automated cleanup jobs');
  recommendations.push('Set up storage usage alerts');
  
  return { generatedAlerts: alerts, recommendations };
}

// Hook for storage cleanup statistics
export const useStorageCleanupStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_storage_cleanup_stats');
      
      if (error) throw error;
      
      setStats(data);
    } catch (error) {
      console.error('Error fetching cleanup stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  return { stats, loading, refresh: fetchStats };
};
