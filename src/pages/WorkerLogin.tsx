import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Calendar, Shield } from 'lucide-react';

const WorkerLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { workerLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await workerLogin(username, password);
      
      if (success) {
        navigate('/');
      } else {
        setError('Invalid username or password. Please contact your administrator.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-end mb-4">
            <Link to="/admin/login" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <Shield className="h-4 w-4" />
              <span>Admin Login</span>
            </Link>
          </div>
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-blue-600 mr-2" />
            <CardTitle className="text-2xl font-bold">MinTid</CardTitle>
          </div>
          <p className="text-center text-gray-600">
            Sign in to your work schedule
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have credentials?{' '}
              <span className="text-gray-800">Contact your administrator</span>
            </p>
            
            {/* Demo credentials for testing */}
            <details className="mt-4 p-3 bg-blue-50 rounded text-xs">
              <summary className="cursor-pointer text-blue-700 font-medium">🧪 Demo Credentials (Click to expand)</summary>
              <div className="mt-2 space-y-1 text-left">
                <p><strong>Kitchen Manager:</strong> username: <code>kitchen.manager</code> password: <code>kitchen123</code></p>
                <p><strong>Employee:</strong> username: <code>mary.cook</code> password: <code>mary123</code></p>
                <p><strong>Org Admin:</strong> username: <code>mc.admin</code> password: <code>mcadmin123</code></p>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerLogin;
