import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const isProd = import.meta.env.PROD;
const isDev = import.meta.env.DEV;

// Global debugging for the "12" issue
if (isDev) {
  // Override console methods to catch the "12" issue
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  const checkForTwelve = (args: unknown[]) => {
    const message = args.join(' ');
    if (message.includes('"12"') || message.includes("'12'") || message.includes('invalid input syntax for type uuid: \'12\'')) {
      console.trace('🚨 FOUND THE "12" ISSUE!', args);
      // eslint-disable-next-line no-debugger
      debugger; // This will pause execution in dev tools
    }
  };
  
  console.log = (...args: unknown[]) => {
    checkForTwelve(args);
    originalLog.apply(console, args);
  };
  
  console.error = (...args: unknown[]) => {
    checkForTwelve(args);
    originalError.apply(console, args);
  };
  
  console.warn = (...args: unknown[]) => {
    checkForTwelve(args);
    originalWarn.apply(console, args);
  };
  
  // Global error handler
  window.addEventListener('error', (event) => {
    if (event.message.includes('12') || event.error?.message?.includes('12')) {
      console.trace('🚨 GLOBAL ERROR with "12":', event);
      // eslint-disable-next-line no-debugger
      debugger;
    }
  });
  
  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('12') || JSON.stringify(event.reason).includes('"12"')) {
      console.trace('🚨 UNHANDLED PROMISE REJECTION with "12":', event);
      // eslint-disable-next-line no-debugger
      debugger;
    }
  });
}

// Performance mark for startup
if (isDev) {
  performance.mark('app-init-start');
}

// Get root element with fallback
const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="padding:20px">Failed to initialize app. Please refresh.</div>';
  throw new Error('Root element not found');
}

// Initialize React app
try {
  const root = createRoot(rootElement);
  root.render(
    // <StrictMode> // Temporarily disabled to fix double rendering in dev mode
      <App />
    // </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = '<div style="padding:20px">Application error. Please refresh.</div>';
}

// Defer non-critical initializations
if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(() => {
    // Lazy load storage only when needed
    import('./lib/storage').then(({ initializeStorage }) => {
      // Check if user is authenticated before init
      const hasAuth = localStorage.getItem('sb-auth-token');
      if (hasAuth) {
        initializeStorage();
      }
    }).catch(err => {
      if (isDev) console.error('Storage init failed:', err);
    });

    // Register service worker in production
    if ('serviceWorker' in navigator && isProd) {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      }).catch(() => {
        // Silently fail - SW is enhancement, not requirement
      });
    }
  });
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(() => {
    import('./lib/storage').then(({ initializeStorage }) => {
      const hasAuth = localStorage.getItem('sb-auth-token');
      if (hasAuth) {
        initializeStorage();
      }
    }).catch(() => {});
  }, 1000);
}

// Dev-only performance measurement
if (isDev) {
  window.addEventListener('load', () => {
    performance.mark('app-init-end');
    performance.measure('app-init', 'app-init-start', 'app-init-end');
    const measure = performance.getEntriesByName('app-init')[0];
    console.log(`App initialized in ${Math.round(measure.duration)}ms`);
  });
}