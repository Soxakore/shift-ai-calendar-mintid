
import React, { useState, useEffect } from 'react';
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
  Crown,
  Building,
  Trash2,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminUserManagement() {
  const { profile, createUser } = useSupabaseAuth();
  const { organizations, departments, profiles, loading, refetch } = useSupabaseData();
  const { toast } = useToast();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    display_name: '',
    user_type: 'org_admin' as 'org_admin' | 'manager' | 'employee',
    organization_id: '',
    department_id: ''
  });
  const [newOrg, setNewOrg] = useState({
    name: '',
    description: ''
  });

  const handleCreateOrganization = async () => {
    if (!newOrg.name) {
      toast({
        title: "❌ Missing Information",
        description: "Organization name is required",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from('organizations')
      .insert([{
        name: newOrg.name,
        description: newOrg.description
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "❌ Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "✅ Organization Created",
        description: `${newOrg.name} has been created successfully`,
      });
      setNewOrg({ name: '', description: '' });
      setShowCreateOrg(false);
      refetch();
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.display_name) {
      toast({
        title: "❌ Missing Information",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    const result = await createUser(newUser);
    
    if (result.success) {
      toast({
        title: "✅ User Created",
        description: `${newUser.display_name} has been created successfully`,
      });
      setNewUser({
        username: '',
        password: '',
        display_name: '',
        user_type: 'org_admin',
        organization_id: '',
        department_id: ''
      });
      setShowCreateUser(false);
      refetch();
    } else {
      toast({
        title: "❌ Creation Failed",
        description: result.error || "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const getUserOrganization = (orgId: string) => {
    return organizations.find(org => org.id === orgId)?.name || 'Unknown';
  };

  const getUserDepartment = (deptId: string) => {
    return departments.find(dept => dept.id === deptId)?.name || 'None';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading system data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Crown className="h-8 w-8 text-yellow-600" />
          <div>
            <h1 className="text-2xl font-bold">Super Admin Management</h1>
            <p className="text-muted-foreground">
              Full system control - Organizations: {organizations.length}, Users: {profiles.length}
            </p>
          </div>
        </div>
        <Badge variant="destructive" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          SUPER ADMIN
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={() => setShowCreateOrg(!showCreateOrg)}
          className="h-16 text-left justify-start"
          variant="outline"
        >
          <Building className="h-6 w-6 mr-3" />
          <div>
            <div className="font-semibold">Create Organization</div>
            <div className="text-sm text-muted-foreground">Add new company/business</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => setShowCreateUser(!showCreateUser)}
          className="h-16 text-left justify-start"
          variant="outline"
        >
          <UserPlus className="h-6 w-6 mr-3" />
          <div>
            <div className="font-semibold">Create Admin User</div>
            <div className="text-sm text-muted-foreground">Add organization admin</div>
          </div>
        </Button>
      </div>

      {/* Create Organization Form */}
      {showCreateOrg && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Organization</CardTitle>
            <CardDescription>
              Add a new company or business to the MinTid system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={newOrg.name}
                onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
                placeholder="Company Name Inc."
              />
            </div>
            
            <div>
              <Label htmlFor="orgDescription">Description (Optional)</Label>
              <Input
                id="orgDescription"
                value={newOrg.description}
                onChange={(e) => setNewOrg({...newOrg, description: e.target.value})}
                placeholder="Brief description of the organization"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCreateOrganization}>
                <Building className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
              <Button variant="outline" onClick={() => setShowCreateOrg(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create User Form */}
      {showCreateUser && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>
              Create a new user account with assigned role and organization
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
                  placeholder="john.admin"
                />
              </div>
              <div>
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                  id="displayName"
                  value={newUser.display_name}
                  onChange={(e) => setNewUser({...newUser, display_name: e.target.value})}
                  placeholder="John Administrator"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Secure password"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userType">Role</Label>
                <Select 
                  value={newUser.user_type} 
                  onValueChange={(value: 'org_admin' | 'manager' | 'employee') => 
                    setNewUser({...newUser, user_type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org_admin">Organization Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Select 
                  value={newUser.organization_id} 
                  onValueChange={(value) => setNewUser({...newUser, organization_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations ({organizations.length})</CardTitle>
          <CardDescription>
            All organizations in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {organizations.map((org) => {
              const orgUsers = profiles.filter(p => p.organization_id === org.id);
              const orgDepts = departments.filter(d => d.organization_id === org.id);
              
              return (
                <div key={org.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{org.name}</h3>
                      <p className="text-sm text-muted-foreground">{org.description}</p>
                      <div className="flex gap-4 mt-2">
                        <Badge variant="outline">{orgUsers.length} users</Badge>
                        <Badge variant="outline">{orgDepts.length} departments</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All System Users ({profiles.length})</CardTitle>
          <CardDescription>
            Complete user management across all organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {profiles.map((user) => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{user.display_name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{getUserOrganization(user.organization_id!)}</Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant={
                          user.user_type === 'super_admin' ? 'destructive' :
                          user.user_type === 'org_admin' ? 'default' :
                          user.user_type === 'manager' ? 'secondary' : 'outline'
                        }>
                          {user.user_type.replace('_', ' ')}
                        </Badge>
                        <Badge variant={user.is_active ? "default" : "destructive"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
