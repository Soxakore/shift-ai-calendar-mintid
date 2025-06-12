import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Shield, Building, Users, User, ChevronRight, LogOut } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const roles: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    path: '/super-admin',
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-purple-500',
    description: 'Full system access, user management, analytics'
  },
  {
    id: 'org_admin',
    name: 'Organization Admin',
    path: '/org-admin',
    icon: <Building className="w-6 h-6" />,
    color: 'bg-blue-500',
    description: 'Manage organization, departments, employees'
  },
  {
    id: 'manager',
    name: 'Manager',
    path: '/manager',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-green-500',
    description: 'Team management, schedules, reports'
  },
  {
    id: 'employee',
    name: 'Employee',
    path: '/employee',
    icon: <User className="w-6 h-6" />,
    color: 'bg-gray-500',
    description: 'Personal dashboard, clock in/out, schedule'
  }
];

const RoleSelector = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useSupabaseAuth();
  const [isDevMode] = useState(() => import.meta.env.DEV);

  // Auto-redirect if user already has a role
  useEffect(() => {
    if (profile?.role && !isDevMode) {
      const roleData = roles.find(r => r.id === profile.role);
      if (roleData) {
        navigate(roleData.path);
      }
    }
  }, [profile, navigate, isDevMode]);

  const handleRoleSelect = (role: Role) => {
    if (isDevMode) {
      // Dev mode: Quick switch without DB update
      localStorage.setItem('dev-role-override', role.id);
      navigate(role.path);
    } else if (profile?.role === role.id) {
      // Production: Navigate to assigned role
      navigate(role.path);
    }
  };

  const currentRole = profile?.role || localStorage.getItem('dev-role-override');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Select Your Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isDevMode ? 'Development Mode - Test any role' : 'Choose your assigned role to continue'}
            </p>
            {user && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <Badge variant="outline">{user.email}</Badge>
                {currentRole && <Badge>{currentRole.replace('_', ' ').toUpperCase()}</Badge>}
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {roles.map((role) => {
              const isAssigned = profile?.role === role.id;
              const isAccessible = isDevMode || isAssigned;
              
              return (
                <Card 
                  key={role.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    !isAccessible ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => isAccessible && handleRoleSelect(role)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`${role.color} text-white p-3 rounded-lg`}>
                        {role.icon}
                      </div>
                      {isAssigned && <Badge variant="default">Your Role</Badge>}
                      {isDevMode && <Badge variant="secondary">Dev Access</Badge>}
                    </div>
                    <CardTitle className="mt-4">{role.name}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant={isAccessible ? "default" : "secondary"}
                      disabled={!isAccessible}
                    >
                      {isAccessible ? 'Enter Dashboard' : 'No Access'}
                      {isAccessible && <ChevronRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Dev Mode Info */}
          {isDevMode && (
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Dev Mode:</strong> You can access any role for testing. 
                Role selection is stored locally and won't affect your database profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;