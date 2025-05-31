import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Eye, EyeOff, Calendar, Lock } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmployeeLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile } = useSupabaseAuth();
  const { toast } = useToast();

  // Redirect if already authenticated and is employee
  if (user && profile && profile.user_type === 'employee') {
    return <Navigate to="/employee" replace />;
  }

  // Redirect other user types to general auth
  if (user && profile && profile.user_type !== 'employee') {
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
          title: "✅ Employee Access Granted",
          description: "Welcome to your employee dashboard!",
        });
      } else {
        toast({
          title: "❌ Access Denied",
          description: "Invalid employee credentials",
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
      title="Employee Portal" 
      subtitle="Access your schedule and work information"
    >
      {/* Employee Info */}
      <Alert className="mb-6 border-gray-200 bg-gray-50">
        <User className="h-4 w-4 text-gray-600" />
        <AlertDescription className="text-gray-800">
          <strong>Employee Portal:</strong> Access your schedule, tasks, and personal work information.
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-4 bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-600" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-gray-800 text-2xl">
            <Calendar className="w-6 h-6" />
            Employee Portal
          </CardTitle>
          <CardDescription className="text-gray-700 text-lg">
            Sign in to view your schedule and work information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-gray-800 font-semibold">Employee Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="bg-white border-gray-300 pl-10 focus:border-gray-500 focus:ring-gray-500"
                  placeholder="Enter employee username"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password" className="text-gray-800 font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="bg-white border-gray-300 pl-10 pr-10 focus:border-gray-500 focus:ring-gray-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gray-600 hover:bg-gray-700 text-white shadow-lg font-semibold py-3" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <User className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Access Employee Dashboard
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-700">
              <p className="font-semibold mb-2">Employee Access:</p>
              <ul className="text-xs space-y-1">
                <li>• View your work schedule</li>
                <li>• Clock in and out</li>
                <li>• Access personal information</li>
                <li>• Submit time-off requests</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default EmployeeLogin;
