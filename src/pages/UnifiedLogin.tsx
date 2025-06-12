import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Shield, Loader2, Github, Eye, EyeOff, LogIn } from 'lucide-react';
import { CardSpotlight } from '@/components/ui/CardSpotlight';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

const SUPER_ADMIN_IDENTIFIERS = {
  emails: [import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@mintid.live'],
  usernames: [import.meta.env.VITE_SUPER_ADMIN_GITHUB_USERNAME || 'mintid-admin', 'admin']
};

const UnifiedLogin = () => {
  const [formData, setFormData] = useState({ credential: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRedirected, setHasRedirected] = useState(false);
  
  const { user, profile, signIn, signInWithGitHub } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're using local Supabase instance
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
  const isLocalSupabase = SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('localhost');

  const isSuperAdmin = useCallback((userData: { email?: string; user_metadata?: { user_name?: string; preferred_username?: string } }) => {
    return SUPER_ADMIN_IDENTIFIERS.emails.includes(userData?.email) ||
           SUPER_ADMIN_IDENTIFIERS.usernames.includes(userData?.user_metadata?.user_name) ||
           SUPER_ADMIN_IDENTIFIERS.usernames.includes(userData?.user_metadata?.preferred_username);
  }, []);

  const getRoleRoute = (userType: string) => {
    const routes: Record<string, string> = {
      'super_admin': '/super-admin',
      'org_admin': '/org-admin',
      'manager': '/manager',
      'employee': '/employee'
    };
    return routes[userType] || '/';
  };

  // Single effect for authentication routing - only redirect during initial login
  useEffect(() => {
    if (hasRedirected) return;
    
    // Check if we should prevent redirects due to admin operations
    const preventRedirect = sessionStorage.getItem('preventAuthRedirect');
    if (preventRedirect) {
      console.log('🚫 Preventing auth redirect due to admin operation in progress');
      return;
    }
    
    // Don't redirect if user is already on a dashboard page or performing admin operations
    const currentPath = location.pathname;
    const dashboardPaths = ['/super-admin', '/org-admin', '/manager', '/employee'];
    const isOnDashboard = dashboardPaths.some(path => currentPath.startsWith(path));
    
    // Also check for login-related paths that should trigger redirects
    const loginPaths = ['/', '/login', '/auth'];
    const isOnLoginPage = loginPaths.includes(currentPath);
    
    if (isOnDashboard) {
      console.log('⚠️ User already on dashboard, skipping redirect to prevent loop');
      return;
    }
    
    // Only redirect if user is on a login page and has valid authentication
    if (user && isOnLoginPage) {
      if (isSuperAdmin(user)) {
        console.log('🚀 Super admin detected, redirecting from login page');
        setHasRedirected(true);
        navigate('/super-admin');
        return;
      }

      if (profile) {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
        const destination = from || getRoleRoute(profile.user_type);
        
        console.log('🔄 Routing authenticated user to:', destination);
        setHasRedirected(true);
        navigate(destination);
      }
    }
  }, [user, profile, navigate, location, isSuperAdmin, hasRedirected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.credential.trim() || !formData.password.trim()) {
      setError('Please enter both credential and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if credential looks like an email or username
      const isEmail = formData.credential.includes('@');
      const credential = formData.credential.trim();
      
      // For email login (admin/GitHub users) or username login (employees/managers)
      const result = await signIn(credential, formData.password);
      
      if (result.success) {
        toast({
          title: "✅ Welcome to MinaTid!",
          description: "Redirecting to your dashboard...",
        });
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    if (isLocalSupabase) {
      setError('GitHub OAuth is not available in local development mode. Please use username/password authentication.');
      return;
    }

    setIsGitHubLoading(true);
    setError('');

    try {
      const result = await signInWithGitHub();
      
      if (!result.success) {
        setError(result.error || 'GitHub authentication failed.');
      }
    } catch (error) {
      setError('Unable to connect to GitHub. Please try again.');
    } finally {
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">MinaTid</h1>
          </div>
          <motion.h2
            className="text-2xl font-normal text-gray-200 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Sign In to Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-medium">
              Account
            </span>
          </motion.h2>
          <motion.p 
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Work Schedule Management System
          </motion.p>
        </motion.div>

        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <CardSpotlight className="p-6">
            <div className="space-y-6">
              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="border-red-500/50 bg-red-500/10 text-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* GitHub OAuth Button */}
              {!isLocalSupabase ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 bg-gray-800/50 border-gray-600 text-gray-200 hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300"
                    onClick={handleGitHubSignIn}
                    disabled={isLoading || isGitHubLoading}
                  >
                    {isGitHubLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Connecting to GitHub...
                      </>
                    ) : (
                      <>
                        <Github className="w-5 h-5 mr-3" />
                        Sign in with GitHub
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-800 px-3 text-gray-400">
                        Or continue with credentials
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    🔧 Local Development Mode - GitHub OAuth Disabled
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Use username/password authentication below
                  </p>
                </div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="credential" className="text-gray-200 text-sm font-medium">
                    Email or Username
                  </Label>
                  <Input
                    id="credential"
                    type="text"
                    value={formData.credential}
                    onChange={(e) => setFormData(prev => ({ ...prev, credential: e.target.value }))}
                    placeholder="you@example.com or username"
                    disabled={isLoading || isGitHubLoading}
                    autoComplete="username"
                    className="h-12 bg-gray-800/50 border-gray-600 text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      disabled={isLoading || isGitHubLoading}
                      autoComplete="current-password"
                      className="h-12 bg-gray-800/50 border-gray-600 text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 pr-12 transition-all duration-300"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-200 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={isLoading || isGitHubLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-3" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </div>
          </CardSpotlight>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <CardSpotlight className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-300 mb-1 text-sm">Secure Access</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Use email for GitHub login or username/password provided by your administrator. 
                  Contact support if you need assistance accessing your account.
                </p>
              </div>
            </div>
          </CardSpotlight>
        </motion.div>

        {/* Footer Features */}
        <motion.div
          className="grid grid-cols-3 gap-3 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-lg font-bold text-blue-400">24/7</div>
            <div className="text-xs text-gray-400">Support</div>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="text-lg font-bold text-purple-400">Secure</div>
            <div className="text-xs text-gray-400">Login</div>
          </div>
          <div className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
            <div className="text-lg font-bold text-pink-400">Real-time</div>
            <div className="text-xs text-gray-400">Updates</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnifiedLogin;