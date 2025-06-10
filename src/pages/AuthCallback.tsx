import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, profile } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔄 Processing OAuth callback...');
      
      // Wait a moment for auth state to update
      setTimeout(() => {
        if (user) {
          console.log('✅ OAuth authentication successful');
          console.log('👤 User:', user);
          console.log('📋 Profile:', profile);
          
          toast({
            title: "✅ Authentication Successful",
            description: "Welcome to MinTid!",
          });

          // Check if user is super admin
          const isSuperAdmin = user?.email === 'tiktok518@gmail.com' || 
                              user?.user_metadata?.login === 'soxakore' ||
                              user?.user_metadata?.user_name === 'soxakore' ||
                              user?.user_metadata?.preferred_username === 'soxakore';

          if (isSuperAdmin) {
            console.log('🚀 Super admin detected, redirecting to super-admin dashboard');
            navigate('/super-admin', { replace: true });
          } else if (profile) {
            // Redirect based on user role
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
          } else {
            // New user without profile - redirect to setup or default dashboard
            console.log('ℹ️ New user detected, redirecting to profile setup');
            navigate('/profile-setup', { replace: true });
          }
        } else {
          console.log('❌ No user found after OAuth callback');
          toast({
            title: "❌ Authentication Failed",
            description: "Please try signing in again.",
            variant: "destructive"
          });
          navigate('/auth', { replace: true });
        }
      }, 2000); // Wait 2 seconds for auth state to update
    };

    handleAuthCallback();
  }, [user, profile, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <LoadingSpinner text="Completing authentication..." />
        <div className="text-gray-600 dark:text-gray-300">
          <p className="text-lg font-medium">Welcome to MinTid!</p>
          <p className="text-sm">Setting up your account...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
