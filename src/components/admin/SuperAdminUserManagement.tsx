import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, CheckCircle, Clock4, Building2, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import EditUserDialog from './EditUserDialog';
import OrganisationsList from './OrganisationsList';
import UsersList from './UsersList';
import HistoryButton from './HistoryButton';
import { createOrganizationAsAdmin, fetchProfilesAsAdmin, fetchOrganizationsAsAdmin } from '@/lib/superAdminDataAccess';
import { adminUserOperations, hasAdminAccess } from '@/lib/supabaseAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import CreateUserForm from './CreateUserForm';
import CreateOrganisationForm from './CreateOrganisationForm';
import { ActionTile, AdminField, EmptyStatePanel, SectionHeader, StatCard } from './design';
import { getActionDataAttributes } from '@/config/superAdminActionRegistry';

interface User {
  id: number | string;
  user_id?: string;
  username: string;
  display_name: string;
  email?: string;
  user_type: string;
  organisation_id?: string;
  organization_id?: string;
  department_id?: string;
  is_active: boolean;
  created_at: string;
  tracking_id?: string;
  phone_number?: string;
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
  settings_json?: Record<string, unknown>;
  tracking_id?: string;
}

interface Department {
  id: string;
  name: string;
  organisation_id: string;
  created_at: string;
}

type SuperAdminView = 'overview' | 'users' | 'organizations' | 'create-user' | 'create-org';

