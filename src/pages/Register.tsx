
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show message that registration is disabled
    toast({
      title: "❌ Registration Disabled",
      description: "User accounts can only be created by administrators. Please contact your admin for access.",
      variant: "destructive"
    });
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 sm:space-y-6">
        {/* Logo - Mobile Responsive */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Calendar className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-green-600`} />
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>MinaTid</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">Join Work Schedule Management</p>
        </div>

        {/* Registration Disabled Notice */}
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>Registration is disabled.</strong> All user accounts are created and managed by administrators only. 
            Contact your organisation's admin to get access credentials.
          </AlertDescription>
        </Alert>

        {/* Registration Form - Disabled */}
        <Card className="opacity-75">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-500">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Account (Disabled)
            </CardTitle>
            <CardDescription className="text-sm">
              User registration is handled by administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm text-gray-500">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="John Doe"
                  disabled={true}
                  className="mt-1 bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm text-gray-500">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="john.doe@company.com"
                  disabled={true}
                  className="mt-1 bg-gray-100"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm text-gray-500">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="••••••••"
                    disabled={true}
                    className="pr-10 bg-gray-100"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={true}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm text-gray-500">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  disabled={true}
                  className="mt-1 bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-sm text-gray-500">Role</Label>
                <Select value={formData.role} onValueChange={(value) => updateFormData('role', value)} disabled={true}>
                  <SelectTrigger className="mt-1 bg-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gray-400" 
                disabled={true}
                size={isMobile ? "default" : "lg"}
              >
                Registration Disabled
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Have login credentials?{' '}
                <Link to="/auth" className="text-green-600 hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Contact Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">
              🔐 Need Access?
            </h4>
            <p className="text-xs sm:text-sm text-blue-700 mb-3">
              Contact your organisation administrator to receive your login credentials.
            </p>
            <Link to="/auth">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Go to Login Page
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
