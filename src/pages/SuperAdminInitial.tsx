
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';

const SuperAdminInitial = () => {
  const [username, setUsername] = useState('tiktok');
  const [password, setPassword] = useState('Hrpr0dect3421!');
  const [confirmPassword, setConfirmPassword] = useState('Hrpr0dect3421!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || password.length < 8) {
      toast({
        title: "❌ Password Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "❌ Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'tiktok518@gmail.com',
        password: password,
        user_metadata: {
          username: username,
          display_name: 'Super Administrator',
          user_type: 'super_admin',
          organization_id: '00000000-0000-0000-0000-000000000000',
          created_by: null
        }
      });

      if (error) {
        toast({
          title: "❌ Creation Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Super Admin Created",
          description: `Super admin account created successfully! You can now sign in with username: ${username}`,
        });
        setCreated(true);
      }
    } catch (error) {
      toast({
        title: "❌ Unexpected Error",
        description: "Failed to create super admin account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AuthLayout 
      title="Create Super Admin Account" 
      subtitle="Set up your initial administrator access to MinTid"
    >
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Crown className="w-5 h-5" />
            Initial Setup Required
          </CardTitle>
          <CardDescription className="text-yellow-700">
            Create your super administrator account to manage the entire MinTid system
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
                  placeholder="Enter secure password (min 8 characters)"
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

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={loading}
                className="bg-white"
              />
            </div>

            <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={loading}>
              {loading ? "Creating Account..." : "Create Super Admin Account"}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Account Details:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Username: {username}</li>
              <li>• Email: tiktok518@gmail.com</li>
              <li>• Password reset email will be sent to: tiktok518@gmail.com</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-red-600" />
            <h4 className="font-medium text-red-800">Security Information</h4>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Account will be created with email: tiktok518@gmail.com</li>
            <li>• Password resets will be sent to this email</li>
            <li>• Keep your credentials secure</li>
            <li>• This account has full system access</li>
          </ul>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default SuperAdminInitial;
