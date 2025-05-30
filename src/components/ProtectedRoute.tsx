
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: string | string[];
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, profile, loading } = useSupabaseAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Loading:', loading, 'User:', user?.email, 'Profile:', profile?.user_type);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  if (!user || !profile) {
    console.log('No user or profile, redirecting to auth');
    // Redirect to auth page with return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Account Inactive</h2>
          <p className="text-muted-foreground">Your account has been deactivated. Contact your administrator.</p>
        </div>
      </div>
    );
  }

  if (requireRole) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
    
    // Super admin has access to everything
    if (profile.user_type === 'super_admin') {
      console.log('Super admin access granted');
      return <>{children}</>;
    }
    
    // Check specific roles
    if (!roles.includes(profile.user_type)) {
      console.log('Role check failed. Required:', roles, 'User has:', profile.user_type);
      return <Navigate to="/" replace />;
    }
  }

  console.log('Access granted for user type:', profile.user_type);
  return <>{children}</>;
};

export default ProtectedRoute;
