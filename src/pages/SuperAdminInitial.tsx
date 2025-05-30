
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Eye, EyeOff } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';

const SuperAdminInitial = () => {
  const [username, setUsername] = useState('tiktok');
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
        description: "Welcome to MinTid Super Admin!",
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
      title="Super Admin Login" 
      subtitle="Sign in with your super administrator credentials"
    >
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Crown className="w-5 h-5" />
            Super Administrator Access
          </CardTitle>
          <CardDescription className="text-yellow-700">
            Enter your credentials to access the MinTid super admin dashboard
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
                disabled={loading}
                className="bg-white"
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
                  placeholder="Enter your password"
                  disabled={loading}
                  className="bg-white pr-10"
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

            <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={loading}>
              {loading ? "Signing in..." : "Sign In as Super Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default SuperAdminInitial;
