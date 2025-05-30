import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, UserPlus } from 'lucide-react';
import CreateOrganizationForm from './CreateOrganizationForm';
import CreateUserForm from './CreateUserForm';
import OrganizationsList from './OrganizationsList';
import UsersList from './UsersList';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import HistoryButton from './HistoryButton';
import SuperAdminHeader from './SuperAdminHeader';

interface Organization {
  id: string;
  name: string;
  alias: string | null;
  description: string | null;
  organization_number: string | null;
  created_at: string;
  users?: { id: string }[];
}

interface User {
  id: string;
  username: string;
  display_name: string;
  user_type: string;
  organization_id: string;
  department_id: string;
  is_active: boolean;
  tracking_id: string | null;
  phone_number: string | null;
  created_at: string;
}

type ActiveTab = 'list' | 'create-org' | 'create-user';

export default function RoleBasedUserManagement() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
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
  }, [toast]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "❌ Error fetching users",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

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
  }, [toast]);

  useEffect(() => {
    fetchOrganizations();
    fetchUsers();
  }, [fetchOrganizations, fetchUsers]);

  // Clean search term to handle pasted content safely
  const cleanSearchTerm = searchTerm.replace(/[^\w\s-]/g, '').trim();

  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
    (org.alias && org.alias.toLowerCase().includes(cleanSearchTerm.toLowerCase())) ||
    (org.organization_number && org.organization_number.toLowerCase().includes(cleanSearchTerm.toLowerCase())) ||
    (org.description && org.description.toLowerCase().includes(cleanSearchTerm.toLowerCase()))
  );

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user =>
    user.display_name.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
    (user.tracking_id && user.tracking_id.toLowerCase().includes(cleanSearchTerm.toLowerCase())) ||
    (user.phone_number && user.phone_number.includes(cleanSearchTerm))
  );

  const handleCreateOrg = async (orgData: { name: string; description: string; alias: string }) => {
    setIsCreatingOrg(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([
          {
            name: orgData.name,
            description: orgData.description,
            alias: orgData.alias
          }
        ]);

      if (error) {
        console.error('Error creating organization:', error);
        toast({
          title: "❌ Error creating organization",
          description: error.message,
          variant: "destructive"
        });
        return;
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
    organization_id: string;
    department_id: string;
  }) => {
    setIsCreatingUser(true);
    try {
      // Call the Supabase function to create the user
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
        <CreateOrganizationForm
          isCreating={isCreatingOrg}
          onCancel={() => setActiveTab('list')}
          onSubmit={handleCreateOrg}
        />
      )}

      {/* Create User Form */}
      {activeTab === 'create-user' && (
        <CreateUserForm
          isCreating={isCreatingUser}
          organizations={organizations}
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
              <OrganizationsList
                organizations={filteredOrganizations}
                profiles={allUsers}
                departments={[]}
                deletingOrgId={null}
                onDelete={() => {}}
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
                users={filteredUsers}
                organizations={organizations}
                deletingUserId={null}
                onEdit={() => {}}
                onDelete={() => {}}
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
