import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useSupabaseAuth();
  const { toast } = useToast();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current || loading) {
      return;
    }

    console.log('🔄 Processing OAuth callback...');

    if (!user) {
      handledRef.current = true;
      console.log('❌ No user found after OAuth callback');
      toast({
        title: "❌ Authentication Failed",
        description: "Please try signing in again.",
        variant: "destructive"
      });
      navigate('/auth', { replace: true });
      return;
    }

    console.log('✅ OAuth authentication successful');
    console.log('👤 User:', user);
    console.log('📋 Profile:', profile);

    toast({
      title: "✅ Authentication Successful",
      description: "Welcome to MinaTid!",
    });

    // Check if user is super admin using production configuration
    const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@mintid.live';
    const SUPER_ADMIN_GITHUB_USERNAME = import.meta.env.VITE_SUPER_ADMIN_GITHUB_USERNAME || 'mintid-admin';
    const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL ||
      user?.user_metadata?.login === SUPER_ADMIN_GITHUB_USERNAME ||
      user?.user_metadata?.user_name === SUPER_ADMIN_GITHUB_USERNAME ||
      user?.user_metadata?.preferred_username === SUPER_ADMIN_GITHUB_USERNAME;

    handledRef.current = true;

    if (isSuperAdmin) {
      console.log('🚀 Super admin detected, redirecting to super-admin dashboard');
      navigate('/super-admin', { replace: true });
      return;
    }

    if (profile) {
      switch (profile.user_type) {
        case 'super_admin':
          navigate('/super-admin', { replace: true });
          break;
        case 'org_admin':
          navigate('/org-admin', { replace: true });
          break;
        case 'manager':
          navigate('/manager', { replace: true });
          break;
        case 'employee':
          navigate('/employee', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
      return;
    }

    console.log('ℹ️ Profile still missing after auth initialization, redirecting to setup');
    navigate('/profile-setup', { replace: true });
  }, [loading, user, profile, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <LoadingSpinner text="Completing authentication..." />
        <div className="text-gray-600 dark:text-gray-300">
          <p className="text-lg font-medium">Welcome to MinaTid!</p>
          <p className="text-sm">Setting up your account...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
