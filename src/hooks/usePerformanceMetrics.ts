
import { useState, useEffect, useCallback } from 'react';
import { 
  getPerformanceMetrics
} from '@/lib/performance';

// Extend the Performance interface to include memory
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Define the performance metrics interface
export interface PerformanceMetrics {
  navigationTiming?: {
    domContentLoadedEventEnd?: number;
    loadEventEnd?: number;
  };
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  resourceTiming?: PerformanceResourceTiming[];
}

export interface WebVitalsMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
}

interface BundleMetrics {
  totalResources: number;
  totalSize?: number;
  largestResource?: {
    name: string;
    size: number;
    type: string;
  };
}

interface UsePerformanceMetricsOptions {
  autoStart?: boolean;
  updateInterval?: number;
  enableRealTimeMonitoring?: boolean;
}

interface PerformanceAlert {
  type: 'warning' | 'error';
  message: string;
  metric: string;
}

export const usePerformanceMetrics = (options: UsePerformanceMetricsOptions = {}) => {
  const {
    autoStart = false,
    updateInterval = 30000,
    enableRealTimeMonitoring = false
  } = options;

  const [webVitals, setWebVitals] = useState<WebVitalsMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [bundleMetrics, setBundleMetrics] = useState<BundleMetrics | null>(null);
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const refreshMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get basic performance metrics
      const metrics = getPerformanceMetrics();
      setPerformanceMetrics({
        navigationTiming: {
          domContentLoadedEventEnd: performance.timing?.domContentLoadedEventEnd || 0,
          loadEventEnd: performance.timing?.loadEventEnd || 0
        },
        memory: (performance as PerformanceWithMemory).memory ? {
          usedJSHeapSize: (performance as PerformanceWithMemory).memory!.usedJSHeapSize,
          totalJSHeapSize: (performance as PerformanceWithMemory).memory!.totalJSHeapSize,
          jsHeapSizeLimit: (performance as PerformanceWithMemory).memory!.jsHeapSizeLimit
        } : undefined
      });

      // Calculate performance score
      const score = Math.floor(Math.random() * 40) + 60; // Mock score 60-100
      setPerformanceScore(score);

      // Mock Web Vitals
      setWebVitals({
        lcp: Math.random() * 3000 + 1000,
        fid: Math.random() * 100 + 50,
        cls: Math.random() * 0.2,
        fcp: Math.random() * 2000 + 500,
        ttfb: Math.random() * 500 + 100
      });

      // Mock bundle metrics
      setBundleMetrics({
        totalResources: Math.floor(Math.random() * 50) + 20,
        totalSize: Math.floor(Math.random() * 1000000) + 500000,
        largestResource: {
          name: 'main.js',
          size: Math.floor(Math.random() * 500000) + 100000,
          type: 'script'
        }
      });
    } catch (error) {
      console.error('Error refreshing performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    if (enableRealTimeMonitoring) {
      const interval = setInterval(refreshMetrics, updateInterval);
      return () => clearInterval(interval);
    }
  }, [refreshMetrics, updateInterval, enableRealTimeMonitoring]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const exportMetrics = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      webVitals,
      performanceMetrics,
      bundleMetrics,
      performanceScore
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [webVitals, performanceMetrics, bundleMetrics, performanceScore]);

  useEffect(() => {
    if (autoStart) {
      refreshMetrics();
      const cleanup = startMonitoring();
      return cleanup;
    }
  }, [autoStart, refreshMetrics, startMonitoring]);

  return {
    webVitals,
    performanceMetrics,
    bundleMetrics,
    performanceScore,
    isLoading,
    refreshMetrics,
    exportMetrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  };
};

export const usePerformanceAlerts = (webVitals: WebVitalsMetrics | null): PerformanceAlert[] => {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  useEffect(() => {
    if (!webVitals) return;

    const newAlerts: PerformanceAlert[] = [];

    if (webVitals.lcp && webVitals.lcp > 2500) {
      newAlerts.push({
        type: 'warning',
        message: `LCP is ${Math.round(webVitals.lcp)}ms (should be under 2500ms)`,
        metric: 'lcp'
      });
    }

    if (webVitals.fid && webVitals.fid > 100) {
      newAlerts.push({
        type: 'error',
        message: `FID is ${Math.round(webVitals.fid)}ms (should be under 100ms)`,
        metric: 'fid'
      });
    }

    if (webVitals.cls && webVitals.cls > 0.1) {
      newAlerts.push({
        type: 'warning',
        message: `CLS is ${webVitals.cls.toFixed(3)} (should be under 0.1)`,
        metric: 'cls'
      });
    }

    setAlerts(newAlerts);
  }, [webVitals]);

  return alerts;
};
