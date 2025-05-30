
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
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function RoleBasedUserManagement() {
  const { profile, createUser } = useSupabaseAuth();
  const { profiles, departments, organizations, refetchProfiles } = useSupabaseData();
  const { toast } = useToast();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    display_name: '',
    password: '',
    user_type: 'employee' as 'employee' | 'manager' | 'org_admin',
    organization_id: '',
    department_id: ''
  });

  // Check if super admin is viewing a specific organization
  const getSuperAdminViewingOrg = () => {
    try {
      const storedContext = sessionStorage.getItem('superAdminViewingOrg');
      return storedContext ? JSON.parse(storedContext) : null;
    } catch (error) {
      console.error('Error parsing super admin context:', error);
      return null;
    }
  };

  const superAdminContext = getSuperAdminViewingOrg();
  const isViewingAsAdmin = profile?.user_type === 'super_admin' && superAdminContext;
  
  // Determine effective user type and organization for permissions
  const effectiveUserType = isViewingAsAdmin ? 'org_admin' : profile?.user_type;
  const effectiveOrgId = isViewingAsAdmin ? superAdminContext.id : profile?.organization_id;

  // Get visible users based on context
  const getVisibleUsers = () => {
    if (profile?.user_type === 'super_admin' && superAdminContext) {
      return profiles.filter(u => u.organization_id === superAdminContext.id);
    } else if (profile?.user_type === 'org_admin' && profile?.organization_id) {
      return profiles.filter(u => u.organization_id === profile.organization_id);
    } else if (profile?.user_type === 'manager' && profile?.department_id) {
      return profiles.filter(u => 
        u.organization_id === profile.organization_id && 
        u.department_id === profile.department_id
      );
    } else if (profile?.user_type === 'employee') {
      return profiles.filter(u => u.id === profile.id);
    }
    return [];
  };

  const visibleUsers = getVisibleUsers();

  // Get departments for the current context
  const getVisibleDepartments = () => {
    if (isViewingAsAdmin) {
      return departments.filter(d => d.organization_id === superAdminContext.id);
    } else if (profile?.organization_id) {
      return departments.filter(d => d.organization_id === profile.organization_id);
    }
    return [];
  };

  const visibleDepartments = getVisibleDepartments();

  const getDepartmentName = (deptId: string) => {
    return departments.find(d => d.id === deptId)?.name || 'None';
  };

  const getOrganizationName = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.name || 'Unknown';
  };

  const canCreateUsers = effectiveUserType === 'super_admin' || effectiveUserType === 'org_admin' || effectiveUserType === 'manager';
  const canEditUsers = effectiveUserType === 'super_admin' || effectiveUserType === 'org_admin' || effectiveUserType === 'manager';
  const canDeleteUsers = effectiveUserType === 'super_admin' || effectiveUserType === 'org_admin';

  const handleCreateUser = async () => {
    if (!newUser.username.trim() || !newUser.display_name.trim() || !newUser.password.trim()) {
      toast({
        title: "❌ Missing Information",
        description: "Username, display name, and password are required",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingUser(true);
    
    const userData = {
      username: newUser.username.trim(),
      display_name: newUser.display_name.trim(),
      password: newUser.password,
      user_type: newUser.user_type,
      organization_id: effectiveOrgId,
      department_id: newUser.department_id || null
    };

    try {
      const result = await createUser(userData);
      
      if (result.success) {
        toast({
          title: "✅ User Created",
          description: `${newUser.display_name} has been created successfully`,
        });
        setShowCreateUser(false);
        setNewUser({
          username: '',
          display_name: '',
          password: '',
          user_type: 'employee',
          organization_id: '',
          department_id: ''
        });
        setTimeout(() => refetchProfiles(), 1000);
      } else {
        toast({
          title: "❌ Creation Failed",
          description: result.error || "Failed to create user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (userData: any) => {
    if (!editingUser) return;

    setIsUpdatingUser(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: userData.username.trim(),
          display_name: userData.display_name.trim(),
          user_type: userData.user_type,
          department_id: userData.department_id || null,
          phone_number: userData.phone_number || null
        })
        .eq('id', editingUser.id);

      if (error) {
        toast({
          title: "❌ Update Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ User Updated",
          description: `${userData.display_name} has been updated`,
        });
        setEditingUser(null);
        refetchProfiles();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      // Try admin deletion first (removes both auth and profile)
      const { error: adminError } = await supabase.auth.admin.deleteUser(userId);

      if (adminError) {
        // Fallback to profile deletion
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (profileError) {
          toast({
            title: "❌ Deletion Failed",
            description: profileError.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "⚠️ Profile Deleted",
            description: `${userName} profile removed (auth account may remain)`,
          });
        }
      } else {
        toast({
          title: "🗑️ User Deleted",
          description: `${userName} has been completely removed`,
        });
      }

      refetchProfiles();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">
              {isViewingAsAdmin ? `${superAdminContext.name} Users` : 'User Management'}
            </h1>
            <p className="text-muted-foreground">
              {isViewingAsAdmin ? `Managing users as Super Admin for ${superAdminContext.name}` : 
               effectiveUserType === 'org_admin' ? 'Manage users in your organization' :
               effectiveUserType === 'manager' ? 'Manage users in your department' : 'View your profile'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <Badge variant={isViewingAsAdmin ? 'destructive' : 'default'}>
            {isViewingAsAdmin ? 'SUPER ADMIN VIEW' : effectiveUserType?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Admin Capabilities Alert */}
      {isViewingAsAdmin && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Super Admin Powers Active:</strong> You can create, edit, and delete users for {superAdminContext.name}. 
            All changes will be attributed to your super admin account.
          </AlertDescription>
        </Alert>
      )}

      {/* Create User Button */}
      {canCreateUsers && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Team Members ({visibleUsers.length})</h3>
          <Button onClick={() => setShowCreateUser(!showCreateUser)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      )}

      {/* Create User Form */}
      {showCreateUser && canCreateUsers && (
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>
              {isViewingAsAdmin ? `Add a new user to ${superAdminContext.name}` : 'Add a new team member'}
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
                <Label htmlFor="display_name">Full Name</Label>
                <Input
                  id="display_name"
                  value={newUser.display_name}
                  onChange={(e) => setNewUser({...newUser, display_name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="user_type">Role</Label>
                <Select 
                  value={newUser.user_type} 
                  onValueChange={(value: 'employee' | 'manager' | 'org_admin') => setNewUser({...newUser, user_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    {(effectiveUserType === 'super_admin' || effectiveUserType === 'org_admin') && (
                      <SelectItem value="org_admin">Organization Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="department">Department (Optional)</Label>
              <Select 
                value={newUser.department_id} 
                onValueChange={(value) => setNewUser({...newUser, department_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Department</SelectItem>
                  {visibleDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCreateUser} disabled={isCreatingUser}>
                {isCreatingUser ? 'Creating...' : 'Create User'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <div className="grid gap-4">
        {visibleUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{user.display_name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">{getDepartmentName(user.department_id)}</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant={
                        user.user_type === 'super_admin' ? 'destructive' :
                        user.user_type === 'org_admin' ? 'default' :
                        user.user_type === 'manager' ? 'secondary' : 'outline'
                      }>
                        {user.user_type.replace('_', ' ')}
                      </Badge>
                      {user.tracking_id && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <Badge variant="outline" className="font-mono text-xs">
                            {user.tracking_id}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={user.is_active ? "default" : "destructive"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                  
                  {canEditUsers && (
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {canDeleteUsers && user.id !== profile.id && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50" 
                      onClick={() => handleDeleteUser(user.id, user.display_name)}
                      disabled={deletingUserId === user.id}
                    >
                      {deletingUserId === user.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit User Dialog */}
      {editingUser && (
        <EditUserDialog 
          user={editingUser}
          isUpdating={isUpdatingUser}
          departments={visibleDepartments}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
        />
      )}

      {/* No users message */}
      {visibleUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Simple Edit User Dialog Component
function EditUserDialog({ user, isUpdating, departments, onClose, onSubmit }: {
  user: any;
  isUpdating: boolean;
  departments: any[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    username: user.username || '',
    display_name: user.display_name || '',
    phone_number: user.phone_number || '',
    user_type: user.user_type || 'employee',
    department_id: user.department_id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit User: {user.display_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-display-name">Display Name</Label>
              <Input
                id="edit-display-name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-user-type">User Type</Label>
              <Select value={formData.user_type} onValueChange={(value) => setFormData({ ...formData, user_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="org_admin">Organization Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-department">Department</Label>
              <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Department</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
