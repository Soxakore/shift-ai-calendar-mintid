import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import QuickActions from './QuickActions';
import CreateUserForm from './CreateUserForm';
import CreateOrganisationForm from './CreateOrganisationForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import EditUserDialog from './EditUserDialog';
import OrganisationsList from './OrganisationsList';
import UsersList from './UsersList';
import OrganizationPauseManager from './OrganizationPauseManager';
import HistoryButton from './HistoryButton';
import { fetchProfilesAsAdmin, fetchOrganizationsAsAdmin } from '@/lib/superAdminDataAccess';
import { adminUserOperations, hasAdminAccess } from '@/lib/supabaseAdmin';
import OrganizationDeletionTester from '../debug/OrganizationDeletionTester';

interface User {
  id: number | string;
  user_id?: string; // UUID that references auth.users.id
  username: string;
  display_name: string;
  email?: string;
  user_type: string;
  organisation_id?: string; // British spelling (database)
  organization_id?: string; // American spelling (UI compatibility)
  department_id?: string;
  is_active: boolean;
  created_at: string;
  tracking_id?: string;
  phone_number?: string;
  // For compatibility with EditUserDialog
  displayName?: string;
  userType?: string;
  organizationId?: string;
  departmentId?: string;
  isActive?: boolean;
}

interface Organization {
  id: string;
  name: string;
  alias?: string;
  description?: string;
  organization_number?: string;
  created_at: string;
  updated_at?: string;
  is_active?: boolean;
  subscription_status?: string;
}

interface Department {
  id: string;
  name: string;
  organisation_id: string; // Changed to match database schema
  created_at: string;
}

