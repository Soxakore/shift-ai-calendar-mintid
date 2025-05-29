import * as Sentry from '@sentry/react';

export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const ENABLE_ERROR_TRACKING = import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true';
export const ERROR_SAMPLE_RATE = parseFloat(import.meta.env.VITE_ERROR_SAMPLE_RATE || '1.0');
export const PERFORMANCE_SAMPLE_RATE = parseFloat(import.meta.env.VITE_PERFORMANCE_SAMPLE_RATE || '0.1');

export const initSentry = () => {
  // Skip in development unless explicitly enabled
  if (!ENABLE_ERROR_TRACKING && APP_ENV === 'development') {
    console.log('[Sentry] Error tracking disabled in development mode');
    return;
  }

  // Only initialize when SENTRY_DSN is properly configured
  if (!SENTRY_DSN || SENTRY_DSN === 'https://your-sentry-dsn@sentry.io/project-id' || SENTRY_DSN === 'https://your-actual-sentry-dsn@o123456.ingest.sentry.io/123456') {
    console.warn('[Sentry] DSN not configured or using placeholder value');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: APP_ENV,
      release: `mintid@${APP_VERSION}`,
      
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // Session replay for debugging (only in production errors)
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance monitoring with environment-specific rates
      tracesSampleRate: APP_ENV === 'production' ? PERFORMANCE_SAMPLE_RATE : 1.0,
      
      // Replay settings
      replaysSessionSampleRate: 0.0, // Disable session replay
      replaysOnErrorSampleRate: APP_ENV === 'production' ? 0.1 : 0.0, // 10% error replay in production
      
      // Enhanced error filtering and context
      beforeSend(event, hint) {
        // Add additional context for debugging
        event.tags = {
          ...event.tags,
          app_version: APP_VERSION,
          environment: APP_ENV,
          feature: 'mintid_shift_scheduler'
        };

        // Add user context if available
        const user = localStorage.getItem('auth-user');
        if (user) {
          try {
            const userData = JSON.parse(user);
            event.user = {
              id: userData.id,
              role: userData.role,
              email: userData.email
            };
          } catch (e) {
            // Ignore JSON parse errors
          }
        }

        // Filter out common non-critical errors
        const error = hint.originalException;
        
        if (error && typeof error === 'object' && 'message' in error) {
          const message = error.message as string;
          
          // Filter out common browser extension errors
          if (message.includes('extension') || 
              message.includes('chrome-extension') ||
              message.includes('moz-extension')) {
            return null;
          }
          
          // Filter out network errors we can't control
          if (message.includes('Failed to fetch') ||
              message.includes('NetworkError') ||
              message.includes('AbortError')) {
            return null;
          }

          // Filter out ResizeObserver errors (common browser quirk)
          if (message.includes('ResizeObserver loop limit exceeded')) {
            return null;
          }

          // Filter out non-actionable errors
          if (message.includes('Script error') ||
              message.includes('Non-Error promise rejection captured')) {
            return null;
          }
        }
        
        return event;
      },
    });

    console.log(`[Sentry] Error tracking initialized with DSN: ${SENTRY_DSN.substring(0, 20)}...`);
  } catch (error) {
    console.error('[Sentry] Failed to initialize error tracking:', error);
  }
};

// Performance monitoring utilities
export const startTransaction = (name: string, op: string) => {
  return Sentry.startSpan({ name, op }, () => {});
};

export const captureException = (error: Error, context?: Record<string, unknown>) => {
  Sentry.captureException(error, { extra: context });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

// User context
export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
  Sentry.setUser(user);
};

export const clearUserContext = () => {
  Sentry.setUser(null);
};

// Custom performance monitoring
export const measurePerformance = async <T>(
  name: string,
  operation: () => Promise<T> | T
): Promise<T> => {
  return Sentry.startSpan({ name, op: 'function' }, async () => {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      Sentry.captureException(error as Error);
      throw error;
    }
  });
};
