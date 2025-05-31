import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Eye, EyeOff, Users, Lock } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ManagerLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile } = useSupabaseAuth();
  const { toast } = useToast();

  // Redirect if already authenticated and is manager
  if (user && profile && profile.user_type === 'manager') {
    return <Navigate to="/manager" replace />;
  }

  // Redirect other user types to general auth
  if (user && profile && profile.user_type !== 'manager') {
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
          title: "✅ Manager Access Granted",
          description: "Welcome to your department dashboard!",
        });
      } else {
        toast({
          title: "❌ Access Denied",
          description: "Invalid manager credentials",
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
      title="Department Manager" 
      subtitle="Team management and operations portal"
    >
      {/* Manager Info */}
      <Alert className="mb-6 border-green-200 bg-green-50">
        <UserCheck className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Department Portal:</strong> Manage your team, schedules, and department operations.
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center">
            <UserCheck className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-green-800 text-2xl">
            <Users className="w-6 h-6" />
            Manager Portal
          </CardTitle>
          <CardDescription className="text-green-700 text-lg">
            Sign in to manage your team and department operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-green-800 font-semibold">Manager Username</Label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="bg-white border-green-300 pl-10 focus:border-green-500 focus:ring-green-500"
                  placeholder="Enter manager username"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password" className="text-green-800 font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="bg-white border-green-300 pl-10 pr-10 focus:border-green-500 focus:ring-green-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg font-semibold py-3" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <UserCheck className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Access Manager Dashboard
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-green-200">
            <div className="text-center text-sm text-green-700">
              <p className="font-semibold mb-2">Team Management:</p>
              <ul className="text-xs space-y-1">
                <li>• Manage department staff and schedules</li>
                <li>• Create employee accounts</li>
                <li>• Monitor team performance</li>
                <li>• Handle shift assignments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default ManagerLogin;
