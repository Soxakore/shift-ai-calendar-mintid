
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Shield, Users, Building2, Loader2, Github } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, profile, signIn, signInWithGitHub } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    console.log('🔍 Auth check - User:', !!user, 'Profile:', !!profile, 'Profile type:', profile?.user_type);
    console.log('🔍 Full user object:', user);
    console.log('🔍 Full profile object:', profile);
    
    // SUPER ADMIN BYPASS - Check for GitHub super admin users
    const isSuperAdmin = user?.email === 'tiktok518@gmail.com' || 
                        user?.user_metadata?.user_name === 'soxakore' ||
                        user?.user_metadata?.preferred_username === 'soxakore';
    
    if (user && isSuperAdmin) {
      console.log('🚀 SUPER ADMIN DETECTED - Immediate redirect to super-admin dashboard');
      navigate('/super-admin');
      return;
    }
    
    if (user && profile) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      if (from) {
        console.log('🔄 Redirecting to from path:', from);
        navigate(from);
      } else {
        // Redirect based on user role
        console.log('🔄 Redirecting based on role:', profile.user_type);
        switch (profile.user_type) {
          case 'super_admin':
            console.log('🚀 Redirecting super admin to dashboard');
            navigate('/super-admin');
            break;
          case 'org_admin':
            console.log('🏢 Redirecting org admin to dashboard');
            navigate('/org-admin');
            break;
          case 'manager':
            console.log('👥 Redirecting manager to dashboard');
            navigate('/manager');
            break;
          case 'employee':
            navigate('/employee');
            break;
          default:
            console.warn('⚠️ Unknown user type:', profile.user_type);
            navigate('/');
        }
      }
    } else if (user && !profile) {
      console.log('⚠️ User exists but no profile found - this might be a loading state');
    } else {
      console.log('ℹ️ No user authentication detected');
    }
  }, [user, profile, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(username.trim(), password);
      
      if (result.success) {
        toast({
          title: "✅ Login Successful",
          description: "Welcome back!",
        });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true);
    setError('');

    try {
      const result = await signInWithGitHub();
      
      if (result.success) {
        toast({
          title: "✅ GitHub Login Successful",
          description: "Redirecting you to GitHub for authentication...",
        });
      } else {
        setError(result.error || 'GitHub login failed. Please try again.');
      }
    } catch (error) {
      console.error('GitHub login error:', error);
      setError('An unexpected error occurred during GitHub login.');
    } finally {
      setIsGitHubLoading(false);
    }
  };

  const quickLoginUsers = [
    { username: 'tiktok', role: 'Super Admin', icon: Shield, color: 'text-red-500' },
    { username: 'orgadmin', role: 'Organization Admin', icon: Building2, color: 'text-blue-500' },
    { username: 'manager', role: 'Manager', icon: Users, color: 'text-green-500' },
    { username: 'employee', role: 'Employee', icon: Users, color: 'text-gray-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MinTid</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-center dark:text-white">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            {/* GitHub Login - Primary Method */}
            <div className="space-y-4 mb-6">
              <Button
                onClick={handleGitHubSignIn}
                disabled={isGitHubLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center gap-3 py-3"
              >
                {isGitHubLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Github className="w-5 h-5" />
                )}
                {isGitHubLoading ? 'Connecting to GitHub...' : 'Sign in with GitHub'}
              </Button>
              
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Secure authentication with your GitHub account
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with username</span>
              </div>
            </div>

            {/* Legacy Username/Password Login */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="dark:text-gray-200">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign in with Username'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Login */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-sm dark:text-white">Quick Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickLoginUsers.map((user) => {
                const IconComponent = user.icon;
                return (
                  <div
                    key={user.username}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setUsername(user.username)}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${user.color}`} />
                      <span className="text-sm font-medium dark:text-white">{user.role}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Click to select username • Password: password123
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
