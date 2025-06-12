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

const StorageDashboard: React.FC<StorageDashboardProps> = ({ organisationId }) => {
  const { profile } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [recommendations, setRecommendations] = useState<StorageRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentOrgId = organisationId || profile?.organisation_id;
  
  const loadStorageData = useCallback(async () => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const [quotaData, recommendationsData] = await Promise.all([
        StorageAnalytics.getStorageDashboard(currentOrgId),
        StorageAnalytics.getOptimizationRecommendations(currentOrgId)
      ]);
      
      setQuota(quotaData);
      setRecommendations(recommendationsData || []);
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
      
      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
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
                    <ArrowDownToLine className="w-4 h-4 text-blue-500" />
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
    </div>
  );
};

export default StorageDashboard;