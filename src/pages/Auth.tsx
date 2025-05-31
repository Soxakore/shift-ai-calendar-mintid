
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Shield, Users, Building2, Loader2 } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, profile, signIn } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && profile) {
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from);
      } else {
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
            navigate('/');
        }
      }
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

  const demoUsers = [
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
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-sm dark:text-white">Demo Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {demoUsers.map((demo) => {
                const IconComponent = demo.icon;
                return (
                  <div
                    key={demo.username}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setUsername(demo.username)}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${demo.color}`} />
                      <span className="text-sm font-medium dark:text-white">{demo.role}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">@{demo.username}</span>
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
