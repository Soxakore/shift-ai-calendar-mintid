import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { getRoleBasedDashboard } from '@/utils/roleUtils';
import { 
  User, 
  Shield, 
  Building, 
  Users, 
  Briefcase,
  Eye,
  EyeOff,
  LogIn
} from 'lucide-react';

// Interface for location state typing
interface LocationState {
  from?: string;
}

const LoginForm = () => {
  const { login, profile, loading } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string>('');

  // Demo accounts for testing different roles
  const demoAccounts = [
    {
      role: 'super_admin',
      email: 'super@mintid.com',
      password: 'demo123',
      name: 'Super Admin',
      description: 'Full system access',
      icon: Shield,
      color: 'bg-red-500'
    },
    {
      role: 'org_admin',
      email: 'orgadmin@demo.com',
      password: 'demo123',
      name: 'Organization Admin',
      description: 'Manage organization',
      icon: Building,
      color: 'bg-blue-500'
    },
    {
      role: 'manager',
      email: 'manager@demo.com',
      password: 'demo123',
      name: 'Manager',
      description: 'Team management',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      role: 'employee',
      email: 'employee@demo.com',
      password: 'demo123',
      name: 'Employee',
      description: 'Personal dashboard',
      icon: Briefcase,
      color: 'bg-purple-500'
    }
  ];

  // Redirect if already logged in
  useEffect(() => {
    if (profile && !loading) {
      const locationState = location.state as LocationState;
      const from = locationState?.from || getRoleBasedDashboard(profile.user_type);
      navigate(from, { replace: true });
    }
  }, [profile, loading, navigate, location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setLoginLoading(true);
    try {
      const result = await login(credentials.email, credentials.password);
      
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to your dashboard..."
        });
        
        // Wait for profile to be loaded and redirect will happen automatically via useEffect
        // Don't redirect here since the auth state change will handle it
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    setCredentials({
      email: account.email,
      password: account.password
    });
    setSelectedDemo(account.role);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MinTid</h1>
          <p className="text-lg text-gray-600">Shift Scheduling & Time Management System</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Regular Login</TabsTrigger>
            <TabsTrigger value="demo">Demo Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center flex items-center gap-2 justify-center">
                  <LogIn className="w-5 h-5" />
                  Login to MinTid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        placeholder="Enter your password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {selectedDemo && (
                    <Alert>
                      <AlertDescription>
                        Demo credentials loaded for {selectedDemo.replace('_', ' ')} role.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Demo Accounts</CardTitle>
                  <p className="text-center text-sm text-gray-600">
                    Select a role to test different dashboards and features
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {demoAccounts.map((account) => {
                      const IconComponent = account.icon;
                      return (
                        <div
                          key={account.role}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedDemo === account.role 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleDemoLogin(account)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${account.color} rounded-full flex items-center justify-center`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{account.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {account.role.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{account.description}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                {account.email}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedDemo && (
                    <div className="space-y-4">
                      <Alert>
                        <User className="w-4 h-4" />
                        <AlertDescription>
                          Selected: {demoAccounts.find(a => a.role === selectedDemo)?.name} - 
                          Click "Login with Demo Account" to proceed
                        </AlertDescription>
                      </Alert>
                      
                      <Button 
                        onClick={handleLogin}
                        className="w-full"
                        disabled={loginLoading}
                      >
                        {loginLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Logging in...
                          </>
                        ) : (
                          'Login with Demo Account'
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Each role provides access to different features:
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>• Super Admin: All system controls</div>
                  <div>• Org Admin: Organization management</div>
                  <div>• Manager: Team & schedule management</div>
                  <div>• Employee: Personal schedule & time tracking</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginForm;
