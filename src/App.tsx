
// 🚨 ROLE-BASED ACCESS CONTROL DEMO
// Authentication is temporarily disabled for easy testing
// The app now shows a role selector to demonstrate different user experiences
// To re-enable authentication, see: AUTHENTICATION_TOGGLE.md

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { initializeStorage } from "@/lib/storage";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSelector from "./pages/RoleSelector";
import Index from "./pages/Index";
import Login from "./pages/Login";
import WorkerLogin from "./pages/WorkerLogin";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Initialize localStorage with sample data
initializeStorage();

const queryClient = new QueryClient();

// Main App Routes Component
const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<WorkerLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {/* Role-based dashboard selector - authentication disabled for demo */}
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
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
);

export default App;
