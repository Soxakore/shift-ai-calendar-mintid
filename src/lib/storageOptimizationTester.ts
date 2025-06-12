import { supabase } from '@/integrations/supabase/client';

/**
 * Storage Optimization Test Suite
 * Tests all storage optimization components for proper functionality
 */

export class StorageOptimizationTester {
  private results: { test: string; status: 'pass' | 'fail' | 'warning'; message: string }[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Storage Optimization Test Suite...\n');

    await this.testDatabaseInfrastructure();
    await this.testStorageBuckets();
    await this.testStorageQuotas();
    await this.testCleanupFunctions();
    await this.testAnalyticsViews();
    await this.testStorageOptimizationClasses();

    this.printResults();
  }

  private async testDatabaseInfrastructure(): Promise<void> {
    console.log('📊 Testing Database Infrastructure...');

    // Test storage_usage_tracking table
    try {
      const { data, error } = await supabase
        .from('storage_usage_tracking')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      this.addResult('storage_usage_tracking table', 'pass', 'Table exists and accessible');
    } catch (error) {
      this.addResult('storage_usage_tracking table', 'fail', `Error: ${error.message}`);
    }

    // Test storage_quotas table
    try {
      const { data, error } = await supabase
        .from('storage_quotas')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      this.addResult('storage_quotas table', 'pass', 'Table exists and accessible');
    } catch (error) {
      this.addResult('storage_quotas table', 'fail', `Error: ${error.message}`);
    }

    // Test bandwidth_usage table
    try {
      const { data, error } = await supabase
        .from('bandwidth_usage')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      this.addResult('bandwidth_usage table', 'pass', 'Table exists and accessible');
    } catch (error) {
      this.addResult('bandwidth_usage table', 'fail', `Error: ${error.message}`);
    }

    // Test storage_cleanup_config table
    try {
      const { data, error } = await supabase
        .from('storage_cleanup_config')
        .select('*')
        .limit(5);
      
      if (error) throw error;
      this.addResult('storage_cleanup_config table', 'pass', `Found ${data?.length || 0} cleanup jobs configured`);
    } catch (error) {
      this.addResult('storage_cleanup_config table', 'fail', `Error: ${error.message}`);
    }
  }

  private async testStorageBuckets(): Promise<void> {
    console.log('🗂️ Testing Storage Buckets...');

    const expectedBuckets = ['avatars', 'documents', 'schedules', 'reports', 'temp-uploads'];

    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) throw error;

      const bucketNames = buckets.map(b => b.name);
      
