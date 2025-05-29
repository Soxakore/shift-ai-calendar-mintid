// 🚨 ROLE-BASED ACCESS CONTROL DEMO
// Authentication is temporarily disabled for easy testing
// The app now shows a role selector to demonstrate different user experiences
// To re-enable authentication, see: AUTHENTICATION_TOGGLE.md

import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { initializeStorage } from "@/lib/storage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import RoleSelector from "./pages/RoleSelector";
import Index from "./pages/Index";
import Login from "./pages/Login";
import WorkerLogin from "./pages/WorkerLogin";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Lazy load dashboard components for better performance
import {
  LazySuperAdminDashboard,
  LazyOrgAdminDashboard,
  LazyManagerDashboard,
  LazyEmployeeDashboard
} from "@/components/LazyComponents";

// Initialize analytics and error tracking
import { initGA, trackPageView } from "@/lib/analytics";
import { initSentry } from "@/lib/sentry";
import { initPerformanceMonitoring, analyzeBundlePerformance } from "@/lib/performance";
import { globalSEOMonitor, seoUtils } from "@/lib/seoValidator";

// Initialize localStorage with sample data
initializeStorage();

// Initialize performance monitoring
initPerformanceMonitoring();
analyzeBundlePerformance();

// Initialize SEO monitoring and enhancements
if (process.env.NODE_ENV === 'development') {
  globalSEOMonitor.start();
}
seoUtils.preloadCriticalSEO();
seoUtils.lazyLoadSEOEnhancements();

const queryClient = new QueryClient();

// Analytics tracker component
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    trackPageView(document.title);
  }, [location]);

  return null;
};

// Main App Routes Component
const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading MinTid..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/login" element={<WorkerLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role-selector"
          element={
            <ProtectedRoute>
              <RoleSelector />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner text="Loading Super Admin Dashboard..." />}>
                <LazySuperAdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/org-admin"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner text="Loading Organization Dashboard..." />}>
                <LazyOrgAdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner text="Loading Manager Dashboard..." />}>
                <LazyManagerDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner text="Loading Employee Dashboard..." />}>
                <LazyEmployeeDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  useEffect(() => {
    // Initialize analytics and error tracking
    initGA();
    initSentry();
    
    // Initialize SEO monitoring in production
    if (process.env.NODE_ENV === 'production') {
      globalSEOMonitor.start();
    }
  }, []);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="mintid-ui-theme">
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppRoutes />
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
