
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, UserPlus } from 'lucide-react';
import CreateOrganisationForm from './CreateOrganisationForm';
import CreateUserForm from './CreateUserForm';
import OrganisationsList from './OrganisationsList';
import UsersList from './UsersList';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import HistoryButton from './HistoryButton';
import SuperAdminHeader from './SuperAdminHeader';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { getOrganizationAlias, getOrganizationDescription } from '@/lib/organizationHelpers';
import { 
  fetchOrganizationsAsAdmin, 
  fetchProfilesAsAdmin, 
  createOrganizationAsAdmin, 
  createUserAsAdmin 
} from '@/lib/superAdminDataAccess';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

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

type ActiveTab = 'list' | 'create-org' | 'create-user';

export default function RoleBasedUserManagement() {
  const { profile } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { logOrganizationCreation, logUserDeletion, logOrganizationDeletion } = useAuditLogger();

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching organizations... User type:', profile?.user_type);
      
      // Use super admin data access for super admin users
      if (profile?.user_type === 'super_admin') {
        console.log('🚀 Using super admin data access for organizations');
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
        console.error('Error fetching organizations:', error);
        toast({
          title: "❌ Error fetching organizations",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setOrganizations(data || []);
    } catch (error) {
      console.error('Unexpected error fetching organizations:', error);
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
        const { data, error } = await createOrganizationAsAdmin(orgData);
        
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
        console.error('❌ Error creating organization:', error);
        console.error('📋 Error details:', JSON.stringify(error, null, 2));
        toast({
          title: "❌ Error creating organization",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Organization created successfully:', data);

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
    } catch (error) {
      console.error('Unexpected error creating organization:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to create organization.',
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
          return;
        }
        
        console.log('✅ User created via super admin access:', data);
        fetchUsers();
        setActiveTab('list');
        toast({
          title: "✅ User Created",
          description: `${userData.display_name} has been successfully created.`,
        });
        return;
      }
      
      // Standard user creation using edge function
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          ...userData
        }
      });

      if (error) {
        console.error('Error creating user:', error);
        toast({
          title: "❌ Error creating user",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      fetchUsers();
      setActiveTab('list');
      toast({
        title: "✅ User Created",
        description: `${userData.display_name} has been successfully created.`,
      });
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to create user.',
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
    console.log('🗑️ Starting user deletion:', userId, userName);

    try {
      // Get user details for logging
      const userToDelete = allUsers.find(user => user.id === userId);
      
      // Try to delete using the admin API first
      const { error: adminError } = await supabase.auth.admin.deleteUser(userId);

      if (adminError) {
        console.log('⚠️ Admin API deletion failed, trying profile deletion:', adminError.message);
        
        // If admin API fails, delete profile manually
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', Number(userId));

        if (profileError) {
          console.error('❌ Profile deletion also failed:', profileError);
          toast({
            title: "❌ Deletion Failed",
            description: `Failed to delete ${userName}`,
            variant: "destructive"
          });
          return;
        }
      }

      // Log user deletion with who performed it
      if (userToDelete) {
        await logUserDeletion(
          String(userId), 
          userName, 
          userToDelete.organisation_id
        );
      }

      toast({
        title: "🗑️ User Deleted",
        description: `${userName} has been successfully deleted`,
      });
      
      fetchUsers();
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

  return (
    <div className="space-y-6 p-6">
      {/* Header Section with Search */}
      <SuperAdminHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={() => {
          fetchOrganizations();
          fetchUsers();
        }}
        organizationsCount={organizations.length}
        usersCount={allUsers.length}
        departmentsCount={0}
        filteredOrganizationsCount={filteredOrganizations.length}
        filteredUsersCount={filteredUsers.length}
      />

      {/* Create Organization Form */}
      {activeTab === 'create-org' && (
        <CreateOrganisationForm
          isCreating={isCreatingOrg}
          onCancel={() => setActiveTab('list')}
          onSubmit={handleCreateOrg}
        />
      )}

      {/* Create User Form */}
      {activeTab === 'create-user' && (
        <CreateUserForm
          isCreating={isCreatingUser}
          organisations={organizations}
          onCancel={() => setActiveTab('list')}
          onSubmit={handleCreateUser}
        />
      )}

      {/* Organizations and Users List */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Organizations Section */}
          <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Organizations ({filteredOrganizations.length})
                    {searchTerm && (
                      <span className="text-sm font-normal text-slate-600 dark:text-slate-400 ml-2">
                        of {organizations.length} total
                      </span>
                    )}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {filteredOrganizations.filter(org => org.users?.length > 0).length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <OrganisationsList
                organisations={filteredOrganizations.map(org => ({
                  ...org,
                  description: getOrganizationDescription(org),
                  alias: getOrganizationAlias(org),
                  organization_number: org.tracking_id
                }))}
                profiles={allUsers}
                departments={[]}
                deletingOrgId={deletingOrgId}
                onDelete={handleDeleteOrganisation}
              />
            </CardContent>
          </Card>

          {/* Users Section */}
          <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    All Users ({filteredUsers.length})
                    {searchTerm && (
                      <span className="text-sm font-normal text-slate-600 dark:text-slate-400 ml-2">
                        of {allUsers.length} total
                      </span>
                    )}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {filteredUsers.filter(user => user.is_active).length} Active
                  </Badge>
                  <HistoryButton 
                    variant="ghost" 
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <UsersList
                users={filteredUsers.map(user => ({
                  ...user,
                  id: String(user.id),
                  organization_id: user.organisation_id // Map British to American spelling
                }))}
                organizations={organizations}
                deletingUserId={deletingUserId}
                onEdit={() => {}}
                onDelete={handleDeleteUser}
                getUserOrganization={(orgId: string) => {
                  const org = organizations.find(o => o.id === orgId);
                  return org?.name || 'Unknown Organization';
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
