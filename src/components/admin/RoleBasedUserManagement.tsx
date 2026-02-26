import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, UserPlus, KeyRound } from 'lucide-react';
import CreateOrganisationForm from './CreateOrganisationForm';
import CreateUserForm from './CreateUserForm';
import OrganisationsList from './OrganisationsList';
import UsersList from './UsersList';
import UsernameBasedUserCreation from './UsernameBasedUserCreation';
import UsernamePasswordChange from './UsernamePasswordChange';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import HistoryButton from './HistoryButton';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { getOrganizationAlias, getOrganizationDescription } from '@/lib/organizationHelpers';
import { 
  fetchOrganizationsAsAdmin, 
  fetchProfilesAsAdmin, 
  createOrganizationAsAdmin, 
  createUserAsAdmin 
} from '@/lib/superAdminDataAccess';
import { adminUserOperations, hasAdminAccess } from '@/lib/supabaseAdmin';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import EditUserDialog from './EditUserDialog';
import { AdminField, EmptyStatePanel, SectionHeader } from './design';
import { getActionDataAttributes } from '@/config/superAdminActionRegistry';

interface Organization {
  id: string;
  name: string;
  settings_json?: unknown; // Use unknown to match Json type from database
  tracking_id?: string;
  created_at: string;
  users?: { id: string }[];
}

interface User {
  id: number | string; // Support both number (from DB) and string (for UI compatibility)
  username: string;
  display_name: string;
  user_type: string;
  organisation_id: string;
  department_id: string;
  is_active: boolean;
  tracking_id: string | null;
  phone_number: string | null;
  created_at: string;
}

type ActiveTab = 'list' | 'create-org' | 'create-user' | 'username-create' | 'password-change';

