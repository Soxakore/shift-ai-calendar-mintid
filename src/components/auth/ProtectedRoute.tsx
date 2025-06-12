
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: string | string[];
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, profile, loading } = useSupabaseAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page with return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // SUPER ADMIN BYPASS - Allow super admin access without profile
  const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@mintid.live';
  const SUPER_ADMIN_GITHUB_USERNAME = import.meta.env.VITE_SUPER_ADMIN_GITHUB_USERNAME || 'mintid-admin';
  
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL || 
                      user?.user_metadata?.login === SUPER_ADMIN_GITHUB_USERNAME ||
                      user?.user_metadata?.user_name === SUPER_ADMIN_GITHUB_USERNAME ||
                      user?.user_metadata?.preferred_username === SUPER_ADMIN_GITHUB_USERNAME;
  
  if (isSuperAdmin) {
    console.log('🚀 SUPER ADMIN BYPASS - Granting unrestricted access');
    return <>{children}</>;
  }

  if (!profile) {
    // Redirect to auth page with return url for non-super admins
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Inactive</h2>
          <p className="text-gray-600">Your account has been deactivated. Contact your administrator.</p>
        </div>
      </div>
    );
  }

  if (requireRole) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
    
    // Super admin has access to everything
    if (profile.user_type === 'super_admin') {
      return <>{children}</>;
    }
    
    // Check specific roles
    if (!roles.includes(profile.user_type)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
