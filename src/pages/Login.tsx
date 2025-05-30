
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "❌ Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "✅ Login Successful",
          description: "Welcome back to MinTid!",
        });
        navigate('/');
      } else {
        toast({
          title: "❌ Login Failed",
          description: "Invalid email or password. Try demo@company.com / demo123",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "❌ Login Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    const demoCredentials: Record<string, {email: string, password: string}> = {
      employee: { email: 'employee@company.com', password: 'demo123' },
      manager: { email: 'manager@company.com', password: 'demo123' },
      admin: { email: 'admin@company.com', password: 'demo123' },
      super_admin: { email: 'super@company.com', password: 'demo123' }
    };

    const creds = demoCredentials[role];
    setEmail(creds.email);
    setPassword(creds.password);
    
    setLoading(true);
    const success = await login(creds.email, creds.password);
    if (success) {
      toast({
        title: "🎭 Demo Login",
        description: `Logged in as ${role.replace('_', ' ')} demo user`,
      });
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">MinTid</h1>
          </div>
          <p className="text-gray-600">Work Schedule Management</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  disabled={loading}
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

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">🎭 Try Demo Accounts</CardTitle>
            <CardDescription className="text-green-700">
              Click any role below to login instantly and explore the app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('employee')}
                disabled={loading}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                👤 Employee
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('manager')}
                disabled={loading}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                👥 Manager
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                ⚙️ Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('super_admin')}
                disabled={loading}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                👑 Super Admin
              </Button>
            </div>
            <p className="text-xs text-green-600 text-center mt-2">
              Each role shows different features and permissions
            </p>
          </CardContent>
        </Card>

        {/* Login Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Login Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use demo@company.com / demo123 for quick access</li>
              <li>• Each role has different dashboard views</li>
              <li>• All features work in demo mode</li>
              <li>• No registration required for testing</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
