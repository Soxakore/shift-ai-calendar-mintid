import React, { Suspense, useEffect, lazy, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SupabaseAuthProvider } from "@/hooks/useSupabaseAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import RpcCallMonitor from "@/components/debug/RpcCallMonitor";

// Pages - Direct imports for critical paths
import UnifiedLogin from "./pages/UnifiedLogin";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

// Lazy load everything else
const TestUnifiedLogin = lazy(() => import("./pages/TestUnifiedLogin"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const StorageOptimizationTestPage = lazy(() => import("./pages/StorageOptimizationTestPage"));

// Dashboard components
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const OrgAdminDashboard = lazy(() => import("./pages/OrgAdminDashboard"));
const ManagerDashboard = lazy(() => import("./pages/ManagerDashboard"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));

// Initialize only in production
const isProd = import.meta.env.PROD;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: isProd ? 3 : 1,
    },
  },
});

// Route-level error boundary
const RouteFallback: React.ComponentType<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="p-4 text-center">
    <p>Route failed to load. Please refresh.</p>
    <button onClick={retry} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
      Retry
    </button>
  </div>
);

const RouteErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary fallback={RouteFallback}>
    {children}
  </ErrorBoundary>
);

const App = () => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  console.log(`🔥 App render #${renderCount.current}`);
  
  useEffect(() => {
    console.log(`🔥 App useEffect triggered - render #${renderCount.current}`);
    // Defer non-critical initializations
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Analytics only in production
        if (isProd) {
          import('@/lib/analytics').then(({ initGA }) => initGA());
          import('@/lib/sentry').then(({ initSentry }) => initSentry());
        }
        
        // Performance monitoring only in dev
        if (!isProd) {
          import('@/lib/performance').then(({ initPerformanceMonitoring }) => {
            initPerformanceMonitoring();
          });
        }
      });
    }
  }, []);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="minatid-ui-theme">
            <SupabaseAuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Critical paths - no lazy loading */}
                    <Route path="/" element={<UnifiedLogin />} />
                    <Route path="/login" element={<UnifiedLogin />} />
                    <Route path="/auth" element={<Navigate to="/login" replace />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    
                    {/* Secondary paths - lazy loaded */}
                    <Route 
                      path="/test-login" 
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <TestUnifiedLogin />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/profile-setup" 
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProfileSetup />
                        </Suspense>
                      } 
                    />
                    
                    {/* Storage Optimization Test Page */}
                    <Route 
                      path="/storage-test" 
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <StorageOptimizationTestPage />
                        </Suspense>
                      } 
                    />
                    
                    {/* Protected routes with error boundaries */}
                    <Route
                      path="/super-admin"
                      element={
                        <ProtectedRoute requireRole="super_admin">
                          <RouteErrorBoundary>
                            <Suspense fallback={<LoadingSpinner text="Loading..." />}>
                              <SuperAdminDashboard />
                            </Suspense>
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/history"
                      element={
                        <ProtectedRoute requireRole="super_admin">
                          <RouteErrorBoundary>
                            <Suspense fallback={<LoadingSpinner text="Loading..." />}>
                              <HistoryPage />
                            </Suspense>
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/org-admin"
                      element={
                        <ProtectedRoute requireRole="org_admin">
                          <RouteErrorBoundary>
                            <Suspense fallback={<LoadingSpinner text="Loading..." />}>
                              <OrgAdminDashboard />
                            </Suspense>
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manager"
                      element={
                        <ProtectedRoute requireRole="manager">
                          <RouteErrorBoundary>
                            <Suspense fallback={<LoadingSpinner text="Loading..." />}>
                              <ManagerDashboard />
                            </Suspense>
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/employee"
                      element={
                        <ProtectedRoute requireRole="employee">
                          <RouteErrorBoundary>
                            <Suspense fallback={<LoadingSpinner text="Loading..." />}>
                              <EmployeeDashboard />
                            </Suspense>
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/schedule"
                      element={
                        <ProtectedRoute requireRole={["employee", "manager", "org_admin"]}>
                          <RouteErrorBoundary>
                            <Suspense fallback={<LoadingSpinner text="Loading..." />}>
                              <SchedulePage />
                            </Suspense>
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    
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