export default function SuperAdminUserManagement() {
  const { profile } = useSupabaseAuth();
  const { toast } = useToast();

  const [activeView, setActiveView] = useState<SuperAdminView>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [recentLogins, setRecentLogins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const [usersData, organizationsData, departmentsResult, sessionsResult] = await Promise.all([
        fetchProfilesAsAdmin(),
        fetchOrganizationsAsAdmin(),
        supabase.from('departments').select('*').order('name'),
        supabase
          .from('session_logs')
          .select('action, success, created_at')
          .gte('created_at', yesterday.toISOString()),
      ]);

      if (departmentsResult.error) {
        throw departmentsResult.error;
      }

      if (sessionsResult.error) {
        throw sessionsResult.error;
      }

      const successfulLogins = sessionsResult.data?.filter((log) => log.action === 'login' && log.success).length || 0;

      setUsers(usersData || []);
      setOrganizations(organizationsData || []);
      setDepartments((departmentsResult.data || []) as Department[]);
      setRecentLogins(successfulLogins);
    } catch (error) {
      console.error('Failed to load super admin dashboard data:', error);
      toast({
        title: '⚠️ Data Load Error',
        description: 'Some super admin data failed to load. Try refreshing.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.is_active).length;
    const totalOrganizations = organizations.length;

    return {
      totalUsers,
      activeUsers,
      totalOrganizations,
      recentLogins,
    };
  }, [organizations.length, recentLogins, users]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        [user.display_name, user.username, user.user_type]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedSearch)),
      ),
    [normalizedSearch, users],
  );

  const filteredOrganizations = useMemo(
    () =>
      organizations.filter((organization) =>
        [organization.name, organization.alias]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedSearch)),
      ),
    [normalizedSearch, organizations],
  );

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
    setEditingUser({
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
      created_at: user.created_at,
    });
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
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: userData.username.trim(),
          display_name: userData.display_name.trim(),
          phone_number: userData.phone_number.trim() || null,
          user_type: userData.user_type,
          organisation_id: userData.organization_id,
        })
        .eq('id', Number(editingUser.id));

      if (profileError) {
        throw profileError;
      }

      if (userData.new_password?.trim()) {
        const passwordResult = await adminUserOperations.updateUserPassword(String(editingUser.id), userData.new_password.trim());
        if (!passwordResult.success) {
          throw new Error(passwordResult.error || 'Failed to update password');
        }
      }

      toast({
        title: '✅ User Updated',
        description: `User "${userData.display_name}" has been updated.`,
      });

      setEditingUser(null);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: '❌ Update Error',
        description: 'Could not update user profile. Please retry.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const result = await adminUserOperations.deleteUser(userId);
      if (!result.success) {
        throw new Error(result.error || 'Deletion failed');
      }

      toast({
        title: '✅ User Deleted',
        description: `User "${userName}" was removed successfully.`,
      });

      await loadDashboardData();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: '❌ Deletion Error',
        description: `Failed to delete ${userName}.`,
        variant: 'destructive',
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDeleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Delete organisation "${orgName}" and related records? This cannot be undone.`)) {
      return;
    }

    setDeletingOrgId(orgId);
    try {
      const { data, error } = await supabase.rpc('safe_delete_organisation', {
        org_id: orgId,
      });

      if (error || (data && !data.success)) {
        throw error || new Error(data?.message || 'Deletion failed');
      }

      toast({
        title: '✅ Organisation Deleted',
        description: `Organisation "${orgName}" and related data were removed.`,
      });

      await loadDashboardData();
    } catch (error) {
      console.error('Failed to delete organisation:', error);
      toast({
        title: '❌ Deletion Error',
        description: 'Failed to delete organisation.',
        variant: 'destructive',
      });
    } finally {
      setDeletingOrgId(null);
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
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userData.organisation_id)) {
      toast({
        title: '❌ Invalid Organisation ID',
        description: 'Selected organisation ID is invalid. Refresh and retry.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      if (!hasAdminAccess()) {
        toast({
          title: '⚠️ Limited Admin Access',
          description: 'Using fallback user creation mode.',
        });
      }

      const result = await adminUserOperations.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          username: userData.username,
          display_name: userData.display_name,
          user_type: userData.user_type,
          organisation_id: userData.organisation_id,
          department_id: userData.department_id,
          phone_number: userData.phone_number,
          created_by: profile?.id?.toString(),
        },
        email_confirm: true,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create user');
      }

      toast({
        title: '✅ User Created',
        description: `User "${userData.display_name}" created successfully.`,
      });

      await loadDashboardData();
      setActiveView('users');
    } catch (error) {
      console.error('Failed to create user:', error);
      toast({
        title: '❌ User Creation Error',
        description: 'Could not create user. Please retry.',
        variant: 'destructive',
      });
    } finally {
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
      const actorId = profile?.user_id || profile?.id?.toString() || null;
      const { error } = await createOrganizationAsAdmin(orgData, actorId);

      if (error) {
        throw error;
      }

      toast({
        title: '✅ Organisation Created',
        description: `Organisation "${orgData.name}" created successfully.`,
      });

      await loadDashboardData();
      setActiveView('organizations');
    } catch (error) {
      console.error('Failed to create organization:', error);
      toast({
        title: '❌ Organisation Creation Error',
        description: 'Could not create organisation. Please retry.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getUserOrganization = (orgId: string) => organizations.find((organization) => organization.id === orgId)?.name || 'Unknown';

  const renderHeaderActions = () => (
    <div className="flex flex-wrap items-end gap-3">
      <AdminField
        id="super-admin-search"
        label={activeView === 'organizations' ? 'Search organisations' : 'Search users'}
        helperText={
          activeView === 'organizations'
            ? 'Filter by name or alias.'
            : 'Filter by display name, username, or role.'
        }
        className="w-full min-w-[220px] sm:w-80"
      >
        <Input
          id="super-admin-search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={
            activeView === 'organizations'
              ? 'Example: MinaTid Downtown'
              : 'Example: amina, manager, @username'
          }
          className="sa-focus-ring border-[hsl(var(--sa-border)/0.42)] bg-[hsl(var(--sa-surface-1)/0.7)] text-[hsl(var(--sa-text-primary))] placeholder:text-[hsl(var(--sa-text-secondary))]"
          {...getActionDataAttributes(activeView === 'organizations' ? 'organisations.search' : 'users.search')}
        />
      </AdminField>

      <Button
        type="button"
        onClick={() => setActiveView(activeView === 'organizations' ? 'create-org' : 'create-user')}
        className="sa-focus-ring bg-[hsl(var(--sa-accent))] text-[hsl(var(--sa-accent-foreground))] hover:bg-[hsl(var(--sa-accent)/0.9)]"
        {...getActionDataAttributes(activeView === 'organizations' ? 'organisations.create' : 'users.create')}
      >
        {activeView === 'organizations' ? 'Add Organisation' : 'Add User'}
      </Button>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="sa-panel px-6 py-12 text-center">
          <p className="sa-text-16 text-[hsl(var(--sa-text-secondary))]">Loading super admin workspace…</p>
        </div>
      );
    }

    if (activeView === 'users') {
      return (
        <div className="space-y-6">
          <SectionHeader
            title="User Management"
            description="Manage user accounts, role assignments, and lifecycle actions."
            action={renderHeaderActions()}
          />

          {filteredUsers.length > 0 ? (
            <UsersList
              users={filteredUsers.map((user) => ({
                ...user,
                id: user.id?.toString() || 'unknown',
                organization_id: user.organisation_id || user.organization_id || '',
                tracking_id: user.tracking_id || '',
                phone_number: user.phone_number || '',
              }))}
              organizations={organizations}
              deletingUserId={deletingUserId}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              getUserOrganization={getUserOrganization}
            />
          ) : (
            <EmptyStatePanel
              title="No users match your filter"
              description="Try another keyword or create a new account to start building your workforce directory."
              actionLabel="Create User"
              actionId="users.create"
              onAction={() => setActiveView('create-user')}
            />
          )}
        </div>
      );
    }

    if (activeView === 'organizations') {
      return (
        <div className="space-y-6">
          <SectionHeader
            title="Organisation Management"
            description="Manage organisation records, ownership, and administration links."
            action={renderHeaderActions()}
          />

          <OrganisationsList
            organisations={filteredOrganizations}
            profiles={users}
            departments={departments}
            deletingOrgId={deletingOrgId}
            onDelete={handleDeleteOrganization}
          />
        </div>
      );
    }

    if (activeView === 'create-user') {
      return (
        <div className="space-y-6">
          <SectionHeader
            title="Create User"
            description="Provision a new account and assign role scope."
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveView('overview')}
                {...getActionDataAttributes('navigation.overview')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Overview
              </Button>
            }
          />
          <CreateUserForm
            isCreating={isCreating}
            organisations={organizations}
            onCancel={() => setActiveView('overview')}
            onSubmit={handleCreateUser}
          />
        </div>
      );
    }

    if (activeView === 'create-org') {
      return (
        <div className="space-y-6">
          <SectionHeader
            title="Create Organisation"
            description="Create a new organisation and activate it for user assignments."
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveView('overview')}
                {...getActionDataAttributes('navigation.overview')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Overview
              </Button>
            }
          />
          <CreateOrganisationForm
            isCreating={isCreating}
            onCancel={() => setActiveView('overview')}
            onSubmit={handleCreateOrganization}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Users" value={stats.totalUsers} note={`${stats.activeUsers} active`} icon={<Users className="h-4 w-4" />} tone="accent" />
          <StatCard label="Active Users" value={stats.activeUsers} note={`${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% active rate`} icon={<CheckCircle className="h-4 w-4" />} tone="success" />
          <StatCard label="Organisations" value={stats.totalOrganizations} note={stats.totalOrganizations ? `${Math.round(stats.totalUsers / stats.totalOrganizations)} avg users/org` : 'No organisations yet'} icon={<Building2 className="h-4 w-4" />} tone="neutral" />
          <StatCard label="Recent Logins" value={stats.recentLogins} note="Last 24 hours" icon={<Clock4 className="h-4 w-4" />} tone="warning" />
        </div>

        <Card className="sa-panel border-[hsl(var(--sa-border)/0.35)] bg-[hsl(var(--sa-surface-1)/0.75)]">
          <CardHeader className="pb-2">
            <CardTitle className="sa-text-20 text-[hsl(var(--sa-text-primary))]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <ActionTile
              actionId="overview.manage-users"
              title="Manage Users"
              description="Search, edit, and remove user accounts."
              icon={<Users className="h-4 w-4" />}
              onClick={() => setActiveView('users')}
            />
            <ActionTile
              actionId="overview.manage-organisations"
              title="Manage Organisations"
              description="Review organisation records and ownership."
              icon={<Building2 className="h-4 w-4" />}
              onClick={() => setActiveView('organizations')}
            />
            <ActionTile
              actionId="overview.create-user"
              title="Create User"
              description="Provision a new account with role assignment."
              icon={<Users className="h-4 w-4" />}
              tone="success"
              onClick={() => setActiveView('create-user')}
            />
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="sa-text-18 font-semibold text-[hsl(var(--sa-text-primary))]">System Activity</h3>
          <HistoryButton variant="default" size="default" showBadge={true} />
        </div>

        <Alert className="border-emerald-400/30 bg-emerald-500/10">
          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-200">
            <strong>System Status: Operational.</strong> All core services are healthy and data sync is active.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderContent()}

      {editingUser ? (
        <EditUserDialog
          user={{
            ...editingUser,
            organization_id: editingUser.organisation_id || '',
            displayName: editingUser.display_name,
            userType: editingUser.user_type,
            organizationId: editingUser.organisation_id || '',
            departmentId: editingUser.department_id || '',
            isActive: editingUser.is_active,
          }}
          isUpdating={isUpdatingUser}
          organizations={organizations}
          onClose={() => setEditingUser(null)}
          onSubmit={handleEditUserSubmit}
        />
      ) : null}
    </div>
  );
}
