import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HardDrive, 
  TrendingUp, 
  Zap, 
  Archive, 
  AlertTriangle, 
  CheckCircle,
  Trash2,
  ArrowDownToLine,
  Download,
  Upload,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import {
  StorageAnalytics,
  StorageCleanup,
  formatBytes,
  getStorageStatusColor,
  type StorageQuota,
  type StorageRecommendation
} from '@/lib/storageOptimizationMock';

interface StorageDashboardProps {
  organisationId?: string;
}

interface BucketData {
  bucket_name: string;
  file_count: number;
  total_size_human: string;
  total_accesses?: number;
  compressed_files?: number;
}

interface TrendData {
  date: string;
  bucket_name: string;
  operation_type: string;
  total_size_human: string;
  operation_count: number;
}

const StorageDashboard: React.FC<StorageDashboardProps> = ({ organisationId }) => {
  const { profile } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [recommendations, setRecommendations] = useState<StorageRecommendation[]>([]);
  const [bandwidthTrends, setBandwidthTrends] = useState<TrendData[]>([]);
  const [storageByBucket, setStorageByBucket] = useState<BucketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  
  const currentOrgId = organisationId || profile?.organisation_id;
  
  const loadStorageData = useCallback(async () => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const [quotaData, recommendationsData, trendsData, bucketsData] = await Promise.all([
        StorageAnalytics.getStorageDashboard(currentOrgId),
        StorageAnalytics.getOptimizationRecommendations(currentOrgId),
        StorageAnalytics.getBandwidthTrends(currentOrgId, 7),
        StorageAnalytics.getStorageByBucket(currentOrgId)
      ]);
      
      setQuota(quotaData);
      setRecommendations(recommendationsData || []);
      setBandwidthTrends((trendsData || []) as TrendData[]);
      setStorageByBucket((bucketsData || []) as BucketData[]);
    } catch (error) {
      console.error('Error loading storage data:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load storage data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, toast]);
  
  useEffect(() => {
    if (currentOrgId) {
      loadStorageData();
    }
  }, [currentOrgId, loadStorageData]);
  
  const handleCleanupTempFiles = async () => {
    try {
      await StorageCleanup.cleanupTempFiles();
      toast({
        title: "✅ Success",
        description: "Temporary files cleaned up successfully"
      });
      loadStorageData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to cleanup temporary files",
        variant: "destructive"
      });
    }
  };
  
  const handleImplementRecommendations = async () => {
    if (selectedRecommendations.length === 0) {
      toast({
        title: "⚠️ Warning",
        description: "Please select files to optimize",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await StorageCleanup.implementRecommendations(selectedRecommendations);
      toast({
        title: "✅ Success",
        description: `${selectedRecommendations.length} files optimized successfully`
      });
      setSelectedRecommendations([]);
      loadStorageData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to implement optimizations",
        variant: "destructive"
      });
    }
  };
  
  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'delete_candidate': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'archive_candidate': return <Archive className="w-4 h-4 text-yellow-500" />;
      case 'compression_candidate': return <ArrowDownToLine className="w-4 h-4 text-blue-500" />;
      case 'temp_cleanup': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading storage analytics...</p>
        </div>
      </div>
    );
  }
  
  if (!quota) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No storage data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{quota.current_usage_human}</span>
                <span className={getStorageStatusColor(quota.storage_status)}>
                  {quota.usage_percentage}%
                </span>
              </div>
              <Progress value={quota.usage_percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {quota.remaining_human} remaining of {quota.max_storage_human}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Bandwidth</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{quota.bandwidth_used_human}</span>
                <span className={getStorageStatusColor(quota.bandwidth_status)}>
                  {quota.bandwidth_usage_percentage}%
                </span>
              </div>
              <Progress value={quota.bandwidth_usage_percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                of daily limit
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={recommendations.length > 0 ? "destructive" : "secondary"}>
                {recommendations.length} recommendations
              </Badge>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCleanupTempFiles}
                className="w-full"
              >
                Quick Cleanup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Optimization Recommendations</CardTitle>
                <Button 
                  onClick={handleImplementRecommendations}
                  disabled={selectedRecommendations.length === 0}
                  size="sm"
                >
                  Apply Selected ({selectedRecommendations.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium">Storage Optimized!</h3>
                  <p className="text-gray-600">No optimization recommendations at this time.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recommendations.map((rec: StorageRecommendation) => (
                    <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedRecommendations.includes(rec.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecommendations([...selectedRecommendations, rec.id]);
                            } else {
                              setSelectedRecommendations(selectedRecommendations.filter(id => id !== rec.id));
                            }
                          }}
                        />
                        {getRecommendationIcon(rec.recommendation)}
                        <div>
                          <p className="font-medium text-sm">{rec.file_path}</p>
                          <p className="text-xs text-gray-600">
                            {formatBytes(rec.file_size)} • {rec.recommendation.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {formatBytes(rec.potential_savings)} savings
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage by Bucket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {storageByBucket.map((bucket: BucketData) => (
                  <div key={bucket.bucket_name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{bucket.bucket_name}</p>
                      <p className="text-sm text-gray-600">
                        {bucket.file_count} files • {bucket.total_accesses || 0} accesses
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{bucket.total_size_human}</p>
                      <p className="text-sm text-gray-600">
                        {bucket.compressed_files || 0} compressed
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bandwidth Trends (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bandwidthTrends.map((trend: TrendData, index) => (
                  <div key={`${trend.date}-${trend.bucket_name}-${trend.operation_type}-${index}`} 
                       className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {trend.operation_type === 'upload' && <Upload className="w-4 h-4 text-blue-500" />}
                      {trend.operation_type === 'download' && <Download className="w-4 h-4 text-green-500" />}
                      {trend.operation_type === 'view' && <Eye className="w-4 h-4 text-gray-500" />}
                      <div>
                        <p className="font-medium text-sm">
                          {trend.bucket_name} • {trend.operation_type}
                        </p>
                        <p className="text-xs text-gray-600">{trend.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{trend.total_size_human}</p>
                      <p className="text-sm text-gray-600">{trend.operation_count} ops</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StorageDashboard;
