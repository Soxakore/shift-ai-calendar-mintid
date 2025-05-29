import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Building2, 
  Users, 
  UserPlus, 
  Briefcase, 
  Shield,
  ChevronRight,
  Settings,
  Trash2,
  Edit3
} from 'lucide-react';
import { 
  demoOrganizations, 
  demoDepartments, 
  demoRoles, 
  demoUsersEnhanced,
  type Organization,
  type Department,
  type Role,
  type EnhancedUser
} from '../../types/organization';

const OrganizationManagement = () => {
  const [selectedOrg, setSelectedOrg] = useState<string>('1'); // McDonald's by default
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    departmentId: '',
    roleId: ''
  });

  const currentOrg = demoOrganizations.find(org => org.id === selectedOrg);
  const orgDepartments = demoDepartments.filter(dept => dept.organizationId === selectedOrg);
  const orgRoles = demoRoles.filter(role => role.organizationId === selectedOrg);
  const orgUsers = demoUsersEnhanced.filter(user => user.organizationId === selectedOrg);

  const getDepartmentName = (deptId: string) => {
    return demoDepartments.find(d => d.id === deptId)?.name || 'Unknown';
  };

  const getRoleName = (roleId: string) => {
    return demoRoles.find(r => r.id === roleId)?.name || 'Unknown';
  };

  const handleCreateUser = () => {
    console.log('Creating user:', newUser);
    // In real implementation, this would call an API
    setShowCreateUser(false);
    setNewUser({
      username: '',
      displayName: '',
      email: '',
      password: '',
      departmentId: '',
      roleId: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Organization Management</h1>
            <p className="text-muted-foreground">
              Manage organizations, departments, roles, and users
            </p>
          </div>
        </div>
        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Organization" />
          </SelectTrigger>
          <SelectContent>
            {demoOrganizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{org.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Organization Overview */}
      {currentOrg && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Organization</p>
                  <p className="text-2xl font-bold">{currentOrg.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Departments</p>
                  <p className="text-2xl font-bold">{orgDepartments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Roles</p>
                  <p className="text-2xl font-bold">{orgRoles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Users</p>
                  <p className="text-2xl font-bold">{orgUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Users in {currentOrg?.name}</h3>
            <Button onClick={() => setShowCreateUser(!showCreateUser)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Create User Form */}
          {showCreateUser && (
            <Card>
              <CardHeader>
                <CardTitle>Create New User</CardTitle>
                <CardDescription>
                  Add a new user to {currentOrg?.name}
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
                    <Label htmlFor="displayName">Display Name</Label>
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
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="john@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={newUser.departmentId} onValueChange={(value) => setNewUser({...newUser, departmentId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {orgDepartments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.roleId} onValueChange={(value) => setNewUser({...newUser, roleId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {orgRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleCreateUser}>Create User</Button>
                  <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <div className="grid gap-4">
            {orgUsers.map((user) => (
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
                          <Badge variant="secondary">{getDepartmentName(user.departmentId)}</Badge>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline">{getRoleName(user.roleId)}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.isActive ? "default" : "destructive"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Departments</h3>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgDepartments.map((dept) => (
              <Card key={dept.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: dept.color }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {orgUsers.filter(u => u.departmentId === dept.id).length} users
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Roles & Permissions</h3>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>
          
          <div className="space-y-4">
            {orgRoles.map((role) => (
              <Card key={role.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Shield className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold">{role.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Level {role.level} • {getDepartmentName(role.departmentId)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {orgUsers.filter(u => u.roleId === role.id).length} users assigned
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Permissions
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Configure settings for {currentOrg?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxUsers">Maximum Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={currentOrg?.settings.maxUsers}
                  readOnly
                />
              </div>
              
              <div>
                <Label>Enabled Features</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentOrg?.settings.features.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={currentOrg?.adminEmail}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationManagement;
