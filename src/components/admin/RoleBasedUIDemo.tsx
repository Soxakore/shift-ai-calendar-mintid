import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Building2, Utensils, Coffee, Briefcase } from 'lucide-react';
import RoleBasedUserManagement from './RoleBasedUserManagement';

// Mock users demonstrating different role views
const mockUsers = [
  {
    id: 'super-admin-001',
    name: 'Super Administrator',
    username: 'super.admin',
    role: 'super_admin' as const,
    organizationId: 'all',
    permissions: {
      canViewAllOrganizations: true,
      canViewAllUsers: true,
      canManageAllUsers: true,
      canCreateOrganizations: true,
      scope: 'all_organizations' as const
    }
  },
  {
    id: 'mc-admin-001',
    name: 'McDonald\'s Administrator',
    username: 'mc.admin',
    role: 'org_admin' as const,
    organizationId: 'mcdonalds',
    permissions: {
      canViewAllOrganizations: false,
      canViewAllUsers: false,
      canManageAllUsers: false,
      canCreateOrganizations: false,
      scope: 'own_organization' as const
    }
  },
  {
    id: 'kitchen-mgr-001',
    name: 'Kitchen Manager',
    username: 'kitchen.manager',
    role: 'manager' as const,
    organizationId: 'mcdonalds',
    departmentId: 'kitchen',
    permissions: {
      canViewAllOrganizations: false,
      canViewAllUsers: false,
      canManageAllUsers: false,
      canCreateOrganizations: false,
      scope: 'own_department' as const
    }
  },
  {
    id: 'employee-001',
    name: 'Mary Cook',
    username: 'mary.cook',
    role: 'employee' as const,
    organizationId: 'mcdonalds',
    departmentId: 'kitchen',
    permissions: {
      canViewAllOrganizations: false,
      canViewAllUsers: false,
      canManageAllUsers: false,
      canCreateOrganizations: false,
      scope: 'own_profile' as const
    }
  }
];

const RoleBasedUIDemo = () => {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Shield className="w-5 h-5 text-red-500" />;
      case 'org_admin': return <Building2 className="w-5 h-5 text-blue-500" />;
      case 'manager': return <Briefcase className="w-5 h-5 text-green-500" />;
      case 'employee': return <Users className="w-5 h-5 text-gray-500" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500 text-white';
      case 'org_admin': return 'bg-blue-500 text-white';
      case 'manager': return 'bg-green-500 text-white';
      case 'employee': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDepartmentIcon = (departmentId?: string) => {
    switch (departmentId) {
      case 'kitchen': return <Utensils className="w-4 h-4" />;
      case 'front-counter': return <Coffee className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Login as Different Roles
          </CardTitle>
          <p className="text-sm text-gray-600">
            Click on any user below to see exactly what their interface would look like when they log in
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockUsers.map((user) => (
              <Card 
                key={user.id} 
                className={`cursor-pointer transition-all ${selectedUser.id === user.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(user.role)}
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {user.departmentId && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          {getDepartmentIcon(user.departmentId)}
                          {user.departmentId.replace('-', ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current User View */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getRoleIcon(selectedUser.role)}
              What {selectedUser.name} Sees When They Log In
            </CardTitle>
            <Badge className={getRoleBadgeColor(selectedUser.role)}>
              {selectedUser.role.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            This is the exact interface that would appear when <strong>{selectedUser.username}</strong> logs in
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <RoleBasedUserManagement currentUser={selectedUser} />
        </CardContent>
      </Card>

      {/* How Credentials Work */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">🔐 How the Login System Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-green-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">1. You Create Accounts</h4>
              <p>• Go to the "Accounts" tab in the admin panel</p>
              <p>• Create usernames and passwords for your managers/staff</p>
              <p>• Assign their specific roles and departments</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. They Log In</h4>
              <p>• Give them their username and password</p>
              <p>• They go to <code className="bg-white px-1 rounded">yoursite.com/worker-login</code></p>
              <p>• The system automatically shows their role-based interface</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Automatic Role Detection</h4>
              <p>• Kitchen managers only see kitchen staff</p>
              <p>• Front counter managers only see front counter staff</p>
              <p>• Employees only see their own profile</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4. Persistent Storage</h4>
              <p>• All accounts are saved automatically</p>
              <p>• The system remembers every username/password</p>
              <p>• Works across browser sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Credentials */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">📋 Ready-to-Use Test Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {mockUsers.map((user, index) => (
              <div key={user.id} className="bg-white p-4 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  {getRoleIcon(user.role)}
                  <strong>{user.name}</strong>
                  <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                    {user.role.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div><span className="text-gray-600">Username:</span> <code className="bg-gray-100 px-1 rounded">{user.username}</code></div>
                  <div><span className="text-gray-600">Password:</span> <code className="bg-gray-100 px-1 rounded">
                    {user.username === 'super.admin' ? 'admin123' :
                     user.username === 'mc.admin' ? 'mcadmin123' :
                     user.username === 'kitchen.manager' ? 'kitchen123' : 'mary123'}
                  </code></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleBasedUIDemo;
