import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Eye, EyeOff, Users, Lock } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OrgAdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile } = useSupabaseAuth();
  const { toast } = useToast();

  // Redirect if already authenticated and is org admin
  if (user && profile && profile.user_type === 'org_admin') {
    return <Navigate to="/org-admin" replace />;
  }

  // Redirect other user types to general auth
  if (user && profile && profile.user_type !== 'org_admin') {
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
          title: "✅ Organization Access Granted",
          description: "Welcome to your organization dashboard!",
        });
      } else {
        toast({
          title: "❌ Access Denied",
          description: "Invalid organization admin credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast({
        title: "❌ Authentication Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Organization Administrator" 
      subtitle="Secure access for organization management"
    >
      {/* Organization Info */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Building2 className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Organization Portal:</strong> Manage your organization's departments, users, and operations.
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-blue-800 text-2xl">
            <Users className="w-6 h-6" />
            Organization Admin Portal
          </CardTitle>
          <CardDescription className="text-blue-700 text-lg">
            Sign in to manage your organization's workforce and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-blue-800 font-semibold">Organization Username</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="bg-white border-blue-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter organization username"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password" className="text-blue-800 font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="bg-white border-blue-300 pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-semibold py-3" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Building2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Access Organization Dashboard
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-blue-200">
            <div className="text-center text-sm text-blue-700">
              <p className="font-semibold mb-2">Organization Management:</p>
              <ul className="text-xs space-y-1">
                <li>• Manage all departments and staff</li>
                <li>• Create and assign manager roles</li>
                <li>• Monitor organization performance</li>
                <li>• Configure operational settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default OrgAdminLogin;