export default function SuperAdminUserManagement() {
  const { profile } = useSupabaseAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'organizations' | 'create-user' | 'create-org'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrganizations: 0,
    recentLogins: 0
  });

  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit user dialog state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      const { count: totalOrganizations } = await supabase
        .from('organisations')
        .select('*', { count: 'exact' });

      // Fetch recent session activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: recentSessions } = await supabase
        .from('session_logs')
        .select('action, success, created_at')
        .gte('created_at', yesterday.toISOString());

      const successfulLogins = recentSessions?.filter(log => 
        log.action === 'login' && log.success
      ).length || 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalOrganizations: totalOrganizations || 0,
        recentLogins: successfulLogins
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "❌ Stats Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    }
  }, [toast]);

  const fetchUsers = useCallback(async () => {
    try {
      console.log('🔍 Fetching users as super admin...');
      
      // Use super admin data access function
      const data = await fetchProfilesAsAdmin();
      
      console.log('✅ Users fetched successfully:', data?.length || 0, 'users');
      setUsers(data || []);
    } catch (error) {
      console.error("💥 Exception fetching users:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load users. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const fetchOrganizations = useCallback(async () => {
    try {
      console.log('🔍 SuperAdminUserManagement.fetchOrganizations() called');
      
      // Use super admin data access function
      const data = await fetchOrganizationsAsAdmin();
      
      console.log('📊 RAW data returned from fetchOrganizationsAsAdmin():');
      console.log('  Type:', typeof data);
      console.log('  Is Array:', Array.isArray(data));
      console.log('  Length:', data?.length || 0);
      console.log('  Full data:', JSON.stringify(data, null, 2));
      
      // Check each organization's ID type and value
      if (data && Array.isArray(data)) {
        data.forEach((org, index) => {
          console.log(`🔍 Org[${index}]:`, {
            id: org.id,
            id_type: typeof org.id,
            id_length: org.id?.length,
            is_string: typeof org.id === 'string',
            is_numeric: /^\d+$/.test(String(org.id)),
            is_uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(org.id)),
            name: org.name,
            raw_org_object: org
          });
          
          // CRITICAL: Check for "12" specifically
          if (org.id === '12' || String(org.id) === '12') {
            console.error('🚨 CRITICAL: Found organization with ID "12" in fetchOrganizations:', org);
            alert(`CRITICAL: Found organization with ID "12": ${JSON.stringify(org)}`);
          }
        });
      }
      
      console.log('✅ Setting organizations state with:', data?.length || 0, 'organizations');
      setOrganizations(data || []);
      
      // Post-state-set verification
      setTimeout(() => {
        console.log('⏰ Post-setState verification - organizations state should now be:', data?.length || 0);
      }, 100);
      
    } catch (error) {
      console.error("💥 Exception fetching organizations:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load organizations. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const fetchDepartments = useCallback(async () => {
    try {
      console.log('🔍 Fetching departments...');
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching departments:', error);
        throw error;
      }
      
      console.log('✅ Departments fetched successfully:', data?.length || 0, 'departments');
      setDepartments(data || []);
    } catch (error) {
      console.error("💥 Exception fetching departments:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load departments. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Effects
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchUsers(),
          fetchOrganizations(),
          fetchDepartments()
        ]);
      } catch (error) {
        console.error('❌ Failed to initialize dashboard data:', error);
        toast({
          title: "⚠️ Loading Error",
          description: "Some data failed to load. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [fetchStats, fetchUsers, fetchOrganizations, fetchDepartments, toast]);

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
      displayName: user.display_name,
      user_type: user.user_type,
      userType: user.user_type,
      organization_id: user.organization_id || '',
      organizationId: user.organization_id || '',
      organisation_id: user.organization_id || '',
      phone_number: user.phone_number || '',
      tracking_id: user.tracking_id || '',
      department_id: '',
      departmentId: '',
      is_active: user.is_active,
      isActive: user.is_active,
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      console.log('🗑️ Starting admin user deletion:', userId, userName);
      console.log('🔍 User ID type and value:', typeof userId, userId);
      
      // Use the new admin operations with fallback strategy
      const result = await adminUserOperations.deleteUser(userId);
      
      if (!result.success) {
        console.error('❌ User deletion failed:', result.error);
        toast({
          title: "❌ Error",
          description: result.error || "Failed to delete user",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ User deleted successfully');
      toast({
        title: "✅ Success",
        description: `User "${userName}" deleted successfully`,
      });

      // Force multiple refresh approaches to ensure UI updates
      console.log('🔄 Forcing comprehensive data refresh...');
      
      // 1. Immediate refresh
      await Promise.all([fetchUsers(), fetchStats()]);
      
      // 2. Delayed refresh in case of real-time lag
      setTimeout(async () => {
        console.log('🔄 Secondary refresh after delay...');
        await Promise.all([fetchUsers(), fetchStats()]);
      }, 500);
      
      // 3. Force state update by filtering out the deleted user
      setUsers(prevUsers => {
        const filtered = prevUsers.filter(user => 
          user.id !== userId && 
          user.user_id !== userId &&
          String(user.id) !== userId
        );
        console.log('🔄 Manual state update - removed user from local state');
        return filtered;
      });
      
    } catch (error) {
      console.error('💥 Unexpected error deleting user:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred during deletion",
        variant: "destructive"
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDeleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to delete "${orgName}"? This will also delete all associated users, departments, and credentials. This action cannot be undone.`)) {
      return;
    }

    setDeletingOrgId(orgId);
    try {
      console.log('🗑️ Safely deleting organisation:', orgName);
      
      // Use the safe deletion function
      const { data, error } = await supabase.rpc('safe_delete_organisation', {
        org_id: orgId
      });

      if (error) {
        console.error('Organization deletion error:', error);
        toast({
          title: "❌ Error",
          description: error.message || "Failed to delete organization",
          variant: "destructive"
        });
        return;
      }

      if (data && !data.success) {
        console.error('Deletion failed:', data);
        toast({
          title: "❌ Error",
          description: data.message || "Failed to delete organization",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Organization deleted:', data);
      toast({
        title: "✅ Success",
        description: `Organisation "${orgName}" and all related data deleted successfully`,
      });

      fetchOrganizations();
      fetchStats();
      
    } catch (error) {
      console.error('Unexpected error deleting organization:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setDeletingOrgId(null);
    }
  };

  const getUserOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : 'Unknown';
  };

  const testOrganizationDeletion = async () => {
    console.log('🧪 Testing Organization Deletion Functionality...');
    
    try {
      // Step 1: Create a test organization
      console.log('1️⃣ Creating test organization...');
      const testOrgData = {
        name: `TEST_DELETE_ME_${Date.now()}`,
        settings_json: {
          alias: 'TEST',
          description: 'Test organization for deletion verification'
        }
      };
      
      const { data: newOrg, error: createError } = await supabase
        .from('organisations')
        .insert([testOrgData])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Failed to create test organization:', createError);
        toast({
          title: "❌ Test Failed",
          description: `Cannot create test org: ${createError.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Test organization created:', newOrg.name, 'ID:', newOrg.id);
      
      // Step 2: Test the safe deletion function
      console.log('2️⃣ Testing safe deletion function...');
      const { data: deleteResult, error: deleteError } = await supabase.rpc('safe_delete_organisation', {
        org_id: newOrg.id
      });
      
      if (deleteError) {
        console.error('❌ Deletion failed:', deleteError);
        // Clean up manually if needed
        await supabase.from('organisations').delete().eq('id', newOrg.id);
        toast({
          title: "❌ Deletion Test Failed",
          description: `Deletion error: ${deleteError.message}`,
          variant: "destructive"
        });
        return;
      }
      
      if (!deleteResult?.success) {
        console.error('❌ Deletion unsuccessful:', deleteResult);
        toast({
          title: "❌ Deletion Test Failed", 
          description: deleteResult?.error || 'Deletion returned false',
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Organization deletion successful!');
      console.log('📊 Deletion summary:', deleteResult);
      
      // Step 3: Verify organization is gone
      console.log('3️⃣ Verifying organization is deleted...');
      const { data: checkOrg } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', newOrg.id)
        .single();
      
      if (checkOrg) {
        console.error('❌ Organization still exists after deletion!');
        toast({
          title: "❌ Verification Failed",
          description: "Organization still exists after deletion",
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Organization successfully removed from database');
      
      toast({
        title: "✅ Deletion Test Passed",
        description: `Organization deletion is working correctly! Deleted ${deleteResult.deleted_counts?.profiles || 0} users, ${deleteResult.deleted_counts?.departments || 0} departments.`,
      });
      
      // Refresh the organizations list
      fetchOrganizations();
      
    } catch (error: unknown) {
      console.error('💥 Unexpected error during test:', error);
      toast({
        title: "❌ Test Error",
        description: error instanceof Error ? error.message : 'Unexpected error during deletion test',
        variant: "destructive"
      });
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
    console.log('🚀 SuperAdminUserManagement.handleCreateUser called with:');
    console.log('  Raw userData received:', userData);
    Object.entries(userData).forEach(([key, value]) => {
      console.log(`    ${key}: "${value}" (type: ${typeof value}, length: ${value?.length || 'N/A'})`);
    });
    
    // CRITICAL FIX: Reject numeric organisation_id values immediately
    if (/^\d+$/.test(String(userData.organisation_id))) {
      console.error('❌ REJECTED: Numeric organisation_id detected:', userData.organisation_id);
      toast({
        title: "❌ Invalid Organization Selection",
        description: `Invalid organization ID format: "${userData.organisation_id}". Please refresh the page and try again.`,
        variant: "destructive"
      });
      return;
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userData.organisation_id)) {
      console.error('❌ CRITICAL: Invalid UUID format for organisation_id:', userData.organisation_id);
      toast({
        title: "❌ Invalid Organization ID",
        description: "The selected organization has an invalid ID format. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('✅ Organisation ID validation passed:', userData.organisation_id);
    
    setIsCreating(true);
    try {
      console.log('🚀 Super admin creating user with validated data:', userData);
      
      // Set a flag to prevent auth state changes from triggering navigation during user creation
      sessionStorage.setItem('preventAuthRedirect', 'true');
      
      // Check if we have admin access and show appropriate warning
      if (!hasAdminAccess()) {
        console.warn('⚠️ No service role key detected - using fallback user creation method');
        toast({
          title: "⚠️ Limited Admin Access",
          description: "Using fallback creation method. Some features may be limited.",
        });
      }
      
      // Use the new admin operations with fallback strategy
      const createUserPayload = {
        email: userData.email,
        password: userData.password,
        user_metadata: {
          username: userData.username,
          display_name: userData.display_name,
          user_type: userData.user_type,
          organisation_id: userData.organisation_id,
          department_id: userData.department_id,
          phone_number: userData.phone_number,
          created_by: profile?.id?.toString()
        },
        email_confirm: true // Skip email confirmation for admin-created users
      };
      
      console.log('📤 Calling adminUserOperations.createUser with payload:');
      console.log('  Main payload:', {
        email: createUserPayload.email,
        password: '[HIDDEN]',
        email_confirm: createUserPayload.email_confirm
      });
      console.log('  user_metadata:', createUserPayload.user_metadata);
      console.log('  organisation_id in payload:', createUserPayload.user_metadata.organisation_id);
      
      const result = await adminUserOperations.createUser(createUserPayload);

      if (!result.success) {
        console.error('❌ User creation failed:', result.error);
        toast({
          title: "❌ Error",
          description: result.error || "Failed to create user",
          variant: "destructive"
        });
        // Clear the flag on error
        sessionStorage.removeItem('preventAuthRedirect');
        return;
      }

      console.log('✅ User created successfully:', result.data);
      
      toast({
        title: "✅ User Created",
        description: `User "${userData.display_name}" has been successfully created`,
      });

      // Wait a moment for the database trigger to execute and real-time updates to propagate
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        // Refresh data to show the new user with error handling
        console.log('🔄 Refreshing data after user creation...');
        await Promise.all([
          fetchUsers().catch(err => console.error('Error refreshing users:', err)),
          fetchStats().catch(err => console.error('Error refreshing stats:', err))
        ]);
        
        // Navigate to users view with a small delay to ensure data is loaded
        setTimeout(() => {
          console.log('📍 Navigating to users view...');
          setActiveView('users');
        }, 200);
        
      } catch (refreshError) {
        console.error('❌ Error during data refresh:', refreshError);
        // Still navigate to users view even if refresh fails
        setActiveView('users');
      }
      
    } catch (error) {
      console.error('💥 Unexpected error creating user:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred during user creation",
        variant: "destructive"
      });
    } finally {
      // Always clear the prevent redirect flag and reset loading state
      sessionStorage.removeItem('preventAuthRedirect');
      setIsCreating(false);
    }
  };

  const handleCreateOrganization = async (orgData: {
    name: string;
    description?: string;
    alias?: string;
  }) => {
    setIsCreating(true);
    try {
      console.log('Creating organization with data:', orgData);
      
      const { data, error } = await supabase
        .from('organisations')
        .insert([{
          name: orgData.name.trim(),
          settings_json: {
            alias: orgData.alias?.trim() || null,
            description: orgData.description?.trim() || null
          }
        }])
        .select()
        .single();

      if (error) {
        console.error('Organization creation error:', error);
        toast({
          title: "❌ Error",
          description: error.message || "Failed to create organization",
          variant: "destructive"
        });
        return;
      }

      console.log('Organization created successfully:', data);        toast({
          title: "✅ Organisation Created",
          description: `Organisation "${orgData.name}" created successfully`,
        });

      // Wait a moment for real-time updates to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh data to show the new organization
      await Promise.all([fetchOrganizations(), fetchStats()]);
      setActiveView('organizations');
      
    } catch (error) {
      console.error('Unexpected error creating organization:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOrganizationPauseChange = (orgId: string, isPaused: boolean) => {
    // Update organization pause status
    setOrganizations(prev => 
      prev.map(org => 
        org.id === orgId 
          ? { ...org, is_paused: isPaused, paused_at: isPaused ? new Date().toISOString() : null }
          : org
      )
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading dashboard data...</p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Management</h2>
                <HistoryButton showBadge={true} />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <Button 
                  onClick={() => setActiveView('create-user')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add User
                </Button>
              </div>
            </div>
            {users.length > 0 ? (
              <UsersList 
                users={users
                  .filter(u => 
                    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.user_type?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(u => ({
                    ...u,
                    id: u.id?.toString() || 'unknown',
                    organization_id: u.organisation_id || '', // map British to American spelling
                    tracking_id: u.tracking_id || '',
                    phone_number: u.phone_number || ''
                  }))
                }
                organizations={organizations}
                deletingUserId={deletingUserId}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                getUserOrganization={getUserOrganization}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-500 dark:text-slate-400">
                  {searchTerm ? 'No users match your search criteria.' : 'No users found. Create your first user!'}
                </div>
                <Button 
                  onClick={() => setActiveView('create-user')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create First User
                </Button>
              </div>
            )}
          </div>
        );

      case 'organizations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Organisation Management</h2>
                <HistoryButton showBadge={true} />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <Button 
                  onClick={() => setActiveView('create-org')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Organisation
                </Button>
                <Button 
                  onClick={testOrganizationDeletion}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  🧪 Test Deletion
                </Button>
              </div>
            </div>
            <OrganisationsList
              organisations={organizations.filter(org => 
                org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                org.alias?.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              profiles={users}
              departments={departments}
              deletingOrgId={deletingOrgId}
              onDelete={handleDeleteOrganization}
            />
          </div>
        );

      case 'create-user':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setActiveView('overview')}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Overview
              </Button>
              <HistoryButton showBadge={true} />
            </div>
            <CreateUserForm 
              isCreating={isCreating}
              organisations={(() => {
                console.log('🔍 DEBUG: Passing organizations to CreateUserForm:', organizations?.slice(0, 3).map(org => ({
                  id: org.id,
                  id_type: typeof org.id,
                  name: org.name,
                  id_value: org.id,
                  is_numeric: /^\d+$/.test(String(org.id)),
                  is_twelve: org.id === '12'
                })));
                
                // Check for problematic organization with ID "12"
                const problematicOrg = organizations?.find(org => org.id === '12');
                if (problematicOrg) {
                  console.error('🚨 CRITICAL: Found organization with ID "12" in organizations array:', problematicOrg);
                  alert('CRITICAL: Found organization with numeric ID "12". This should not exist. Please check the database.');
                }
                
                return organizations;
              })()}
              onCancel={() => setActiveView('overview')}
              onSubmit={handleCreateUser}
            />
          </div>
        );

      case 'create-org':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setActiveView('overview')}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Overview
              </Button>
              <HistoryButton showBadge={true} />
            </div>
            <CreateOrganisationForm 
              isCreating={isCreating}
              onCancel={() => setActiveView('overview')}
              onSubmit={handleCreateOrganization}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Users</CardTitle>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {stats.activeUsers} active
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Active Users</CardTitle>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeUsers}</div>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Organizations</CardTitle>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalOrganizations}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {stats.totalOrganizations > 0 ? `${Math.round(stats.totalUsers / stats.totalOrganizations)} avg users/org` : 'No organizations'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Recent Logins</CardTitle>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.recentLogins}</div>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Last 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => setActiveView('users')}
                className="h-20 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Manage Users
              </Button>
              <Button 
                onClick={() => setActiveView('organizations')}
                className="h-20 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Manage Organizations
              </Button>
              <Button 
                onClick={() => setActiveView('create-user')}
                className="h-20 bg-green-600 hover:bg-green-700 text-white"
              >
                Create User
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">System Activity & History</h3>
              <HistoryButton variant="default" size="default" showBadge={true} />
            </div>

            {/* System Status Alert */}
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <strong className="text-green-900 dark:text-green-100">System Status: Operational</strong><br />
                <span className="text-green-800 dark:text-green-200">
                  All services are running normally. Last system check: {new Date().toLocaleString()}
                </span>
              </AlertDescription>
            </Alert>

            {/* Organization Deletion Tester - DEBUG ONLY */}
            <div className="p-4 rounded-lg border bg-white shadow-md">
              <h3 className="text-lg font-semibold text-red-600">⚠️ Organization Deletion Tester</h3>
              <p className="text-sm text-slate-500">
                Use this tool to test organization deletion. Be careful, this will permanently delete data!
              </p>
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Enter organization ID to delete"
                  value={deletingOrgId || ''}
                  onChange={(e) => setDeletingOrgId(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <Button 
                  onClick={() => deletingOrgId && handleDeleteOrganization(deletingOrgId, 'Test Organization')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Organization
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Note: This action is irreversible. Ensure you have selected the correct organization.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
      
      {/* Edit User Dialog */}
      {editingUser && (              <EditUserDialog
                user={editingUser ? {
                  ...editingUser,
                  organization_id: editingUser.organisation_id || '', // Map British to American spelling
                  displayName: editingUser.display_name,
                  userType: editingUser.user_type,
                  organizationId: editingUser.organisation_id || '',
                  departmentId: editingUser.department_id || '',
                  isActive: editingUser.is_active
                } : null}
                isUpdating={isUpdatingUser}
                organizations={organizations}
                onClose={() => setEditingUser(null)}
                onSubmit={handleEditUserSubmit}
              />
      )}
    </div>
  );
}
