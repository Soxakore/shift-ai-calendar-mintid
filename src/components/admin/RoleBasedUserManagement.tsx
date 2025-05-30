import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  UserPlus, 
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  demoUsersWithRoles,
  rolePermissions,
  checkPermission,
  getUIPermissions
} from '../../types/permissions';
import { type EnhancedUser } from '../../types/organization';
import { demoDepartments, demoOrganizations } from '../../types/organization';

interface RoleBasedUserManagementProps {
  currentUser: EnhancedUser; // The logged-in user
}

export default function RoleBasedUserManagement({ currentUser }: RoleBasedUserManagementProps) {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    displayName: '',
    password: '',
    departmentId: currentUser.departmentId, // Default to manager's department
    userType: 'employee' as 'employee' | 'manager'
  });

  // Convert currentUser to have role property for permission functions
  const currentUserWithRole = { ...currentUser, role: currentUser.userType };

  // Get UI permissions for current user
  const uiPermissions = getUIPermissions(currentUserWithRole);
  
  // Filter users based on current user's permissions
  const getVisibleUsers = (): EnhancedUser[] => {
    switch (uiPermissions.dataScope) {
      case 'all':
        return demoUsersWithRoles; // Super admin sees everyone
      case 'organization':
        return demoUsersWithRoles.filter(u => u.organizationId === currentUser.organizationId);
      case 'department':
        return demoUsersWithRoles.filter(u => 
          u.organizationId === currentUser.organizationId && 
          u.departmentId === currentUser.departmentId
        );
      case 'self':
        return demoUsersWithRoles.filter(u => u.id === currentUser.id);
      default:
        return [];
    }
  };

  const visibleUsers = getVisibleUsers();
  
  // Get departments the user can see
  const getVisibleDepartments = () => {
    if (uiPermissions.dataScope === 'all') {
      return demoDepartments;
    } else if (uiPermissions.dataScope === 'organization') {
      return demoDepartments.filter(d => d.organizationId === currentUser.organizationId);
    } else {
      return demoDepartments.filter(d => 
        d.organizationId === currentUser.organizationId && 
        d.id === currentUser.departmentId
      );
    }
  };

  const visibleDepartments = getVisibleDepartments();
  
  const getDepartmentName = (deptId: string) => {
    return demoDepartments.find(d => d.id === deptId)?.name || 'Unknown';
  };

  const getOrganizationName = (orgId: string) => {
    return demoOrganizations.find(o => o.id === orgId)?.name || 'Unknown';
  };

  const handleCreateUser = () => {
    // Check if user has permission to create users
    if (!checkPermission(currentUserWithRole, 'manage_dept_users', 'create')) {
      alert('You do not have permission to create users');
      return;
    }
    
    console.log('Creating user:', newUser);
    console.log('Created by:', currentUser.displayName);
    // In real implementation, this would call an API
    setShowCreateUser(false);
    setNewUser({
      username: '',
      displayName: '',
      password: '',
      departmentId: currentUser.departmentId,
      userType: 'employee'
    });
  };

  return (
    <div className="space-y-6">
      {/* Role-based Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">
              {uiPermissions.dataScope === 'all' && 'All Users Management'}
              {uiPermissions.dataScope === 'organization' && `${getOrganizationName(currentUser.organizationId)} Users`}
              {uiPermissions.dataScope === 'department' && `${getDepartmentName(currentUser.departmentId)} Team`}
              {uiPermissions.dataScope === 'self' && 'My Profile'}
            </h1>
            <p className="text-muted-foreground">
              {currentUser.userType === 'super_admin' && 'Manage all users across all organizations'}
              {currentUser.userType === 'org_admin' && 'Manage users in your organization'}
              {currentUser.userType === 'manager' && 'Manage users in your department only'}
              {currentUser.userType === 'employee' && 'View your profile information'}
            </p>
          </div>
        </div>

        {/* Role indicator */}
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <Badge variant={
            currentUser.userType === 'super_admin' ? 'destructive' :
            currentUser.userType === 'org_admin' ? 'default' :
            currentUser.userType === 'manager' ? 'secondary' : 'outline'
          }>
            {currentUser.userType.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Permission Summary */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Your Permissions:</strong> 
          {uiPermissions.canCreateUsers && ' Create Users ✓'}
          {uiPermissions.canEditUsers && ' Edit Users ✓'}
          {uiPermissions.canDeleteUsers && ' Delete Users ✓'}
          {uiPermissions.canViewReports && ' View Reports ✓'}
          <br />
          <strong>Data Access:</strong> {uiPermissions.dataScope === 'all' ? 'All Organizations' : 
                                       uiPermissions.dataScope === 'organization' ? 'Your Organization Only' :
                                       uiPermissions.dataScope === 'department' ? 'Your Department Only' : 'Your Profile Only'}
        </AlertDescription>
      </Alert>

      {/* Create User Button (only if user has permission) */}
      {uiPermissions.canCreateUsers && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Team Members ({visibleUsers.length})</h3>
          <Button onClick={() => setShowCreateUser(!showCreateUser)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      )}

      {/* Create User Form (Department Manager Version) */}
      {showCreateUser && uiPermissions.canCreateUsers && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Team Member</CardTitle>
            <CardDescription>
              {currentUser.userType === 'manager' 
                ? `Add a new member to ${getDepartmentName(currentUser.departmentId)} department`
                : 'Add a new user'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="john.doe"
                />
              </div>
              <div>
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                  id="displayName"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="userType">Role</Label>
                <Select 
                  value={newUser.userType} 
                  onValueChange={(value: 'employee' | 'manager') => setNewUser({...newUser, userType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    {/* Managers can create other managers only if they're org admin */}
                    {currentUser.userType !== 'manager' && (
                      <SelectItem value="manager">Manager</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department selection (limited based on role) */}
            <div>
              <Label htmlFor="department">Department</Label>
              <Select 
                value={newUser.departmentId} 
                onValueChange={(value) => setNewUser({...newUser, departmentId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {visibleDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                      {currentUser.userType === 'manager' && dept.id === currentUser.departmentId && ' (Your Department)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCreateUser}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List (filtered by permissions) */}
      <div className="grid gap-4">
        {visibleUsers.map((user) => {
          const userWithRole = { ...user, role: user.userType };
          const canEdit = checkPermission(currentUserWithRole, 'manage_dept_users', 'update', userWithRole);
          const canDelete = checkPermission(currentUserWithRole, 'manage_dept_users', 'delete', userWithRole);
          
          return (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {/* Show organization only if super admin */}
                        {uiPermissions.dataScope === 'all' && (
                          <>
                            <Badge variant="outline">{getOrganizationName(user.organizationId)}</Badge>
                            <span className="text-muted-foreground">→</span>
                          </>
                        )}
                        <Badge variant="secondary">{getDepartmentName(user.departmentId)}</Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant={
                          user.userType === 'super_admin' ? 'destructive' :
                          user.userType === 'org_admin' ? 'default' :
                          user.userType === 'manager' ? 'secondary' : 'outline'
                        }>
                          {user.userType.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                    
                    {/* Show created by info if user has permission */}
                    {user.createdBy && user.createdBy !== 'system' && (
                      <Badge variant="outline" className="text-xs">
                        Created by: {user.createdBy}
                      </Badge>
                    )}
                    
                    {/* Action buttons based on permissions */}
                    {canEdit ? (
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canDelete && user.id !== currentUser.id && (
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No users message */}
      {visibleUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found in your scope</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
