
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

interface Organization {
  id: string;
  name: string;
  alias: string | null;
  description: string | null;
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            User & Organization Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage users and organizations across the system
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <HistoryButton 
            variant="outline" 
            size="default"
            showBadge={true}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
          />
          <Button
            onClick={() => setActiveTab('create-org')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Building className="w-4 h-4 mr-2" />
            New Organization
          </Button>
          <Button
            onClick={() => setActiveTab('create-user')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            New User
          </Button>
        </div>
      </div>

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

      {/* Organizations List */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Organizations Section */}
          <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Organizations ({organizations.length})
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {organizations.filter(org => org.users?.length > 0).length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <OrganizationsList
                organizations={organizations}
                onRefresh={fetchOrganizations}
                loading={loading}
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
                    All Users ({allUsers.length})
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {allUsers.filter(user => user.is_active).length} Active
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
                users={allUsers}
                organizations={organizations}
                onRefresh={fetchUsers}
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
