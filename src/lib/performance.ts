// Core Web Vitals and Performance Monitoring
import React from 'react';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

interface PerformanceMetrics {
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift
  FCP: number | null; // First Contentful Paint
  TTFB: number | null; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null
  };

  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          this.metrics.LCP = lastEntry.startTime;
          this.reportMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: PerformanceEntry & { processingStart: number; startTime: number }) => {
            this.metrics.FID = entry.processingStart - entry.startTime;
            this.reportMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: PerformanceEntry & { hadRecentInput: boolean; value: number }) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.CLS = clsValue;
          this.reportMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: PerformanceEntry & { name: string; startTime: number }) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.FCP = entry.startTime;
              this.reportMetric('FCP', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }

    // Time to First Byte (TTFB)
    if (performance.timing) {
      window.addEventListener('load', () => {
        const ttfb = performance.timing.responseStart - performance.timing.navigationStart;
        this.metrics.TTFB = ttfb;
        this.reportMetric('TTFB', ttfb);
      });
    }
  }

  private reportMetric(name: string, value: number) {
    const rating = this.getRating(name, value);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`📊 ${name}: ${value.toFixed(2)}ms (${rating})`);
    }

    // Send to analytics in production
    if (import.meta.env.PROD && window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        event_label: rating,
        value: Math.round(value),
        custom_map: { metric_value: 'value' }
      });
    }

    // Send to custom analytics endpoint
    this.sendToAnalytics(name, value, rating);
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: [2500, 4000], // ms
      FID: [100, 300],   // ms
      CLS: [0.1, 0.25],  // unitless
      FCP: [1800, 3000], // ms
      TTFB: [800, 1800]  // ms
    };

    const [good, poor] = thresholds[name as keyof typeof thresholds] || [0, 0];
    
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  private async sendToAnalytics(name: string, value: number, rating: string) {
    // Custom analytics endpoint - implement based on your needs
    try {
      if (import.meta.env.PROD) {
        await fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metric: name,
            value,
            rating,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
          })
        });
      }
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Performance Budget Monitoring
export const PERFORMANCE_BUDGETS = {
  LCP: 2500,    // Good: < 2.5s
  FID: 100,     // Good: < 100ms
  CLS: 0.1,     // Good: < 0.1
  FCP: 1800,    // Good: < 1.8s
  TTFB: 800,    // Good: < 800ms
  bundleSize: 250000, // 250KB main bundle
  totalSize: 1000000  // 1MB total
};

// Initialize performance monitoring
let performanceMonitor: PerformanceMonitor | null = null;

export const initPerformanceMonitoring = () => {
  if (typeof window !== 'undefined' && !performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
};

export const getPerformanceMetrics = () => {
  return performanceMonitor?.getMetrics() || null;
};

export const destroyPerformanceMonitoring = () => {
  if (performanceMonitor) {
    performanceMonitor.destroy();
    performanceMonitor = null;
  }
};

// Resource Loading Performance
export const measureResourceLoad = (name: string) => {
  return {
    start: () => performance.mark(`${name}-start`),
    end: () => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      if (measure && import.meta.env.DEV) {
        console.log(`⚡ ${name}: ${measure.duration.toFixed(2)}ms`);
      }
      
      return measure?.duration || 0;
    }
  };
};

// Bundle Size Analysis
export const analyzeBundlePerformance = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const analysis = {
        pageLoad: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        timeToInteractive: navigation.loadEventEnd - navigation.fetchStart,
        resourceCount: resources.length,
        totalTransferSize: resources.reduce((total, resource) => total + (resource.transferSize || 0), 0),
        jsSize: resources
          .filter(r => r.name.endsWith('.js'))
          .reduce((total, resource) => total + (resource.transferSize || 0), 0),
        cssSize: resources
          .filter(r => r.name.endsWith('.css'))
          .reduce((total, resource) => total + (resource.transferSize || 0), 0)
      };

      if (import.meta.env.DEV) {
        console.table(analysis);
        
        // Check against performance budgets
        if (analysis.jsSize > PERFORMANCE_BUDGETS.bundleSize) {
          console.warn(`⚠️ JS bundle size (${(analysis.jsSize / 1024).toFixed(2)}KB) exceeds budget (${(PERFORMANCE_BUDGETS.bundleSize / 1024).toFixed(2)}KB)`);
        }
        
        if (analysis.totalTransferSize > PERFORMANCE_BUDGETS.totalSize) {
          console.warn(`⚠️ Total transfer size (${(analysis.totalTransferSize / 1024).toFixed(2)}KB) exceeds budget (${(PERFORMANCE_BUDGETS.totalSize / 1024).toFixed(2)}KB)`);
        }
      }

      return analysis;
    }, 2000); // Wait 2s after load for all resources
  });
};

// Performance Hook for React Components
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);

  React.useEffect(() => {
    const monitor = initPerformanceMonitoring();
    
    const updateMetrics = () => {
      setMetrics(monitor?.getMetrics() || null);
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    
    return () => {
      clearInterval(interval);
      destroyPerformanceMonitoring();
    };
  }, []);

  return metrics;
};

export default PerformanceMonitor;
