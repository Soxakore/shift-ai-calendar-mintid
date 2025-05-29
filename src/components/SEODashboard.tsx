/**
 * Advanced SEO Analytics Dashboard Component
 * Provides comprehensive SEO monitoring, performance tracking, and optimization insights
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  TrendingUp, 
  Eye, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  RefreshCw,
  Monitor,
  Globe,
  Image as ImageIcon,
  Link,
  FileText,
  Zap
} from 'lucide-react';

// Import our SEO and performance utilities
import { 
  validatePageSEO, 
  extractPageMetrics, 
  globalSEOMonitor, 
  seoUtils,
  type SEOValidationResult,
  type PageSEOMetrics 
} from '@/lib/seoValidator';
import { usePerformanceMetrics, usePerformanceAlerts } from '@/hooks/usePerformanceMetrics';

interface SEODashboardProps {
  className?: string;
}

export const SEODashboard: React.FC<SEODashboardProps> = ({ className }) => {
  // State
  const [seoResults, setSeoResults] = useState<SEOValidationResult | null>(null);
  const [pageMetrics, setPageMetrics] = useState<PageSEOMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Performance monitoring
  const {
    webVitals,
    performanceMetrics,
    bundleMetrics,
    performanceScore,
    isLoading: perfLoading,
    refreshMetrics,
    exportMetrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  } = usePerformanceMetrics({
    autoStart: true,
    updateInterval: 30000,
    enableRealTimeMonitoring: true
  });

  // Performance alerts
  const performanceAlerts = usePerformanceAlerts(webVitals);

  /**
   * Refresh SEO validation
   */
  const refreshSEO = async () => {
    setIsRefreshing(true);
    try {
      const results = validatePageSEO();
      const metrics = extractPageMetrics();
      setSeoResults(results);
      setPageMetrics(metrics);
    } catch (error) {
      console.error('Error refreshing SEO:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Export comprehensive report
   */
  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      seo: {
        validation: seoResults,
        metrics: pageMetrics,
        report: seoUtils.generateSEOReport()
      },
      performance: {
        webVitals,
        metrics: performanceMetrics,
        bundle: bundleMetrics,
        score: performanceScore,
        alerts: performanceAlerts
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-performance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-refresh SEO data
  useEffect(() => {
    refreshSEO();
    
    if (autoRefresh) {
      const interval = setInterval(refreshSEO, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Monitor SEO changes
  useEffect(() => {
    if (autoRefresh) {
      globalSEOMonitor.start();
      return () => globalSEOMonitor.stop();
    }
  }, [autoRefresh]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SEO Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time SEO monitoring and performance analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Monitor className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Stop' : 'Start'} Auto-refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSEO}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seoResults?.score || 0}/100
            </div>
            <Progress 
              value={seoResults?.score || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceScore}/100
            </div>
            <Progress 
              value={performanceScore} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core Web Vitals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webVitals ? 
                `${webVitals.lcp !== null ? Math.round(webVitals.lcp) : 'N/A'}ms` : 
                'Loading...'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              LCP (Largest Contentful Paint)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {seoResults?.failed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {seoResults?.warnings || 0} warnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      {performanceAlerts.length > 0 && (
        <div className="space-y-2">
          {performanceAlerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="seo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="technical">Technical SEO</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
        </TabsList>

        {/* SEO Analysis Tab */}
        <TabsContent value="seo" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* SEO Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  SEO Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {seoResults?.issues.length ? (
                  seoResults.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded">
                      <Badge 
                        variant={issue.type === 'error' ? 'destructive' : 'secondary'}
                        className="mt-0.5"
                      >
                        {issue.type}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium">{issue.message}</p>
                        {issue.recommendation && (
                          <p className="text-sm text-muted-foreground mt-1">
                            💡 {issue.recommendation}
                          </p>
                        )}
                        <Badge variant="outline" className="mt-2">
                          {issue.category}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    No SEO issues found!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {seoResults?.recommendations.length ? (
                  seoResults.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          rec.priority === 'high' ? 'destructive' : 
                          rec.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {rec.priority} priority
                        </Badge>
                        <span className="font-medium">{rec.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      <p className="text-xs text-green-600">
                        Impact: {rec.impact}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    All optimizations implemented!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {webVitals ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">LCP</span>
                        <span className="text-sm font-mono">
                          {webVitals.lcp ? `${Math.round(webVitals.lcp)}ms` : 'N/A'}
                        </span>
                      </div>
                      <Progress value={webVitals.lcp ? Math.min((2500 / webVitals.lcp) * 100, 100) : 0} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">FID</span>
                        <span className="text-sm font-mono">
                          {webVitals.fid ? `${Math.round(webVitals.fid)}ms` : 'N/A'}
                        </span>
                      </div>
                      <Progress value={webVitals.fid ? Math.min((100 / webVitals.fid) * 100, 100) : 0} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">CLS</span>
                        <span className="text-sm font-mono">
                          {webVitals.cls ? webVitals.cls.toFixed(3) : 'N/A'}
                        </span>
                      </div>
                      <Progress value={webVitals.cls ? Math.min((0.1 / webVitals.cls) * 100, 100) : 0} />
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    {perfLoading ? 'Loading metrics...' : 'No data available'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bundle Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Bundle Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {bundleMetrics ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Resources</p>
                      <p className="text-lg font-mono">{bundleMetrics.totalResources}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Size</p>
                      <p className="text-lg font-mono">
                        {bundleMetrics.totalSize ? `${(bundleMetrics.totalSize / 1024).toFixed(1)}KB` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Largest Resource</p>
                      <p className="text-sm font-mono">
                        {bundleMetrics.largestResource?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Analyzing bundle...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Page Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceMetrics ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">DOM Ready</p>
                      <p className="text-lg font-mono">
                        {performanceMetrics.domContentLoaded}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Page Load</p>
                      <p className="text-lg font-mono">
                        {performanceMetrics.loadComplete}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Memory Usage</p>
                      <p className="text-lg font-mono">
                        {performanceMetrics.memoryUsage ? 
                          `${(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB` : 
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Loading metrics...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical SEO Tab */}
        <TabsContent value="technical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Meta Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pageMetrics && (
                  <>
                    <div className="flex justify-between">
                      <span>Title Length</span>
                      <Badge variant={
                        pageMetrics.titleLength >= 30 && pageMetrics.titleLength <= 60 ? 'default' : 'secondary'
                      }>
                        {pageMetrics.titleLength} chars
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Description Length</span>
                      <Badge variant={
                        pageMetrics.descriptionLength >= 120 && pageMetrics.descriptionLength <= 160 ? 'default' : 'secondary'
                      }>
                        {pageMetrics.descriptionLength} chars
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Graph Tags</span>
                      <Badge>{Object.keys(pageMetrics.openGraphTags).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Canonical URL</span>
                      <Badge variant={pageMetrics.canonicalUrl ? 'default' : 'secondary'}>
                        {pageMetrics.canonicalUrl ? 'Set' : 'Missing'}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Content Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pageMetrics && (
                  <>
                    <div className="flex justify-between">
                      <span>H1 Tags</span>
                      <Badge variant={pageMetrics.h1Count === 1 ? 'default' : 'secondary'}>
                        {pageMetrics.h1Count}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>H2 Tags</span>
                      <Badge>{pageMetrics.h2Count}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Internal Links</span>
                      <Badge>{pageMetrics.internalLinks}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>External Links</span>
                      <Badge>{pageMetrics.externalLinks}</Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Analysis Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Image Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pageMetrics && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{pageMetrics.imageCount}</div>
                    <p className="text-sm text-muted-foreground">Total Images</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {pageMetrics.imagesWithoutAlt}
                    </div>
                    <p className="text-sm text-muted-foreground">Missing Alt Text</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {pageMetrics.imageCount - pageMetrics.imagesWithoutAlt}
                    </div>
                    <p className="text-sm text-muted-foreground">Optimized</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEODashboard;
