/**
 * Advanced Performance Monitoring Hook
 * Provides real-time performance metrics and Web Vitals tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  trackWebVitals, 
  trackPerformanceMetrics, 
  analyzeBundlePerformance,
  type PerformanceMetrics,
  type WebVitalsMetrics 
} from '@/lib/performance';

export interface UsePerformanceMetricsReturn {
  // Current metrics
  webVitals: WebVitalsMetrics | null;
  performanceMetrics: PerformanceMetrics | null;
  bundleMetrics: any | null;
  
  // Performance state
  isLoading: boolean;
  hasErrors: boolean;
  lastUpdated: Date | null;
  
  // Performance score (0-100)
  performanceScore: number;
  
  // Actions
  refreshMetrics: () => void;
  resetMetrics: () => void;
  exportMetrics: () => string;
  
  // Real-time monitoring
  startMonitoring: () => void;
  stopMonitoring: () => void;
  isMonitoring: boolean;
}

export interface PerformanceThresholds {
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

// Performance thresholds based on Core Web Vitals
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 }
};

/**
 * Custom hook for comprehensive performance monitoring
 */
export const usePerformanceMetrics = (
  options: {
    autoStart?: boolean;
    updateInterval?: number;
    thresholds?: Partial<PerformanceThresholds>;
    enableRealTimeMonitoring?: boolean;
  } = {}
): UsePerformanceMetricsReturn => {
  const {
    autoStart = true,
    updateInterval = 30000, // 30 seconds
    thresholds = {},
    enableRealTimeMonitoring = true
  } = options;

  // State
  const [webVitals, setWebVitals] = useState<WebVitalsMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [bundleMetrics, setBundleMetrics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const metricsHistoryRef = useRef<{
    webVitals: WebVitalsMetrics[];
    performance: PerformanceMetrics[];
    timestamps: Date[];
  }>({
    webVitals: [],
    performance: [],
    timestamps: []
  });

  // Merge thresholds
  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  /**
   * Calculate performance score based on Web Vitals
   */
  const calculatePerformanceScore = useCallback((vitals: WebVitalsMetrics): number => {
    let score = 0;
    let validMetrics = 0;

    // LCP Score (25% weight)
    if (vitals.lcp !== null) {
      if (vitals.lcp <= finalThresholds.lcp.good) score += 25;
      else if (vitals.lcp <= finalThresholds.lcp.poor) score += 15;
      else score += 5;
      validMetrics++;
    }

    // FID Score (25% weight)
    if (vitals.fid !== null) {
      if (vitals.fid <= finalThresholds.fid.good) score += 25;
      else if (vitals.fid <= finalThresholds.fid.poor) score += 15;
      else score += 5;
      validMetrics++;
    }

    // CLS Score (25% weight)
    if (vitals.cls !== null) {
      if (vitals.cls <= finalThresholds.cls.good) score += 25;
      else if (vitals.cls <= finalThresholds.cls.poor) score += 15;
      else score += 5;
      validMetrics++;
    }

    // FCP Score (15% weight)
    if (vitals.fcp !== null) {
      if (vitals.fcp <= finalThresholds.fcp.good) score += 15;
      else if (vitals.fcp <= finalThresholds.fcp.poor) score += 10;
      else score += 3;
      validMetrics++;
    }

    // TTFB Score (10% weight)
    if (vitals.ttfb !== null) {
      if (vitals.ttfb <= finalThresholds.ttfb.good) score += 10;
      else if (vitals.ttfb <= finalThresholds.ttfb.poor) score += 7;
      else score += 2;
      validMetrics++;
    }

    return validMetrics > 0 ? Math.round(score) : 0;
  }, [finalThresholds]);

  /**
   * Collect all performance metrics
   */
  const collectMetrics = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setHasErrors(false);

    try {
      // Collect Web Vitals
      const vitals = await new Promise<WebVitalsMetrics>((resolve) => {
        const metrics: Partial<WebVitalsMetrics> = {};
        let collectedCount = 0;
        const expectedMetrics = 5;

        const handleMetric = (metric: any) => {
          switch (metric.name) {
            case 'LCP':
              metrics.lcp = metric.value;
              break;
            case 'FID':
              metrics.fid = metric.value;
              break;
            case 'CLS':
              metrics.cls = metric.value;
              break;
            case 'FCP':
              metrics.fcp = metric.value;
              break;
            case 'TTFB':
              metrics.ttfb = metric.value;
              break;
          }
          
          collectedCount++;
          if (collectedCount === expectedMetrics) {
            resolve(metrics as WebVitalsMetrics);
          }
        };

        // Start collecting Web Vitals
        trackWebVitals(handleMetric);

        // Fallback timeout
        setTimeout(() => {
          resolve({
            lcp: metrics.lcp || null,
            fid: metrics.fid || null,
            cls: metrics.cls || null,
            fcp: metrics.fcp || null,
            ttfb: metrics.ttfb || null
          });
        }, 3000);
      });

      // Collect performance metrics
      const perfMetrics = trackPerformanceMetrics();

      // Collect bundle metrics
      const bundleData = analyzeBundlePerformance();

      // Update state
      setWebVitals(vitals);
      setPerformanceMetrics(perfMetrics);
      setBundleMetrics(bundleData);
      setLastUpdated(new Date());

      // Store in history
      metricsHistoryRef.current.webVitals.push(vitals);
      metricsHistoryRef.current.performance.push(perfMetrics);
      metricsHistoryRef.current.timestamps.push(new Date());

      // Keep only last 50 entries
      if (metricsHistoryRef.current.webVitals.length > 50) {
        metricsHistoryRef.current.webVitals.shift();
        metricsHistoryRef.current.performance.shift();
        metricsHistoryRef.current.timestamps.shift();
      }

    } catch (error) {
      console.error('Error collecting performance metrics:', error);
      setHasErrors(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Start real-time monitoring
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);

    // Collect initial metrics
    collectMetrics();

    // Set up interval for regular updates
    intervalRef.current = setInterval(collectMetrics, updateInterval);

    // Set up Performance Observer for real-time updates
    if (enableRealTimeMonitoring && 'PerformanceObserver' in window) {
      try {
        observerRef.current = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation' || entry.entryType === 'paint') {
              // Trigger metrics update for significant events
              setTimeout(collectMetrics, 100);
            }
          }
        });

        observerRef.current.observe({ 
          entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] 
        });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }
  }, [isMonitoring, collectMetrics, updateInterval, enableRealTimeMonitoring]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  /**
   * Reset all metrics
   */
  const resetMetrics = useCallback(() => {
    setWebVitals(null);
    setPerformanceMetrics(null);
    setBundleMetrics(null);
    setLastUpdated(null);
    setHasErrors(false);
    metricsHistoryRef.current = {
      webVitals: [],
      performance: [],
      timestamps: []
    };
  }, []);

  /**
   * Export metrics as JSON
   */
  const exportMetrics = useCallback((): string => {
    return JSON.stringify({
      current: {
        webVitals,
        performanceMetrics,
        bundleMetrics,
        lastUpdated,
        performanceScore: webVitals ? calculatePerformanceScore(webVitals) : 0
      },
      history: metricsHistoryRef.current,
      thresholds: finalThresholds,
      metadata: {
        exportedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }, null, 2);
  }, [webVitals, performanceMetrics, bundleMetrics, lastUpdated, calculatePerformanceScore, finalThresholds]);

  // Calculate current performance score
  const performanceScore = webVitals ? calculatePerformanceScore(webVitals) : 0;

  // Auto-start monitoring
  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [autoStart, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    // Current metrics
    webVitals,
    performanceMetrics,
    bundleMetrics,
    
    // State
    isLoading,
    hasErrors,
    lastUpdated,
    performanceScore,
    
    // Actions
    refreshMetrics: collectMetrics,
    resetMetrics,
    exportMetrics,
    
    // Monitoring
    startMonitoring,
    stopMonitoring,
    isMonitoring
  };
};

