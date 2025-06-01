
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type UserRole = 'super_admin' | 'org_admin' | 'manager' | 'employee';

interface RoleBasedAuthProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleBasedAuth: React.FC<RoleBasedAuthProps> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useSupabaseAuth();

  console.log('🔐 RoleBasedAuth check:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    userType: profile?.user_type,
    allowedRoles,
    loading 
  });

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  if (!user) {
    console.log('🔐 No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    console.log('🔐 No profile, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in the allowed roles
  const userRole = profile.user_type as UserRole;
  if (!allowedRoles.includes(userRole)) {
    console.log('🔐 User role not allowed:', userRole, 'Allowed:', allowedRoles);
    
    // Redirect to appropriate dashboard based on user's actual role
    switch (userRole) {
      case 'super_admin':
        return <Navigate to="/super-admin" replace />;
      case 'org_admin':
        return <Navigate to="/org-admin" replace />;
      case 'manager':
        return <Navigate to="/manager" replace />;
      case 'employee':
        return <Navigate to="/employee" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  console.log('🔐 Access granted for role:', userRole);
  return <>{children}</>;
};

export default RoleBasedAuth;
