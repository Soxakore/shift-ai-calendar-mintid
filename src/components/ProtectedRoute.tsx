import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'admin' | 'manager';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  requireRole 
}) => {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  // 🚨 TEMPORARY: Authentication disabled for easy testing
  // Uncomment the code below to re-enable authentication
  
  /*
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && !hasRole(requireRole)) {
    // Redirect to home page if user doesn't have required role
    return <Navigate to="/" replace />;
  }
  */

  // Always allow access when authentication is disabled
  return <>{children}</>;
};

export default ProtectedRoute;
