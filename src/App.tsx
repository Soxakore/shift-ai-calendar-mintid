
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/hooks/useTheme';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import './App.css';

// Lazy load components
const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const SuperAdminDashboard = lazy(() => import('@/pages/SuperAdminDashboard'));
const OrgAdminDashboard = lazy(() => import('@/pages/OrgAdminDashboard'));
const ManagerDashboard = lazy(() => import('@/pages/ManagerDashboard'));
const EmployeeDashboard = lazy(() => import('@/pages/EmployeeDashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mintid-theme">
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/super-admin"
                    element={
                      <ProtectedRoute allowedRoles={['super_admin']}>
                        <SuperAdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/org-admin"
                    element={
                      <ProtectedRoute allowedRoles={['org_admin']}>
                        <OrgAdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/manager"
                    element={
                      <ProtectedRoute allowedRoles={['manager']}>
                        <ManagerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employee"
                    element={
                      <ProtectedRoute allowedRoles={['employee']}>
                        <EmployeeDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
          <Toaster />
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
