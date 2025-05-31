import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SuperAdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile } = useSupabaseAuth();
  const { toast } = useToast();

  // Redirect if already authenticated and is super admin
  if (user && profile && profile.user_type === 'super_admin') {
    return <Navigate to="/super-admin" replace />;
  }

  // Redirect non-super-admin users to their appropriate login
  if (user && profile && profile.user_type !== 'super_admin') {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "❌ Missing Information",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await signIn(username, password);
      
      if (result.success) {
        toast({
          title: "✅ Super Admin Access Granted",
          description: "Welcome to MinTid Super Admin Console!",
        });
      } else {
        toast({
          title: "❌ Access Denied",
          description: "Invalid super admin credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast({
        title: "❌ Security Error",
        description: "An error occurred during authentication",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Super Administrator Access" 
      subtitle="Secure authentication portal for system administrators"
    >
      {/* Security Warning */}
      <Alert className="mb-6 border-red-200 bg-red-50">
        <Shield className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>High Security Zone:</strong> This portal is restricted to authorized super administrators only. 
          All access attempts are logged and monitored.
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full w-20 h-20 flex items-center justify-center">
            <Crown className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-red-800 text-2xl">
            <Shield className="w-6 h-6" />
            Super Administrator Portal
          </CardTitle>
          <CardDescription className="text-red-700 text-lg">
            Enter your secure credentials to access the MinTid super admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-red-800 font-semibold">Administrator Username</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="bg-white border-red-300 pl-10 focus:border-red-500 focus:ring-red-500"
                  placeholder="Enter administrator username"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password" className="text-red-800 font-semibold">Secure Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  disabled={loading}
                  className="bg-white border-red-300 pl-10 pr-10 focus:border-red-500 focus:ring-red-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg font-semibold py-3" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Shield className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Access Super Admin Console
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-red-200">
            <div className="text-center text-sm text-red-700">
              <p className="font-semibold mb-2">Security Features:</p>
              <ul className="text-xs space-y-1">
                <li>• Multi-layer authentication verification</li>
                <li>• Real-time access monitoring</li>
                <li>• Enhanced encryption protocols</li>
                <li>• Comprehensive audit logging</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default SuperAdminLogin;
