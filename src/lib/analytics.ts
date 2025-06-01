
// Google Analytics 4 utilities with enhanced production configuration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID';
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

// Initialize Google Analytics
export const initGA = () => {
  // Skip in development unless explicitly enabled
  if (!ENABLE_ANALYTICS && APP_ENV === 'development') {
    console.log('[Analytics] Disabled in development mode');
    return;
  }

  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'GA_MEASUREMENT_ID') {
    console.warn('[Analytics] Google Analytics not configured - using placeholder ID');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: any[]) {
    window.dataLayer.push(args);
  };

  // Configure GA with enhanced options
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    // Enhanced configuration for production
    send_page_view: true,
    allow_google_signals: true,
    allow_ad_personalization_signals: false, // Privacy-focused
    cookie_expires: 63072000, // 2 years
    cookie_flags: 'SameSite=Strict;Secure', // Enhanced security
    app_name: 'MinTid',
    app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    custom_map: {
      custom_parameter_1: 'user_role',
      custom_parameter_2: 'page_type',
      custom_parameter_3: 'feature_used'
    }
  });

  console.log(`[Analytics] Google Analytics initialized with ID: ${GA_MEASUREMENT_ID}`);
};

// Page view tracking
export const trackPageView = (page_title: string, page_location?: string) => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title,
    page_location: page_location || window.location.href,
  });
};

// Event tracking
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  custom_parameters?: Record<string, any>
) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...custom_parameters,
  });
};

// Enhanced ecommerce tracking (for future use)
export const trackPurchase = (transaction_id: string, value: number, currency = 'USD', items: any[] = []) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'purchase', {
    transaction_id,
    value,
    currency,
    items,
  });
};

// User engagement tracking
export const trackUserEngagement = (engagement_time_msec: number) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'user_engagement', {
    engagement_time_msec,
  });
};

// Custom events for MinTid features
export const trackFeatureUsage = (feature_name: string, user_role?: string) => {
  trackEvent('feature_usage', 'engagement', feature_name, undefined, {
    user_role,
    timestamp: new Date().toISOString(),
  });
};

export const trackScheduleAction = (action: 'create' | 'edit' | 'delete' | 'view', schedule_type?: string) => {
  trackEvent(action, 'schedule', schedule_type, undefined, {
    timestamp: new Date().toISOString(),
  });
};

export const trackTaskAction = (action: 'create' | 'complete' | 'edit' | 'delete', task_type?: string) => {
  trackEvent(action, 'task', task_type, undefined, {
    timestamp: new Date().toISOString(),
  });
};

export const trackAuthAction = (action: 'login' | 'logout' | 'register' | 'role_switch', role?: string) => {
  trackEvent(action, 'authentication', role, undefined, {
    timestamp: new Date().toISOString(),
  });
};

export const trackReportGeneration = (report_type: string, user_role?: string) => {
  trackEvent('generate', 'report', report_type, undefined, {
    user_role,
    timestamp: new Date().toISOString(),
  });
};

export const trackError = (error_name: string, error_message?: string) => {
  trackEvent('error', 'application', error_name, undefined, {
    error_message,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  });
};

// Performance tracking
export const trackTiming = (name: string, value: number, category = 'performance') => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'timing_complete', {
    name,
    value,
    event_category: category,
  });
};

// User properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    custom_map: properties,
  });
};
