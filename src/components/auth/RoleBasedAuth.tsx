import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { getRoleBasedDashboard } from '@/utils/roleUtils';
import { Loader2 } from 'lucide-react';

interface RoleBasedAuthProps {
  children: React.ReactNode;
  allowedRoles?: ('super_admin' | 'org_admin' | 'manager' | 'employee')[];
  redirectTo?: string;
}

const RoleBasedAuth: React.FC<RoleBasedAuthProps> = ({ 
  children, 
  allowedRoles = [], 
  redirectTo 
}) => {
  const { profile, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // If no user is logged in, redirect to login
    if (!profile) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // If user doesn't have required role, redirect to their dashboard
    if (allowedRoles.length > 0 && !allowedRoles.includes(profile.user_type)) {
      const userDashboard = getRoleBasedDashboard(profile.user_type);
      navigate(userDashboard, { replace: true });
      return;
    }

    // If redirectTo is specified, redirect there
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [profile, loading, navigate, location.pathname, allowedRoles, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null; // Will redirect to login
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.user_type)) {
    return null; // Will redirect to appropriate dashboard
  }

  return <>{children}</>;
};

export default RoleBasedAuth;
