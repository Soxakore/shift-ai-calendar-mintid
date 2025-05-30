import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Users, 
  UserPlus, 
  Shield,
  Crown,
  Building,
  Eye,
  CheckCircle,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Mail,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminUserManagement() {
  const { profile } = useSupabaseAuth();
  const { organizations, departments, profiles, loading, refetch, refetchOrganizations, refetchProfiles } = useSupabaseData();
  const { toast } = useToast();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    display_name: '',
    user_type: 'org_admin' as 'org_admin' | 'manager' | 'employee',
    organization_id: '',
    department_id: ''
  });
  const [editUserData, setEditUserData] = useState({
    username: '',
    display_name: '',
    user_type: 'org_admin' as 'org_admin' | 'manager' | 'employee',
    organization_id: '',
    department_id: '',
    new_password: ''
  });
  const [newOrg, setNewOrg] = useState({
    name: '',
    description: ''
  });

  // Set up real-time subscriptions for immediate updates
  useEffect(() => {
    console.log('Setting up SuperAdmin real-time subscriptions...');
    
    const channel = supabase
      .channel('super-admin-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizations'
        },
        (payload) => {
          console.log('Organization change in SuperAdmin:', payload);
          refetchOrganizations();
          toast({
            title: "🔄 Live Update",
            description: "Organizations updated in real-time",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change in SuperAdmin:', payload);
          refetchProfiles();
          toast({
            title: "🔄 Live Update",
            description: "Users updated in real-time",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'departments'
        },
        (payload) => {
          console.log('Department change in SuperAdmin:', payload);
          refetch();
          toast({
            title: "🔄 Live Update",
            description: "Departments updated in real-time",
          });
        }
      )
      .subscribe((status) => {
        console.log('SuperAdmin real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up SuperAdmin real-time subscriptions...');
      supabase.removeChannel(channel);
    };
  }, [refetchOrganizations, refetchProfiles, refetch, toast]);

  const handleCreateOrganization = async () => {
    if (!newOrg.name.trim()) {
      toast({
        title: "❌ Missing Information",
        description: "Organization name is required",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingOrg(true);
    console.log('Creating organization:', newOrg);

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: newOrg.name.trim(),
          description: newOrg.description.trim() || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Organization creation error:', error);
        toast({
          title: "❌ Creation Failed",
          description: error.message || "Failed to create organization",
          variant: "destructive"
        });
      } else {
        console.log('Organization created successfully:', data);
        toast({
          title: "✅ Organization Created",
          description: `${newOrg.name} has been created successfully`,
        });
        setNewOrg({ name: '', description: '' });
        setShowCreateOrg(false);
        await refetchOrganizations();
      }
    } catch (error) {
      console.error('Unexpected error creating organization:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreatingOrg(false);
    }
  };

  const handleDeleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to delete "${orgName}"? This will also delete all associated users and data. This action cannot be undone.`)) {
      return;
    }

    setDeletingOrgId(orgId);
    console.log('Deleting organization:', orgId);

    try {
      // First delete all users in this organization
      const { error: usersError } = await supabase
        .from('profiles')
        .delete()
        .eq('organization_id', orgId);

      if (usersError) {
        console.error('Error deleting organization users:', usersError);
        toast({
          title: "❌ Deletion Failed",
          description: "Failed to delete organization users",
          variant: "destructive"
        });
        return;
      }

      // Then delete the organization
      const { error: orgError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (orgError) {
        console.error('Error deleting organization:', orgError);
        toast({
          title: "❌ Deletion Failed",
          description: orgError.message || "Failed to delete organization",
          variant: "destructive"
        });
      } else {
        console.log('Organization deleted successfully');
        toast({
          title: "✅ Organization Deleted",
          description: `${orgName} has been deleted successfully`,
        });
        await refetchOrganizations();
        await refetchProfiles();
      }
    } catch (error) {
      console.error('Unexpected error deleting organization:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setDeletingOrgId(null);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email.trim() || !newUser.username.trim() || !newUser.password.trim() || !newUser.display_name.trim()) {
      toast({
        title: "❌ Missing Information",
        description: "Email, username, password, and display name are required",
        variant: "destructive"
      });
      return;
    }

    if (!newUser.organization_id) {
      toast({
        title: "❌ Missing Organization",
        description: "Please select an organization",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast({
        title: "❌ Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingUser(true);
    console.log('Creating fully automated user:', { ...newUser, password: '[HIDDEN]' });

    try {
      // Check if username already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', newUser.username.trim())
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking username:', checkError);
        toast({
          title: "❌ Error",
          description: "Error checking username availability",
          variant: "destructive"
        });
        setIsCreatingUser(false);
        return;
      }
      
      if (existingProfile) {
        toast({
          title: "❌ Username Taken",
          description: "Username already exists. Please choose another.",
          variant: "destructive"
        });
        setIsCreatingUser(false);
        return;
      }

      // Prepare user metadata with proper null handling
      const userMetadata = {
        username: newUser.username.trim(),
        display_name: newUser.display_name.trim(),
        user_type: newUser.user_type,
        organization_id: newUser.organization_id || null,
        department_id: newUser.department_id || null,
        created_by: profile?.id || null
      };

      // Create user with automatic confirmation (no email verification needed)
      console.log('Creating auto-confirmed user with email:', newUser.email);
      console.log('User metadata:', userMetadata);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email.trim(),
        password: newUser.password,
        email_confirm: true, // Automatically confirm email
        user_metadata: userMetadata
      });

      if (error) {
        console.error('User creation error:', error);
        toast({
          title: "❌ Creation Failed",
          description: error.message,
          variant: "destructive"
        });
        setIsCreatingUser(false);
        return;
      }

      console.log('User created and auto-confirmed successfully:', data.user?.id);
      toast({
        title: "🚀 User Created & Auto-Activated",
        description: `${newUser.display_name} has been created and is immediately ready to log in with username: ${newUser.username}`,
      });
      
      setNewUser({
        email: '',
        username: '',
        password: '',
        display_name: '',
        user_type: 'org_admin',
        organization_id: '',
        department_id: ''
      });
      setShowCreateUser(false);
      
      // Wait a moment for the database trigger to complete, then refresh
      setTimeout(async () => {
        await refetchProfiles();
      }, 1000);
      
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "An unexpected error occurred while creating the user",
        variant: "destructive"
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    console.log('Deleting user:', userId);

    try {
      // Delete from auth.users using admin API (this will cascade to profiles via trigger)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('Error deleting user from auth:', authError);
        toast({
          title: "❌ Deletion Failed",
          description: "Failed to delete user account",
          variant: "destructive"
        });
        return;
      }

      console.log('User deleted successfully');
      toast({
        title: "✅ User Deleted",
        description: `${userName} has been deleted successfully`,
      });
      await refetchProfiles();
    } catch (error) {
      console.error('Unexpected error deleting user:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditUserData({
      username: user.username,
      display_name: user.display_name,
      user_type: user.user_type,
      organization_id: user.organization_id || '',
      department_id: user.department_id || '',
      new_password: ''
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editUserData.username.trim() || !editUserData.display_name.trim()) {
      toast({
        title: "❌ Missing Information",
        description: "Username and display name are required",
        variant: "destructive"
      });
      return;
    }

    if (!editUserData.organization_id) {
      toast({
        title: "❌ Missing Organization",
        description: "Please select an organization",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingUser(true);
    console.log('Updating user:', editingUser.id, editUserData);

    try {
      // Check if username already exists (excluding current user)
      if (editUserData.username !== editingUser.username) {
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', editUserData.username.trim())
          .neq('id', editingUser.id)
          .maybeSingle();
        
        if (checkError) {
          console.error('Error checking username:', checkError);
          toast({
            title: "❌ Error",
            description: "Error checking username availability",
            variant: "destructive"
          });
          setIsUpdatingUser(false);
          return;
        }
        
        if (existingProfile) {
          toast({
            title: "❌ Username Taken",
            description: "Username already exists. Please choose another.",
            variant: "destructive"
          });
          setIsUpdatingUser(false);
          return;
        }
      }

      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: editUserData.username.trim(),
          display_name: editUserData.display_name.trim(),
          user_type: editUserData.user_type,
          organization_id: editUserData.organization_id || null,
          department_id: editUserData.department_id || null,
        })
        .eq('id', editingUser.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast({
          title: "❌ Update Failed",
          description: profileError.message || "Failed to update user profile",
          variant: "destructive"
        });
        setIsUpdatingUser(false);
        return;
      }

      // Update password if provided
      if (editUserData.new_password.trim()) {
        console.log('Updating user password...');
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          editingUser.id,
          { password: editUserData.new_password.trim() }
        );

        if (passwordError) {
          console.error('Error updating password:', passwordError);
          toast({
            title: "⚠️ Partial Update",
            description: "Profile updated but password update failed. Try updating password separately.",
            variant: "destructive"
          });
        } else {
          console.log('Password updated successfully');
        }
      }

      console.log('User updated successfully');
      toast({
        title: "✅ User Updated",
        description: `${editUserData.display_name} has been updated successfully`,
      });
      
      setEditingUser(null);
      setEditUserData({
        username: '',
        display_name: '',
        user_type: 'org_admin',
        organization_id: '',
        department_id: '',
        new_password: ''
      });
      
      await refetchProfiles();
    } catch (error) {
      console.error('Unexpected error updating user:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "An unexpected error occurred while updating the user",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const getUserOrganization = (orgId: string) => {
    return organizations.find(org => org.id === orgId)?.name || 'Unknown';
  };

  const getUserDepartment = (deptId: string) => {
    return departments.find(dept => dept.id === deptId)?.name || 'None';
  };

  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    await refetch();
    toast({
      title: "🔄 Refreshed",
      description: "All data has been refreshed",
    });
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
      {/* Header with live stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Crown className="h-8 w-8 text-yellow-600" />
          <div>
            <h1 className="text-2xl font-bold">Super Admin Management</h1>
            <p className="text-muted-foreground">
              Fully Automated System - Organizations: {organizations.length}, Users: {profiles.length}, Departments: {departments.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Badge variant="destructive" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            SUPER ADMIN
          </Badge>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-3 w-3" />
            Auto-System Active
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={() => setShowCreateOrg(!showCreateOrg)}
          className="h-16 text-left justify-start"
          variant="outline"
          disabled={isCreatingOrg}
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
          disabled={isCreatingUser}
        >
          <UserPlus className="h-6 w-6 mr-3" />
          <div>
            <div className="font-semibold">Auto-Create User</div>
            <div className="text-sm text-muted-foreground">Instant activation, no confirmation needed</div>
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
              <Label htmlFor="orgName">Organization Name *</Label>
              <Input
                id="orgName"
                value={newOrg.name}
                onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
                placeholder="Company Name Inc."
                disabled={isCreatingOrg}
              />
            </div>
            
            <div>
              <Label htmlFor="orgDescription">Description (Optional)</Label>
              <Input
                id="orgDescription"
                value={newOrg.description}
                onChange={(e) => setNewOrg({...newOrg, description: e.target.value})}
                placeholder="Brief description of the organization"
                disabled={isCreatingOrg}
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleCreateOrganization}
                disabled={isCreatingOrg || !newOrg.name.trim()}
              >
                <Building className="h-4 w-4 mr-2" />
                {isCreatingOrg ? "Creating..." : "Create Organization"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateOrg(false)}
                disabled={isCreatingOrg}
              >
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
            <CardTitle>Auto-Create User Account</CardTitle>
            <CardDescription>
              Create a fully activated user account - No email confirmation required, instant login capability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="user@company.com"
                disabled={isCreatingUser}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email is required but no verification needed - account will be instantly active
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="john.admin"
                  disabled={isCreatingUser}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ready for immediate login
                </p>
              </div>
              <div>
                <Label htmlFor="displayName">Full Name *</Label>
                <Input
                  id="displayName"
                  value={newUser.display_name}
                  onChange={(e) => setNewUser({...newUser, display_name: e.target.value})}
                  placeholder="John Administrator"
                  disabled={isCreatingUser}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Secure password (min 6 characters)"
                disabled={isCreatingUser}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userType">Role *</Label>
                <Select 
                  value={newUser.user_type} 
                  onValueChange={(value: 'org_admin' | 'manager' | 'employee') => 
                    setNewUser({...newUser, user_type: value})
                  }
                  disabled={isCreatingUser}
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
                <Label htmlFor="organization">Organization *</Label>
                <Select 
                  value={newUser.organization_id} 
                  onValueChange={(value) => setNewUser({...newUser, organization_id: value})}
                  disabled={isCreatingUser}
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

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                🚀 Fully Automated: Account will be instantly activated with no email confirmation required. User can log in immediately with their username and password.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button 
                onClick={handleCreateUser}
                disabled={isCreatingUser || !newUser.email.trim() || !newUser.username.trim() || !newUser.password.trim() || !newUser.display_name.trim() || !newUser.organization_id}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isCreatingUser ? "Auto-Creating..." : "🚀 Auto-Create User"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateUser(false)}
                disabled={isCreatingUser}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Account</DialogTitle>
            <DialogDescription>
              Update user details, role, or password - Changes are applied instantly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editUsername">Username *</Label>
              <Input
                id="editUsername"
                value={editUserData.username}
                onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
                placeholder="john.admin"
                disabled={isUpdatingUser}
              />
            </div>

            <div>
              <Label htmlFor="editDisplayName">Full Name *</Label>
              <Input
                id="editDisplayName"
                value={editUserData.display_name}
                onChange={(e) => setEditUserData({...editUserData, display_name: e.target.value})}
                placeholder="John Administrator"
                disabled={isUpdatingUser}
              />
            </div>
            
            <div>
              <Label htmlFor="editPassword">New Password (optional)</Label>
              <Input
                id="editPassword"
                type="password"
                value={editUserData.new_password}
                onChange={(e) => setEditUserData({...editUserData, new_password: e.target.value})}
                placeholder="Leave blank to keep current password"
                disabled={isUpdatingUser}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editUserType">Role *</Label>
                <Select 
                  value={editUserData.user_type} 
                  onValueChange={(value: 'org_admin' | 'manager' | 'employee') => 
                    setEditUserData({...editUserData, user_type: value})
                  }
                  disabled={isUpdatingUser}
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
                <Label htmlFor="editOrganization">Organization *</Label>
                <Select 
                  value={editUserData.organization_id} 
                  onValueChange={(value) => setEditUserData({...editUserData, organization_id: value})}
                  disabled={isUpdatingUser}
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
              <Button 
                onClick={handleUpdateUser}
                disabled={isUpdatingUser || !editUserData.username.trim() || !editUserData.display_name.trim() || !editUserData.organization_id}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isUpdatingUser ? "Updating..." : "Update User"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingUser(null)}
                disabled={isUpdatingUser}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Organizations List with delete functionality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Organizations ({organizations.length})
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          </CardTitle>
          <CardDescription>
            All organizations in the system - Auto-updates in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No organizations found. Create one to get started.
            </div>
          ) : (
            <div className="grid gap-4">
              {organizations.map((org) => {
                const orgUsers = profiles.filter(p => p.organization_id === org.id);
                const orgDepts = departments.filter(d => d.organization_id === org.id);
                
                return (
                  <div key={org.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{org.name}</h3>
                        <p className="text-sm text-muted-foreground">{org.description || 'No description'}</p>
                        <div className="flex gap-4 mt-2">
                          <Badge variant="outline">{orgUsers.length} users</Badge>
                          <Badge variant="outline">{orgDepts.length} departments</Badge>
                          <Badge variant="outline" className="text-xs">
                            Created: {new Date(org.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteOrganization(org.id, org.name)}
                          disabled={deletingOrgId === org.id}
                        >
                          {deletingOrgId === org.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users List with edit and delete functionality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            All System Users ({profiles.length})
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          </CardTitle>
          <CardDescription>
            Complete automated user management - All accounts instantly active
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found.
            </div>
          ) : (
            <div className="grid gap-4">
              {profiles.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
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
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            ✅ Auto-Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user.user_type !== 'super_admin' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.display_name)}
                            disabled={deletingUserId === user.id}
                          >
                            {deletingUserId === user.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
