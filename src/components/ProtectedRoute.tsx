
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

  console.log('ProtectedRoute: Current state:', {
    loading,
    user: user?.email,
    profile: profile?.user_type,
    requireRole,
    currentPath: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    profileActive: profile?.is_active
  });

  // Show loading while auth state is being determined
  if (loading) {
    console.log('ProtectedRoute: Still loading auth state...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if profile exists
  if (!profile) {
    console.log('ProtectedRoute: User exists but no profile found');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">Your user profile could not be loaded. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Check if account is active
  if (!profile.is_active) {
    console.log('ProtectedRoute: User account is inactive');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Account Inactive</h2>
          <p className="text-muted-foreground">Your account has been deactivated. Contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requireRole) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
    
    console.log('ProtectedRoute: Checking roles', {
      requiredRoles: roles,
      userRole: profile.user_type,
      isSuperAdmin: profile.user_type === 'super_admin'
    });
    
    // Super admin has access to everything
    if (profile.user_type === 'super_admin') {
      console.log('ProtectedRoute: Super admin access granted');
      return <>{children}</>;
    }
    
    // Check specific roles
    if (!roles.includes(profile.user_type)) {
      console.log('ProtectedRoute: Role check failed. Required:', roles, 'User has:', profile.user_type);
      return <Navigate to="/" replace />;
    }
  }

  console.log('ProtectedRoute: Access granted for user type:', profile.user_type);
  return <>{children}</>;
};

export default ProtectedRoute;
