
import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SupabaseAuthProvider } from "@/hooks/useSupabaseAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import LoginSelector from "./pages/LoginSelector";
import SuperAdminInitial from "./pages/SuperAdminInitial";
import HistoryPage from "./pages/HistoryPage";
import SchedulePage from "./pages/SchedulePage";
import NotFound from "./pages/NotFound";

// Role-specific login pages
import { 
  SuperAdminLogin, 
  OrgAdminLogin, 
  ManagerLogin, 
  EmployeeLogin 
} from "./pages/login/index";

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

// Initialize performance monitoring
// Temporarily disabled for debugging
console.log('🚀 App starting up...');
console.log('Performance monitoring disabled for debugging');

const queryClient = new QueryClient();

// Analytics tracker component
const AnalyticsTracker = () => {
  useEffect(() => {
    if (typeof trackPageView !== 'undefined') {
      trackPageView(document.title);
    }
  }, []);
  return null;
};

const App = () => {
  useEffect(() => {
    console.log('🎯 App useEffect running...');
    console.log('App initialized - analytics and sentry disabled for debugging');
  }, []);

  console.log('📱 App component rendering...');

  return (
    <HelmetProvider>
      <ErrorBoundary identifier="app-root" level="critical">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="mintid-ui-theme">
            <SupabaseAuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AnalyticsTracker />
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/login-select" element={<LoginSelector />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route 
                      path="/setup" 
                      element={
                        <ErrorBoundary identifier="setup-page" level="page">
                          <SuperAdminInitial />
                        </ErrorBoundary>
                      } 
                    />
                    
                    {/* Role-specific login routes for enhanced security */}
                    <Route path="/login/super-admin" element={<SuperAdminLogin />} />
                    <Route path="/login/org-admin" element={<OrgAdminLogin />} />
                    <Route path="/login/manager" element={<ManagerLogin />} />
                    <Route path="/login/employee" element={<EmployeeLogin />} />
                    
                    {/* Protected routes */}
                    <Route
                      path="/super-admin"
                      element={
                        <ProtectedRoute requireRole="super_admin">
                          <Suspense fallback={<LoadingSpinner text="Loading Super Admin Dashboard..." />}>
                            <LazySuperAdminDashboard />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/history"
                      element={
                        <ProtectedRoute requireRole="super_admin">
                          <Suspense fallback={<LoadingSpinner text="Loading History..." />}>
                            <HistoryPage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/org-admin"
                      element={
                        <ProtectedRoute requireRole="org_admin">
                          <Suspense fallback={<LoadingSpinner text="Loading Organization Dashboard..." />}>
                            <LazyOrgAdminDashboard />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manager"
                      element={
                        <ProtectedRoute requireRole="manager">
                          <Suspense fallback={<LoadingSpinner text="Loading Manager Dashboard..." />}>
                            <LazyManagerDashboard />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/employee"
                      element={
                        <ProtectedRoute requireRole="employee">
                          <Suspense fallback={<LoadingSpinner text="Loading Employee Dashboard..." />}>
                            <LazyEmployeeDashboard />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/schedule"
                      element={
                        <ProtectedRoute requireRole={["employee", "manager", "org_admin", "super_admin"]}>
                          <Suspense fallback={<LoadingSpinner text="Loading Schedule..." />}>
                            <SchedulePage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Default redirect based on authentication */}
                    <Route path="/" element={<LoginSelector />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </SupabaseAuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