export default function RoleBasedUserManagement() {
  const { profile, createUser } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit user dialog state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  
  const { toast } = useToast();
  const { logOrganizationCreation, logUserDeletion, logOrganizationDeletion } = useAuditLogger();

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching organisations... User type:', profile?.user_type);
      
      // Use super admin data access for super admin users
      if (profile?.user_type === 'super_admin') {
        console.log('🚀 Using super admin data access for organisations');
        const data = await fetchOrganizationsAsAdmin();
        setOrganizations(data || []);
        return;
      }
      
      // Standard data access for other users
      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organisations:', error);
        toast({
          title: "❌ Error fetching organisations",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setOrganizations(data || []);
    } catch (error) {
      console.error('Unexpected error fetching organisations:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to load organizations.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, profile?.user_type]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔍 Starting user fetch... User type:', profile?.user_type);
      
      // Use super admin data access for super admin users
      if (profile?.user_type === 'super_admin') {
        console.log('🚀 Using super admin data access for profiles');
        const data = await fetchProfilesAsAdmin();
        console.log('✅ Super admin users fetched:', data?.length || 0, 'users');
        setAllUsers(data || []);
        return;
      }
      
      // Standard data access for other users
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users:', error);
        toast({
          title: "❌ Error fetching users",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Users fetched successfully:', data?.length || 0, 'users');
      console.log('📊 User data preview:', data?.slice(0, 3));
      setAllUsers(data || []);
    } catch (error) {
      console.error('Unexpected error fetching users:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to load users.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, profile?.user_type]);

  // Set up real-time subscriptions for immediate updates
  useEffect(() => {
    console.log('Setting up real-time subscriptions...');
    
    const channel = supabase
      .channel('role-based-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organisations'
        },
        (payload) => {
          console.log('Organization change:', payload);
          fetchOrganizations();
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
          console.log('Profile change:', payload);
          fetchUsers();
          toast({
            title: "🔄 Live Update",
            description: "Users updated in real-time",
          });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      supabase.removeChannel(channel);
    };
  }, [fetchOrganizations, fetchUsers, toast]);

  useEffect(() => {
    fetchOrganizations();
    fetchUsers();
  }, [fetchOrganizations, fetchUsers]);

  // Clean search term to handle pasted content safely
  const cleanSearchTerm = searchTerm.replace(/[^\w\s-]/g, '').trim();

  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(org => {
    const alias = getOrganizationAlias(org);
    const description = getOrganizationDescription(org);
    
    return org.name.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
           (alias && alias.toLowerCase().includes(cleanSearchTerm.toLowerCase())) ||
           (description && description.toLowerCase().includes(cleanSearchTerm.toLowerCase()));
  });

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user =>
    user.display_name.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
    (user.tracking_id && user.tracking_id.toLowerCase().includes(cleanSearchTerm.toLowerCase())) ||
    (user.phone_number && user.phone_number.includes(cleanSearchTerm))
  );

  // Add debugging for filtering
  console.log('🔍 Filtering debug:', {
    totalUsers: allUsers.length,
    filteredUsers: filteredUsers.length,
    searchTerm: cleanSearchTerm,
    sampleUsers: allUsers.slice(0, 2).map(u => ({ username: u.username, display_name: u.display_name }))
  });

  const handleCreateOrg = async (orgData: { 
    name: string; 
    alias?: string; 
    description?: string; 
  }) => {
    setIsCreatingOrg(true);
    try {
      console.log('🏢 Starting organization creation with data:', orgData);
      console.log('👤 Current user type:', profile?.user_type);
      
      // Use super admin data access for super admin users
      if (profile?.user_type === 'super_admin') {
        console.log('🚀 Using super admin organization creation');
        const actorId = profile.user_id || profile.id?.toString() || null;
        const { data, error } = await createOrganizationAsAdmin(orgData, actorId);
        
        if (error) {
          console.error('❌ Super admin organization creation failed:', error);
          toast({
            title: "❌ Error creating organization",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        console.log('✅ Organization created via super admin access:', data);
        
        // Log organization creation
        if (data) {
          await logOrganizationCreation(data.id, data.name);
        }

        fetchOrganizations();
        setActiveTab('list');
        toast({
          title: "✅ Organization Created",
          description: `${orgData.name} has been successfully created.`,
        });
        return;
      }
      
      // Standard organization creation for other users
      const insertData = {
        name: orgData.name,
        settings_json: {
          alias: orgData.alias?.trim() || null,
          description: orgData.description?.trim() || null
        }
      };
      
      console.log('📝 Insert data prepared:', insertData);
      
      const { data, error } = await supabase
        .from('organisations')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating organisation:', error);
        console.error('📋 Error details:', JSON.stringify(error, null, 2));
        toast({
          title: "❌ Error creating organisation",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Organisation created successfully:', data);

      // Log organization creation
      if (data) {
        await logOrganizationCreation(data.id, data.name);
      }

      fetchOrganizations();
      setActiveTab('list');
      toast({
        title: "✅ Organisation Created",
        description: `${orgData.name} has been successfully created.`,
      });
    } catch (error) {
      console.error('Unexpected error creating organization:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to create organisation.',
        variant: "destructive"
      });
    } finally {
      setIsCreatingOrg(false);
    }
  };

  const handleCreateUser = async (userData: {
    email: string;
    username: string;
    password: string;
    display_name: string;
    phone_number: string;
    user_type: string;
    organisation_id: string;
    department_id: string;
  }) => {
    setIsCreatingUser(true);
    try {
      console.log('👤 Creating user, current user type:', profile?.user_type);
      
      // Set flag to prevent auth state redirects during user creation
      sessionStorage.setItem('preventAuthRedirect', 'true');
      
      // Use super admin data access for super admin users
      if (profile?.user_type === 'super_admin') {
        console.log('🚀 Using super admin user creation');
        const { data, error } = await createUserAsAdmin(userData);
        
        if (error) {
          console.error('❌ Super admin user creation failed:', error);
          toast({
            title: "❌ Error creating user",
            description: error.message,
            variant: "destructive"
          });
          sessionStorage.removeItem('preventAuthRedirect');
          return;
        }
        
        console.log('✅ User created via super admin access:', data);
        
        toast({
          title: "✅ User Created",
          description: `${userData.display_name} has been successfully created.`,
        });

        // Wait a moment for the database trigger to execute
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh users to show the new user
        await fetchUsers();
        setActiveTab('list');
        sessionStorage.removeItem('preventAuthRedirect');
        return;
      }
      
      // Standard user creation using auth signup
      console.log('🚀 Using standard user creation method');
      const result = await createUser({
        username: userData.username,
        password: userData.password,
        display_name: userData.display_name,
        user_type: userData.user_type as 'org_admin' | 'manager' | 'employee',
        organisation_id: userData.organisation_id,
        department_id: userData.department_id || undefined
      });

      if (!result.success) {
        console.error('Standard user creation failed:', result.error);
        toast({
          title: "❌ Error creating user",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ User created via standard method');
      
      toast({
        title: "✅ User Created",
        description: `${userData.display_name} has been successfully created.`,
      });

      // Wait a moment for the database trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh users to show the new user
      await fetchUsers();
      setActiveTab('list');
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to create user.',
        variant: "destructive"
      });
    } finally {
      // Always clear the prevent redirect flag
      sessionStorage.removeItem('preventAuthRedirect');
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    console.log('🗑️ Starting user deletion:', userId, userName);

    try {
      // Get user details for logging
      const userToDelete = allUsers.find(user => user.id === userId);
      
      // Use the new admin operations with fallback strategy
      const result = await adminUserOperations.deleteUser(userId);

      if (!result.success) {
        console.error('❌ User deletion failed:', result.error);
        toast({
          title: "❌ Deletion Failed",
          description: `Failed to delete ${userName}: ${result.error}`,
          variant: "destructive"
        });
        return;
      }

      // Log user deletion with who performed it
      if (userToDelete) {
        await logUserDeletion(
          String(userId), 
          userName, 
          userToDelete.organisation_id
        );
      }

      console.log('✅ User deleted successfully');
      toast({
        title: "🗑️ User Deleted",
        description: `${userName} has been successfully deleted`,
      });
      
      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error('💥 Unexpected error during user deletion:', error);
      toast({
        title: "❌ Unexpected Error",
        description: `An unexpected error occurred while deleting ${userName}`,
        variant: "destructive"
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDeleteOrganisation = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to delete "${orgName}"? This will remove all associated users. This action cannot be undone.`)) {
      return;
    }

    setDeletingOrgId(orgId);
    console.log('🗑️ Starting organization deletion:', orgId, orgName);

    try {
      // Get all users in this organization for logging
      const orgUsers = allUsers.filter(user => user.organisation_id === orgId);
      
      // Delete all users first
      for (const user of orgUsers) {
        await logUserDeletion(String(user.id), user.display_name, orgId);
        
        // Try auth deletion first, then profile
        const { error: authError } = await supabase.auth.admin.deleteUser(String(user.id));
        if (authError) {
          await supabase.from('profiles').delete().eq('id', Number(user.id));
        }
      }

      // Delete the organization
      const { error: orgError } = await supabase
        .from('organisations')
        .delete()
        .eq('id', orgId);

      if (orgError) {
        console.error('❌ Error deleting organization:', orgError);
        toast({
          title: "❌ Organization Deletion Failed",
          description: orgError.message,
          variant: "destructive"
        });
        return;
      }

      // Log organization deletion
      await logOrganizationDeletion(orgId, orgName);

      toast({
        title: "🗑️ Organization Deleted",
        description: `${orgName} and ${orgUsers.length} associated users have been deleted`,
      });
      
      fetchOrganizations();
      fetchUsers();
    } catch (error) {
      console.error('💥 Unexpected error deleting organization:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "An unexpected error occurred during deletion",
        variant: "destructive"
      });
    } finally {
      setDeletingOrgId(null);
    }
  };

  // Handle edit user
  const handleEditUser = (user: {
    id: string;
    username: string;
    display_name: string;
    user_type: string;
    organization_id?: string;
    phone_number?: string;
    tracking_id?: string;
    created_at: string;
    is_active: boolean;
  }) => {
    // Transform the user data to match EditUserDialog interface
    const transformedUser: User = {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      user_type: user.user_type,
      organisation_id: user.organization_id || '',
      phone_number: user.phone_number || '',
      tracking_id: user.tracking_id || '',
      department_id: '',
      is_active: user.is_active,
      created_at: user.created_at
    };
    
    console.log('Opening edit dialog for user:', transformedUser);
    setEditingUser(transformedUser);
  };

  const handleEditUserSubmit = async (userData: {
    username: string;
    display_name: string;
    phone_number: string;
    user_type: string;
    organization_id: string;
    new_password?: string;
  }) => {
    if (!editingUser) return;

    setIsUpdatingUser(true);
    try {
      console.log('🔄 Updating user with data:', { ...userData, new_password: userData.new_password ? '[HIDDEN]' : 'Not provided' });

      // Update profile data with proper error handling
      const profileUpdateData = {
        username: userData.username.trim(),
        display_name: userData.display_name.trim(),
        phone_number: userData.phone_number.trim() || null,
        user_type: userData.user_type,
        organisation_id: userData.organization_id // Note: British spelling for database
      };

      console.log('🔄 Updating profile with data:', profileUpdateData);
      console.log('🔍 User ID being updated:', editingUser.id);

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', Number(editingUser.id));

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        console.error('📋 Error details:', JSON.stringify(profileError, null, 2));
        console.error('📊 Update data that failed:', profileUpdateData);
        toast({
          title: "❌ Error",
          description: profileError.message || "Failed to update user profile",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Profile updated successfully');

      // Update password if provided
      if (userData.new_password && userData.new_password.trim()) {
        console.log('🔑 Updating user password...');
        
        const passwordResult = await adminUserOperations.updateUserPassword(
          String(editingUser.id),
          userData.new_password.trim()
        );

        if (!passwordResult.success) {
          console.error('❌ Password update error:', passwordResult.error);
          toast({
            title: "⚠️ Partial Update",
            description: "Profile updated successfully, but password update failed: " + passwordResult.error,
            variant: "destructive"
          });
        } else {
          console.log('✅ Password updated successfully');
        }
      }

      toast({
        title: "✅ User Updated",
        description: `User "${userData.display_name}" has been successfully updated`,
      });

      // Refresh users list
      await fetchUsers();
      
      // Close dialog
      setEditingUser(null);

    } catch (error) {
      console.error('💥 Unexpected error updating user:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred while updating the user",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Directory Operations"
        description="Manage users, organisations, and credential lifecycle from one secured workspace."
        action={
          <div className="flex flex-wrap items-end gap-3">
            <AdminField
              id="role-based-search"
              label="Search directory"
              helperText="Search by user, role, organisation, alias, tracking ID, or phone."
              className="min-w-[220px] sm:w-80"
            >
              <input
                id="role-based-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Example: manager, MinaTid HQ, +46..."
                className="sa-focus-ring h-10 w-full rounded-xl border border-white/20 bg-[hsl(var(--sa-surface-1)/0.72)] px-3 sa-text-14 text-[hsl(var(--sa-text-primary))] placeholder:text-[hsl(var(--sa-text-secondary))]"
                {...getActionDataAttributes('header.search')}
              />
            </AdminField>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                fetchOrganizations();
                fetchUsers();
              }}
              className="sa-focus-ring border-white/20 bg-[hsl(var(--sa-surface-1)/0.75)] text-[hsl(var(--sa-text-primary))]"
              {...getActionDataAttributes('overview.refresh')}
            >
              Refresh
            </Button>
          </div>
        }
      />

      <div className="sa-surface-soft flex flex-wrap gap-2 p-3">
        <Button
          variant={activeTab === 'list' ? 'default' : 'outline'}
          onClick={() => setActiveTab('list')}
          className="flex items-center gap-2"
          {...getActionDataAttributes('overview.manage-users')}
        >
          <Users className="w-4 h-4" />
          View All
        </Button>
        <Button
          variant={activeTab === 'create-org' ? 'default' : 'outline'}
          onClick={() => setActiveTab('create-org')}
          className="flex items-center gap-2"
          {...getActionDataAttributes('organisations.create')}
        >
          <Building className="w-4 h-4" />
          Create Organisation
        </Button>
        <Button
          variant={activeTab === 'create-user' ? 'default' : 'outline'}
          onClick={() => setActiveTab('create-user')}
          className="flex items-center gap-2"
          {...getActionDataAttributes('users.create')}
        >
          <UserPlus className="w-4 h-4" />
          Create User (Email)
        </Button>
        <Button
          variant={activeTab === 'username-create' ? 'default' : 'outline'}
          onClick={() => setActiveTab('username-create')}
          className="flex items-center gap-2"
          {...getActionDataAttributes('users.create')}
        >
          <UserPlus className="w-4 h-4" />
          Create User (Username)
        </Button>
        <Button
          variant={activeTab === 'password-change' ? 'default' : 'outline'}
          onClick={() => setActiveTab('password-change')}
          className="flex items-center gap-2"
          {...getActionDataAttributes('users.edit')}
        >
          <KeyRound className="w-4 h-4" />
          Change Password
        </Button>
      </div>

      {activeTab === 'create-org' && (
        <CreateOrganisationForm
          isCreating={isCreatingOrg}
          onCancel={() => setActiveTab('list')}
          onSubmit={handleCreateOrg}
        />
      )}

      {activeTab === 'create-user' && (
        <CreateUserForm
          isCreating={isCreatingUser}
          organisations={organizations}
          onCancel={() => setActiveTab('list')}
          onSubmit={handleCreateUser}
        />
      )}

      {activeTab === 'username-create' && (
        <div className="space-y-4">
          <SectionHeader
            title="Create User with Username"
            description="Provision users with username/password credentials."
            action={
              <Button
                variant="outline"
                onClick={() => setActiveTab('list')}
                {...getActionDataAttributes('navigation.users')}
              >
                Back to List
              </Button>
            }
          />
          <UsernameBasedUserCreation />
        </div>
      )}

      {activeTab === 'password-change' && (
        <div className="space-y-4">
          <SectionHeader
            title="Change Password"
            description="Rotate credentials and enforce password policy."
            action={
              <Button
                variant="outline"
                onClick={() => setActiveTab('list')}
                {...getActionDataAttributes('navigation.users')}
              >
                Back to List
              </Button>
            }
          />
          <UsernamePasswordChange />
        </div>
      )}

      {editingUser && (
        <EditUserDialog
          user={{
            ...editingUser,
            organization_id: editingUser.organisation_id,
          }}
          isUpdating={isUpdatingUser}
          organizations={organizations}
          onClose={() => setEditingUser(null)}
          onSubmit={handleEditUserSubmit}
        />
      )}

      {activeTab === 'list' && (
        <div className="space-y-6">
          <Card className="sa-panel border-white/15 bg-[hsl(var(--sa-surface-1)/0.72)]">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-indigo-200" />
                  <CardTitle className="sa-text-20 font-semibold text-[hsl(var(--sa-text-primary))]">
                    Organisations ({filteredOrganizations.length})
                    {searchTerm && (
                      <span className="ml-2 sa-text-12 font-normal text-[hsl(var(--sa-text-secondary))]">
                        of {organizations.length} total
                      </span>
                    )}
                  </CardTitle>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 sa-text-12 text-emerald-100">
                  {filteredOrganizations.filter((org) => org.users?.length > 0).length} active
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <OrganisationsList
                organisations={filteredOrganizations.map((org) => ({
                  ...org,
                  description: getOrganizationDescription(org),
                  alias: getOrganizationAlias(org),
                  organization_number: org.tracking_id,
                  settings_json: (org.settings_json as Record<string, unknown>) || {},
                }))}
                profiles={allUsers}
                departments={[]}
                deletingOrgId={deletingOrgId}
                onDelete={handleDeleteOrganisation}
              />
            </CardContent>
          </Card>

          <Card className="sa-panel border-white/15 bg-[hsl(var(--sa-surface-1)/0.72)]">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-emerald-200" />
                  <CardTitle className="sa-text-20 font-semibold text-[hsl(var(--sa-text-primary))]">
                    Users ({filteredUsers.length})
                    {searchTerm && (
                      <span className="ml-2 sa-text-12 font-normal text-[hsl(var(--sa-text-secondary))]">
                        of {allUsers.length} total
                      </span>
                    )}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 sa-text-12 text-emerald-100">
                    {filteredUsers.filter((user) => user.is_active).length} active
                  </span>
                  <HistoryButton
                    variant="ghost"
                    size="sm"
                    className="text-[hsl(var(--sa-text-secondary))] hover:text-[hsl(var(--sa-text-primary))]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredUsers.length > 0 ? (
                <UsersList
                  users={filteredUsers.map((user) => ({
                    ...user,
                    id: String(user.id),
                    organization_id: user.organisation_id,
                  }))}
                  organizations={organizations}
                  deletingUserId={deletingUserId}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  getUserOrganization={(orgId: string) => {
                    const org = organizations.find((item) => item.id === orgId);
                    return org?.name || 'Unknown Organization';
                  }}
                />
              ) : (
                <div className="p-4">
                  <EmptyStatePanel
                    title="No directory matches"
                    description="No users matched your current filter. Try another search or clear the filter."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