      for (const expectedBucket of expectedBuckets) {
        if (bucketNames.includes(expectedBucket)) {
          this.addResult(`${expectedBucket} bucket`, 'pass', 'Bucket exists');
        } else {
          this.addResult(`${expectedBucket} bucket`, 'fail', 'Bucket missing');
        }
      }
    } catch (error) {
      this.addResult('Storage buckets', 'fail', `Error: ${error.message}`);
    }
  }

  private async testStorageQuotas(): Promise<void> {
    console.log('📈 Testing Storage Quotas...');

    try {
      // Get current user's organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organisation_id')
        .single();

      if (profileError) throw profileError;

      if (profile?.organisation_id) {
        // Check if quota exists for this organization
        const { data: quota, error: quotaError } = await supabase
          .from('storage_quotas')
          .select('*')
          .eq('organisation_id', profile.organisation_id)
          .single();

        if (quotaError && quotaError.code !== 'PGRST116') throw quotaError;

        if (quota) {
          this.addResult('Organization storage quota', 'pass', 
            `Quota exists: ${this.formatBytes(quota.current_usage_bytes)}/${this.formatBytes(quota.max_storage_bytes)}`);
        } else {
          this.addResult('Organization storage quota', 'warning', 'No quota found for organization');
        }
      } else {
        this.addResult('Organization storage quota', 'warning', 'No organization found for user');
      }
    } catch (error) {
      this.addResult('Storage quotas', 'fail', `Error: ${error.message}`);
    }
  }

  private async testCleanupFunctions(): Promise<void> {
    console.log('🧹 Testing Cleanup Functions...');

    try {
      // Test get_storage_cleanup_stats function
      const { data, error } = await supabase.rpc('get_storage_cleanup_stats');
      
      if (error) throw error;
      
      this.addResult('get_storage_cleanup_stats function', 'pass', 
        `Function works, found ${data?.overall?.total_jobs || 0} cleanup jobs`);
    } catch (error) {
      this.addResult('get_storage_cleanup_stats function', 'fail', `Error: ${error.message}`);
    }

    try {
      // Test optimize_storage_quotas function
      const { data, error } = await supabase.rpc('optimize_storage_quotas');
      
      if (error) throw error;
      
      this.addResult('optimize_storage_quotas function', 'pass', 
        `Function works, optimized ${data?.organizations_optimized || 0} organizations`);
    } catch (error) {
      this.addResult('optimize_storage_quotas function', 'fail', `Error: ${error.message}`);
    }
  }

  private async testAnalyticsViews(): Promise<void> {
    console.log('📊 Testing Analytics Views...');

    const views = [
      'storage_analytics',
      'daily_bandwidth_summary',
      'storage_dashboard',
      'storage_optimization_recommendations'
    ];

    for (const view of views) {
      try {
        const { data, error } = await supabase
          .from(view)
          .select('*')
          .limit(1);
        
        if (error) throw error;
        this.addResult(`${view} view`, 'pass', 'View accessible');
      } catch (error) {
        this.addResult(`${view} view`, 'fail', `Error: ${error.message}`);
      }
    }
  }

  private async testStorageOptimizationClasses(): Promise<void> {
    console.log('⚙️ Testing Storage Optimization Classes...');

    try {
      // Test if storageOptimization module can be imported
      const { SmartFileCompressor, SmartUploadManager, StorageAnalytics, StorageCleanup } = 
        await import('@/lib/storageOptimization');

      this.addResult('SmartFileCompressor class', 'pass', 'Class imported successfully');
      this.addResult('SmartUploadManager class', 'pass', 'Class imported successfully');
      this.addResult('StorageAnalytics class', 'pass', 'Class imported successfully');
      this.addResult('StorageCleanup class', 'pass', 'Class imported successfully');

      // Test creating instances
      try {
        const compressor = new SmartFileCompressor();
        const uploadManager = new SmartUploadManager();
        const analytics = new StorageAnalytics();
        const cleanup = new StorageCleanup();

        this.addResult('Storage optimization instances', 'pass', 'All classes instantiated successfully');
      } catch (error) {
        this.addResult('Storage optimization instances', 'fail', `Error creating instances: ${error.message}`);
      }

    } catch (error) {
      this.addResult('Storage optimization classes', 'fail', `Error importing classes: ${error.message}`);
    }
  }

  private addResult(test: string, status: 'pass' | 'fail' | 'warning', message: string): void {
    this.results.push({ test, status, message });
  }

  private printResults(): void {
    console.log('\n📋 Storage Optimization Test Results:');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;

    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`${icon} ${result.test}: ${result.message}`);
    });

    console.log('\n📊 Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`📈 Success Rate: ${Math.round((passed / this.results.length) * 100)}%`);

    if (failed === 0) {
      console.log('\n🎉 All critical tests passed! Storage optimization system is ready.');
    } else {
      console.log('\n🚨 Some tests failed. Please check the migration status and configuration.');
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export test runner function
export const runStorageOptimizationTests = async (): Promise<void> => {
  const tester = new StorageOptimizationTester();
  await tester.runAllTests();
};

// Test file upload compression
export const testFileCompression = async (file: File): Promise<void> => {
  console.log('🗜️ Testing File Compression...');
  
  try {
    const { SmartFileCompressor } = await import('@/lib/storageOptimization');
    const compressor = new SmartFileCompressor();
    
    console.log(`Original file: ${file.name} (${file.size} bytes)`);
    
    const compressedFile = await compressor.compressFile(file);
    const compressionRatio = compressedFile.size / file.size;
    const savings = ((1 - compressionRatio) * 100).toFixed(1);
    
    console.log(`Compressed file: ${compressedFile.name} (${compressedFile.size} bytes)`);
    console.log(`Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
    console.log(`Space saved: ${savings}%`);
    
    if (compressionRatio < 0.8) {
      console.log('✅ Good compression achieved!');
    } else {
      console.log('⚠️ Low compression ratio - file may already be optimized');
    }
    
  } catch (error) {
    console.error('❌ Compression test failed:', error);
  }
};

// Test storage quota monitoring
export const testStorageMonitoring = async (): Promise<void> => {
  console.log('📊 Testing Storage Monitoring...');
  
  try {
    const { StorageAnalytics } = await import('@/lib/storageOptimization');
    const analytics = new StorageAnalytics();
    
    const usage = await analytics.getStorageUsage();
    console.log('Current storage usage:', usage);
    
    const recommendations = await analytics.getOptimizationRecommendations();
    console.log('Optimization recommendations:', recommendations);
    
  } catch (error) {
    console.error('❌ Storage monitoring test failed:', error);
  }
};

// Export for use in console or development testing
if (typeof window !== 'undefined') {
  (window as any).testStorageOptimization = runStorageOptimizationTests;
  (window as any).testFileCompression = testFileCompression;
  (window as any).testStorageMonitoring = testStorageMonitoring;
}
