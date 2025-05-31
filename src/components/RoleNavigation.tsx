import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Building2, UserCheck, User, LogIn } from 'lucide-react';

interface RoleNavigationProps {
  currentRole?: string;
  showAllRoles?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'minimal';
}

export const RoleNavigation: React.FC<RoleNavigationProps> = ({
  currentRole,
  showAllRoles = true,
  size = 'md',
  variant = 'default'
}) => {
  const roles = [
    {
      key: 'super_admin',
      title: 'Super Admin',
      description: 'System Administration',
      icon: Crown,
      path: '/login/super-admin',
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    {
      key: 'org_admin', 
      title: 'Organization Admin',
      description: 'Organization Management',
      icon: Building2,
      path: '/login/org-admin',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      key: 'manager',
      title: 'Manager',
      description: 'Department Management', 
      icon: UserCheck,
      path: '/login/manager',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      key: 'employee',
      title: 'Employee',
      description: 'Employee Access',
      icon: User,
      path: '/login/employee',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 hover:bg-gray-100',
      buttonColor: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  const displayRoles = showAllRoles ? roles : roles.filter(role => role.key === currentRole);

  if (variant === 'minimal') {
    return (
      <div className="flex gap-2">
        {displayRoles.map((role) => {
          const IconComponent = role.icon;
          return (
            <Link key={role.key} to={role.path}>
              <Button 
                variant="outline" 
                size={size === 'sm' ? 'sm' : 'default'}
                className={`${role.color} hover:${role.color}`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {role.title}
              </Button>
            </Link>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {displayRoles.map((role) => {
          const IconComponent = role.icon;
          return (
            <Link key={role.key} to={role.path}>
              <Button 
                className={`w-full ${role.buttonColor} text-white`}
                size={size === 'sm' ? 'sm' : 'default'}
              >
                <IconComponent className="w-4 h-4 mr-1" />
                {role.title}
              </Button>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${showAllRoles ? 'md:grid-cols-2 lg:grid-cols-4' : ''} gap-4`}>
      {displayRoles.map((role) => {
        const IconComponent = role.icon;
        
        return (
          <Card key={role.key} className={`${role.bgColor} border-2 transition-all duration-200 hover:shadow-md`}>
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-2 p-2 bg-white rounded-full w-12 h-12 flex items-center justify-center">
                <IconComponent className={`w-6 h-6 ${role.color}`} />
              </div>
              <CardTitle className={`text-lg ${role.color}`}>
                {role.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {role.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link to={role.path}>
                <Button className={`w-full ${role.buttonColor} text-white`}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Access Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RoleNavigation;
