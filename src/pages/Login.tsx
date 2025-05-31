
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import LoginForm from '@/components/auth/LoginForm';
import { getRoleBasedDashboard } from '@/utils/roleUtils';

const Login = () => {
  const { user, profile, loading } = useSupabaseAuth();

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  // Redirect if already authenticated
  if (user && profile) {
    const dashboardUrl = getRoleBasedDashboard(profile.user_type);
    return <Navigate to={dashboardUrl} replace />;
  }

  return <LoginForm />;
};

export default Login;
