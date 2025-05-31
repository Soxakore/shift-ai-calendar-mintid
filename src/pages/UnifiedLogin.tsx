
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, LogIn, Shield, Users, UserCheck, Crown } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ThemeToggle } from '@/components/ThemeToggle';

const UnifiedLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('employee');
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
    console.log(`Login attempt for ${activeTab}:`, username);
    
    const result = await signIn(username, password);
    
    if (result.success) {
      toast({
        title: "✅ Login Successful",
        description: `Welcome back to MinTid!`,
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

  const getTabIcon = (tabType: string) => {
    switch (tabType) {
      case 'employee':
        return <Users className="w-4 h-4" />;
      case 'manager':
        return <UserCheck className="w-4 h-4" />;
      case 'org_admin':
        return <Shield className="w-4 h-4" />;
      case 'super_admin':
        return <Crown className="w-4 h-4" />;
      default:
        return <LogIn className="w-4 h-4" />;
    }
  };

  const getTabTitle = (tabType: string) => {
    switch (tabType) {
      case 'employee':
        return 'Employee Login';
      case 'manager':
        return 'Manager Login';
      case 'org_admin':
        return 'Organization Admin';
      case 'super_admin':
        return 'Super Administrator';
      default:
        return 'Login';
    }
  };

  const getTabDescription = (tabType: string) => {
    switch (tabType) {
      case 'employee':
        return 'Access your work schedule and time tracking';
      case 'manager':
        return 'Manage your team and department schedules';
      case 'org_admin':
        return 'Administer your organization settings';
      case 'super_admin':
        return 'System-wide administration access';
      default:
        return 'Enter your credentials';
    }
  };

  const getCardClasses = (tabType: string) => {
    switch (tabType) {
      case 'employee':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800';
      case 'manager':
        return 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800';
      case 'org_admin':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800';
      case 'super_admin':
        return 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-4">
              <LogIn className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">MinTid</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Work Schedule Management System</p>
          </div>
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
        </div>

        {/* Role-based Login Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="employee" className="flex items-center gap-1 text-xs">
              <Users className="w-3 h-3" />
              Employee
            </TabsTrigger>
            <TabsTrigger value="manager" className="flex items-center gap-1 text-xs">
              <UserCheck className="w-3 h-3" />
              Manager
            </TabsTrigger>
            <TabsTrigger value="org_admin" className="flex items-center gap-1 text-xs">
              <Shield className="w-3 h-3" />
              Org Admin
            </TabsTrigger>
            <TabsTrigger value="super_admin" className="flex items-center gap-1 text-xs">
              <Crown className="w-3 h-3" />
              Super Admin
            </TabsTrigger>
          </TabsList>

          {['employee', 'manager', 'org_admin', 'super_admin'].map((tabType) => (
            <TabsContent key={tabType} value={tabType}>
              <Card className={getCardClasses(tabType)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTabIcon(tabType)}
                    {getTabTitle(tabType)}
                  </CardTitle>
                  <CardDescription>
                    {getTabDescription(tabType)}
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
                        placeholder={tabType === 'super_admin' ? 'tiktok' : 'your.username'}
                        disabled={loading}
                        autoComplete="username"
                        className="bg-white dark:bg-slate-800"
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
                          className="bg-white dark:bg-slate-800 pr-10"
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

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : `Sign In as ${getTabTitle(tabType).split(' ')[0]}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Security Notice */}
        <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Security Notice</h4>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {activeTab === 'super_admin' 
                ? 'Super admin access requires special credentials. Contact system administrator if needed.'
                : 'Your login credentials are provided by your administrator. Contact your manager if you need assistance.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedLogin;
