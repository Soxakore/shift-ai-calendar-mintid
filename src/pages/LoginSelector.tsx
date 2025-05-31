import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Building2, UserCheck, User, Shield, AlertTriangle } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginSelector = () => {
  const loginOptions = [
    {
      role: 'super_admin',
      title: 'Super Administrator',
      description: 'System-wide administration and management',
      icon: Crown,
      path: '/login/super-admin',
      bgColor: 'bg-red-50 hover:bg-red-100',
      borderColor: 'border-red-200 hover:border-red-300',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      security: 'Maximum Security Required'
    },
    {
      role: 'org_admin',
      title: 'Organization Admin',
      description: 'Manage organization departments and staff',
      icon: Building2,
      path: '/login/org-admin',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200 hover:border-blue-300',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      security: 'Organization Level Access'
    },
    {
      role: 'manager',
      title: 'Department Manager',
      description: 'Manage your team and department operations',
      icon: UserCheck,
      path: '/login/manager',
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200 hover:border-green-300',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      security: 'Department Level Access'
    },
    {
      role: 'employee',
      title: 'Employee',
      description: 'Access your schedule and personal information',
      icon: User,
      path: '/login/employee',
      bgColor: 'bg-gray-50 hover:bg-gray-100',
      borderColor: 'border-gray-200 hover:border-gray-300',
      textColor: 'text-gray-800',
      iconColor: 'text-gray-600',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      security: 'Personal Access Only'
    }
  ];

  return (
    <AuthLayout 
      title="Select Your Role" 
      subtitle="Choose your access level to continue securely"
    >
      <Alert className="mb-6 border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Security Notice:</strong> Each role has its own secure login portal. 
          Select your appropriate access level to ensure proper authentication.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loginOptions.map((option) => {
          const IconComponent = option.icon;
          
          return (
            <Card 
              key={option.role}
              className={`transition-all duration-200 border-2 ${option.bgColor} ${option.borderColor} hover:shadow-lg`}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-3 p-3 bg-white rounded-full w-16 h-16 flex items-center justify-center border-2 ${option.borderColor}`}>
                  <IconComponent className={`w-8 h-8 ${option.iconColor}`} />
                </div>
                <CardTitle className={`text-xl ${option.textColor} flex items-center justify-center gap-2`}>
                  <Shield className="w-5 h-5" />
                  {option.title}
                </CardTitle>
                <CardDescription className={`${option.textColor} opacity-80`}>
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className={`text-sm font-medium ${option.textColor} mb-2`}>
                    Security Level
                  </p>
                  <p className={`text-xs ${option.textColor} opacity-70`}>
                    {option.security}
                  </p>
                </div>
                
                <Link to={option.path} className="block">
                  <Button 
                    className={`w-full ${option.buttonColor} text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all duration-200`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    Access {option.title} Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-4">
              <strong>Need Help?</strong> Contact your administrator if you're unsure about your access level.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  General Login
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  Return Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default LoginSelector;
