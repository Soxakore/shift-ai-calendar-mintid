
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load components
import { 
  LoginPage,
  EmployeeDashboard,
  SchedulePage,
  SuperAdminDashboard,
  SuperAdminOrganizationsPage,
  SuperAdminUsersPage,
  CreateManagerPage,
  OrgAdminDashboard,
  OrganizationManagement,
  HistoryPage,
  SEODashboard
} from "@/components/LazyComponents";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/employee-dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
                <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
                <Route path="/super-admin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
                
                {/* New Super Admin Routes */}
                <Route path="/super-admin/organizations" element={<ProtectedRoute><SuperAdminOrganizationsPage /></ProtectedRoute>} />
                <Route path="/super-admin/users-page" element={<ProtectedRoute><SuperAdminUsersPage /></ProtectedRoute>} />
                <Route path="/super-admin/create-manager" element={<ProtectedRoute><CreateManagerPage /></ProtectedRoute>} />
                
                <Route path="/org-admin" element={<ProtectedRoute><OrgAdminDashboard /></ProtectedRoute>} />
                <Route path="/org-management" element={<ProtectedRoute><OrganizationManagement /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/seo-dashboard" element={<ProtectedRoute><SEODashboard /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
