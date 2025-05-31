
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const AuthRedirect = () => {
  const { user, profile, loading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect based on user role
      switch (profile.user_type) {
        case 'super_admin':
          navigate('/super-admin');
          break;
        case 'org_admin':
          navigate('/org-admin');
          break;
        case 'manager':
          navigate('/manager');
          break;
        case 'employee':
          navigate('/employee');
          break;
        default:
          navigate('/auth');
      }
    } else if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  return <LoadingSpinner text="Redirecting..." />;
};

export default AuthRedirect;
