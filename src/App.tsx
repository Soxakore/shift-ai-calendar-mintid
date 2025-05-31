
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/hooks/useTheme';
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth';
import { SystemStatusProvider } from '@/hooks/useSystemStatus';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Auth from '@/pages/Auth';
import SuperAdminInitial from '@/pages/SuperAdminInitial';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import OrgAdminDashboard from '@/pages/OrgAdminDashboard';
import ManagerDashboard from '@/pages/ManagerDashboard';
import EmployeeDashboard from '@/pages/EmployeeDashboard';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mintid-theme">
      <SupabaseAuthProvider>
        <SystemStatusProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/super-admin-login" element={<SuperAdminInitial />} />
                
                {/* Protected routes */}
                <Route path="/super-admin" element={
                  <ProtectedRoute requireRole="super_admin">
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/org-admin" element={
                  <ProtectedRoute requireRole="org_admin">
                    <OrgAdminDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/manager" element={
                  <ProtectedRoute requireRole="manager">
                    <ManagerDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/employee" element={
                  <ProtectedRoute requireRole="employee">
                    <EmployeeDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/auth" replace />} />
              </Routes>
              
              <Toaster />
            </div>
          </Router>
        </SystemStatusProvider>
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
}

export default App;
