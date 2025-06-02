
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Shield, 
  Users, 
  Building2, 
  Eye,
  Crown,
  UserCheck,
  User
} from 'lucide-react';
import RoleBasedUserManagement from './RoleBasedUserManagement';
import { demoUsersWithRoles } from '../../types/permissions';
import { type EnhancedUser } from '../../types/organization';

export default function RoleBasedDemo() {
  const [selectedUser, setSelectedUser] = useState<EnhancedUser>(demoUsersWithRoles[0]); // Default to super admin

  const userTypes = [
    {
      user: demoUsersWithRoles.find(u => u.userType === 'super_admin')!,
      icon: Crown,
      color: 'destructive',
      description: 'You - Full system access'
    },
    {
      user: demoUsersWithRoles.find(u => u.userType === 'org_admin')!,
      icon: Building2,
      color: 'default',
      description: 'Can manage entire organization'
    },
    {
      user: demoUsersWithRoles.find(u => u.userType === 'manager' && u.organizationId === '1')!,
      icon: UserCheck,
      color: 'secondary',
      description: 'Can only manage their department'
    },
    {
      user: demoUsersWithRoles.find(u => u.userType === 'employee')!,
      icon: User,
      color: 'outline',
      description: 'Can only view their own data'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🔐 Role-Based Access Control Demo</h1>
        <p className="text-muted-foreground">
          See how different user roles see different interfaces and have different permissions
        </p>
      </div>

      {/* User Role Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Switch User Role to Test Different Permissions
          </CardTitle>
          <CardDescription>
            Click on different user types to see how their interface changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userTypes.map(({ user, icon: Icon, color, description }) => (
              <Card 
                key={user.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedUser.id === user.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">{user.displayName}</h3>
                  <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>
                  <Badge variant={color as "default" | "secondary" | "destructive" | "outline"} className="mb-2">
                    {user.userType.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current User Context */}
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          <strong>Currently viewing as:</strong> {selectedUser.displayName} ({selectedUser.userType.replace('_', ' ')})
          <br />
          <strong>Organization:</strong> {selectedUser.organizationId === 'system' ? 'System Admin' : 
                                         selectedUser.organizationId === '1' ? 'McDonald\'s' : 'Starbucks'}
          {selectedUser.userType !== 'super_admin' && (
            <>
              <br />
              <strong>Department:</strong> {selectedUser.departmentId === '1' ? 'Kitchen' : 
                                           selectedUser.departmentId === '3' ? 'Management' : 
                                           selectedUser.departmentId === '4' ? 'Baristas' : 'Admin'}
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Role-Based Interface */}
      <Card>
        <CardHeader>
          <CardTitle>User Management Interface for {selectedUser.displayName}</CardTitle>
          <CardDescription>
            This is what {selectedUser.displayName} sees when they access the user management section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleBasedUserManagement />
        </CardContent>
      </Card>

      {/* Permission Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Permission Differences Explained</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-red-500" />
                Super Admin (You)
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ See ALL organizations (McDonald's, Starbucks, etc.)</li>
                <li>✅ Manage any user in any organization</li>
                <li>✅ Create organization admins</li>
                <li>✅ Access all reports and settings</li>
                <li>✅ Complete system control</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                Organization Admin
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ See only their organization (McDonald's)</li>
                <li>✅ Manage all departments in their org</li>
                <li>✅ Create department managers</li>
                <li>❌ Cannot see other organizations</li>
                <li>❌ Cannot access system settings</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                Department Manager
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ See only their department (Kitchen)</li>
                <li>✅ Create/manage employees in their dept</li>
                <li>✅ Assign usernames and passwords to team</li>
                <li>❌ Cannot see other departments</li>
                <li>❌ Cannot create managers</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                Employee
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ See only their own profile</li>
                <li>✅ View their tasks and schedule</li>
                <li>❌ Cannot see other employees</li>
                <li>❌ Cannot create users</li>
                <li>❌ No management features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