/**
 * Hook for performance alerts
 */
export const usePerformanceAlerts = (metrics: WebVitalsMetrics | null, thresholds = DEFAULT_THRESHOLDS) => {
  const [alerts, setAlerts] = useState<Array<{
    type: 'warning' | 'error';
    metric: string;
    value: number;
    threshold: number;
    message: string;
  }>>([]);

  useEffect(() => {
    if (!metrics) {
      setAlerts([]);
      return;
    }

    const newAlerts: typeof alerts = [];

    // Check LCP
    if (metrics.lcp !== null) {
      if (metrics.lcp > thresholds.lcp.poor) {
        newAlerts.push({
          type: 'error',
          metric: 'LCP',
          value: metrics.lcp,
          threshold: thresholds.lcp.poor,
          message: `Largest Contentful Paint is ${metrics.lcp}ms (should be under ${thresholds.lcp.poor}ms)`
        });
      } else if (metrics.lcp > thresholds.lcp.good) {
        newAlerts.push({
          type: 'warning',
          metric: 'LCP',
          value: metrics.lcp,
          threshold: thresholds.lcp.good,
          message: `Largest Contentful Paint could be improved: ${metrics.lcp}ms (target: under ${thresholds.lcp.good}ms)`
        });
      }
    }

    // Check FID
    if (metrics.fid !== null) {
      if (metrics.fid > thresholds.fid.poor) {
        newAlerts.push({
          type: 'error',
          metric: 'FID',
          value: metrics.fid,
          threshold: thresholds.fid.poor,
          message: `First Input Delay is ${metrics.fid}ms (should be under ${thresholds.fid.poor}ms)`
        });
      } else if (metrics.fid > thresholds.fid.good) {
        newAlerts.push({
          type: 'warning',
          metric: 'FID',
          value: metrics.fid,
          threshold: thresholds.fid.good,
          message: `First Input Delay could be improved: ${metrics.fid}ms (target: under ${thresholds.fid.good}ms)`
        });
      }
    }

    // Check CLS
    if (metrics.cls !== null) {
      if (metrics.cls > thresholds.cls.poor) {
        newAlerts.push({
          type: 'error',
          metric: 'CLS',
          value: metrics.cls,
          threshold: thresholds.cls.poor,
          message: `Cumulative Layout Shift is ${metrics.cls} (should be under ${thresholds.cls.poor})`
        });
      } else if (metrics.cls > thresholds.cls.good) {
        newAlerts.push({
          type: 'warning',
          metric: 'CLS',
          value: metrics.cls,
          threshold: thresholds.cls.good,
          message: `Cumulative Layout Shift could be improved: ${metrics.cls} (target: under ${thresholds.cls.good})`
        });
      }
    }

    setAlerts(newAlerts);
  }, [metrics, thresholds]);

  return alerts;
};
