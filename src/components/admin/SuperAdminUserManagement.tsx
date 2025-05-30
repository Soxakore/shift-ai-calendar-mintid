import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import SuperAdminHeader from './SuperAdminHeader';
import QuickActions from './QuickActions';
import CreateOrganizationForm from './CreateOrganizationForm';
import CreateUserForm from './CreateUserForm';
import EditUserDialog from './EditUserDialog';
import OrganizationsList from './OrganizationsList';
import UsersList from './UsersList';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [editUserData, setEditUserData] = useState({
    username: '',
    display_name: '',
    phone_number: '',
    user_type: 'org_admin',
    organization_id: '',
    department_id: '',
    new_password: ''
  });

  // Filter data based on search term
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.organization_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.alias?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProfiles = profiles.filter(user =>
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.tracking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getUserOrganization(user.organization_id!).toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleCreateOrganization = async (orgData) => {
    if (!orgData.name.trim()) {
      toast({
        title: "❌ Missing Information",
        description: "Organization name is required",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingOrg(true);
    console.log('Creating organization:', orgData);

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: orgData.name.trim(),
          description: orgData.description.trim() || null,
          alias: orgData.alias.trim() || null
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
          description: `${orgData.name} has been created with number: ${data.organization_number}`,
        });
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
    if (!confirm(`Are you sure you want to delete "${orgName}"? This will completely remove all associated users, their accounts, and all data. This action cannot be undone.`)) {
      return;
    }

    setDeletingOrgId(orgId);
    console.log('🗑️ Starting complete organization deletion:', orgId);

    try {
      // Get all users in this organization first
      const { data: orgUsers, error: getUsersError } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .eq('organization_id', orgId);

      if (getUsersError) {
        console.error('Error fetching organization users:', getUsersError);
        toast({
          title: "❌ Deletion Failed",
          description: "Failed to fetch organization users",
          variant: "destructive"
        });
        setDeletingOrgId(null);
        return;
      }

      console.log('📋 Found users to delete:', orgUsers?.length || 0);

      let authDeleteCount = 0;
      let profileDeleteCount = 0;

      // Delete all users in this organization
      for (const user of orgUsers || []) {
        console.log(`🗑️ Attempting to delete user: ${user.username} (${user.id})`);
        
        try {
          // First try to delete from auth (this will also trigger profile deletion via RLS)
          const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
          
          if (authError) {
            console.log(`⚠️ Auth deletion failed for ${user.username}, trying profile-only deletion:`, authError.message);
            
            // If auth deletion fails, delete profile manually
            const { error: profileError } = await supabase
              .from('profiles')
              .delete()
              .eq('id', user.id);

            if (profileError) {
              console.error(`❌ Profile deletion also failed for ${user.username}:`, profileError);
            } else {
              profileDeleteCount++;
              console.log(`✅ Profile deleted for ${user.username} (auth account may remain)`);
            }
          } else {
            authDeleteCount++;
            console.log(`✅ Complete deletion successful for ${user.username}`);
          }
        } catch (error) {
          console.error(`💥 Unexpected error deleting ${user.username}:`, error);
        }
      }

      // Wait a moment for cascading deletes to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Then delete the organization
      const { error: orgError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (orgError) {
        console.error('❌ Error deleting organization:', orgError);
        toast({
          title: "❌ Organization Deletion Failed",
          description: orgError.message || "Failed to delete organization",
          variant: "destructive"
        });
      } else {
        console.log('✅ Organization deleted successfully');
        
        const totalUsers = orgUsers?.length || 0;
        const deletionSummary = [];
        
        if (authDeleteCount > 0) {
          deletionSummary.push(`${authDeleteCount} users completely removed (email + profile)`);
        }
        if (profileDeleteCount > 0) {
          deletionSummary.push(`${profileDeleteCount} profiles removed (email accounts may remain)`);
        }
        
        toast({
          title: "🗑️ Organization Completely Deleted",
          description: `${orgName} and ${totalUsers} associated users deleted. ${deletionSummary.join(', ')}`,
        });
        
        await refetchOrganizations();
        await refetchProfiles();
      }
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

  const handleCreateUser = async (userData: any) => {
    if (!userData.email.trim() || !userData.username.trim() || !userData.password.trim() || !userData.display_name.trim()) {
      toast({
        title: "❌ Missing Information",
        description: "Email, username, password, and display name are required",
        variant: "destructive"
      });
      return;
    }

    if (!userData.organization_id) {
      toast({
        title: "❌ Missing Organization",
        description: "Please select an organization",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      toast({
        title: "❌ Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingUser(true);
    console.log('Creating fully automated user:', { ...userData, password: '[HIDDEN]' });

    try {
      // Check if username already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', userData.username.trim())
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
        username: userData.username.trim(),
        display_name: userData.display_name.trim(),
        phone_number: userData.phone_number.trim() || null,
        user_type: userData.user_type,
        organization_id: userData.organization_id || null,
        department_id: userData.department_id || null,
        created_by: profile?.id || null
      };

      // Create user with automatic confirmation (no email verification needed)
      console.log('Creating auto-confirmed user with email:', userData.email);
      console.log('User metadata:', userMetadata);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email.trim(),
        password: userData.password,
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
        description: `${userData.display_name} has been created and is immediately ready to log in with username: ${userData.username}`,
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
    if (!confirm(`Are you sure you want to completely delete user "${userName}"? This will remove their email account, profile, and all associated data. This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    console.log('🗑️ Starting complete user deletion:', userId, userName);

    try {
      // First, try to delete using the admin API (this removes both auth and profile)
      console.log('🔑 Attempting complete deletion via admin API...');
      const { error: adminError } = await supabase.auth.admin.deleteUser(userId);

      if (adminError) {
        console.log('⚠️ Admin API deletion failed, trying alternative approach:', adminError.message);
        
        // If admin API fails due to permissions, delete profile and mark auth for cleanup
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (profileError) {
          console.error('❌ Profile deletion also failed:', profileError);
          toast({
            title: "❌ Deletion Failed",
            description: `Failed to delete ${userName}. Error: ${profileError.message}`,
            variant: "destructive"
          });
        } else {
          console.log('✅ Profile deleted successfully (auth account remains)');
          toast({
            title: "⚠️ User Profile Deleted",
            description: `${userName}'s profile removed from MinTid. Email account still exists in Supabase and needs manual cleanup.`,
          });
        }
      } else {
        console.log('✅ Complete user deletion successful via admin API');
        toast({
          title: "🗑️ User Completely Deleted",
          description: `${userName} has been completely removed - both email account and profile deleted successfully`,
        });
      }

      // Refresh the profiles list
      await refetchProfiles();
      
    } catch (error) {
      console.error('💥 Unexpected error during user deletion:', error);
      toast({
        title: "❌ Unexpected Error",
        description: `An unexpected error occurred while deleting ${userName}. Please try again.`,
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
      phone_number: user.phone_number || '',
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
          phone_number: editUserData.phone_number.trim() || null,
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
        phone_number: '',
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
          <p className="text-slate-600">Loading system data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header with Statistics and Search */}
      <SuperAdminHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefresh}
        organizationsCount={organizations.length}
        usersCount={profiles.length}
        departmentsCount={departments.length}
        filteredOrganizationsCount={filteredOrganizations.length}
        filteredUsersCount={filteredProfiles.length}
      />

      {/* Quick Actions */}
      <QuickActions
        onCreateOrganization={() => setShowCreateOrg(!showCreateOrg)}
        onCreateUser={() => setShowCreateUser(!showCreateUser)}
        isCreatingOrg={isCreatingOrg}
        isCreatingUser={isCreatingUser}
      />

      <div className="p-6 space-y-8">
        {/* Create Organization Form */}
        {showCreateOrg && (
          <CreateOrganizationForm
            isCreating={isCreatingOrg}
            onCancel={() => setShowCreateOrg(false)}
            onSubmit={handleCreateOrganization}
          />
        )}

        {/* Create User Form */}
        {showCreateUser && (
          <CreateUserForm
            isCreating={isCreatingUser}
            organizations={organizations}
            onCancel={() => setShowCreateUser(false)}
            onSubmit={handleCreateUser}
          />
        )}

        {/* Edit User Dialog */}
        <EditUserDialog
          user={editingUser}
          isUpdating={isUpdatingUser}
          organizations={organizations}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
        />

        {/* Organizations List */}
        <OrganizationsList
          organizations={filteredOrganizations}
          profiles={profiles}
          departments={departments}
          deletingOrgId={deletingOrgId}
          onDelete={handleDeleteOrganization}
        />

        {/* Users List */}
        <UsersList
          users={filteredProfiles}
          organizations={organizations}
          deletingUserId={deletingUserId}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          getUserOrganization={getUserOrganization}
        />

        {/* Success Alert */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            🚀 <strong>Enhanced Management Active:</strong> Complete system with phone numbers, organization numbers, 
            auto-generated tracking IDs, aliases, and powerful search functionality. Professional interface with 
            real-time updates and comprehensive user management.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
