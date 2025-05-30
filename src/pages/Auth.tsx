
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile } = useSupabaseAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (user && profile) {
    switch (profile.user_type) {
      case 'super_admin':
        return <Navigate to="/super-admin" replace />;
      case 'org_admin':
        return <Navigate to="/org-admin" replace />;
      case 'manager':
        return <Navigate to="/manager" replace />;
      case 'employee':
        return <Navigate to="/employee" replace />;
      default:
        return <Navigate to="/" replace />;
    }
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
    const result = await signIn(username, password);
    
    if (result.success) {
      toast({
        title: "✅ Login Successful",
        description: "Welcome back to MinTid!",
      });
    } else {
      toast({
        title: "❌ Login Failed",
        description: result.error || "Invalid username or password",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <AuthLayout 
      title="Sign In to MinTid" 
      subtitle="Access your work schedule management dashboard"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Employee Login
          </CardTitle>
          <CardDescription>
            Enter your assigned username and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your.username"
                disabled={loading}
                autoComplete="username"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-yellow-600" />
            <h4 className="font-medium text-yellow-800">Security Notice</h4>
          </div>
          <p className="text-sm text-yellow-700">
            Your login credentials are provided by your administrator. 
            Contact your manager if you need assistance accessing your account.
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default Auth;
