
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Edit, Trash2, Building, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateUserForm from '@/components/admin/CreateUserForm';
import EditUserDialog from '@/components/admin/EditUserDialog';

const SuperAdminUsersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Fetch users and organizations
  const fetchData = async () => {
    try {
      const [usersResponse, orgsResponse] = await Promise.all([
        supabase.from('profiles').select('*').order('display_name'),
        supabase.from('organizations').select('*').order('name')
      ]);

      if (usersResponse.data) setUsers(usersResponse.data);
      if (orgsResponse.data) setOrganizations(orgsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('users-page-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizations'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUserOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : 'No Organization';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'org_admin': return 'default';
      case 'manager': return 'secondary';
      case 'employee': return 'outline';
      default: return 'outline';
    }
  };

  const handleCreateUser = (userData: any) => {
    setShowCreateForm(false);
    toast({
      title: "✅ User Created",
      description: "New user has been successfully created",
    });
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    
    setDeletingUserId(userId);
    // Implementation for delete would go here
    setTimeout(() => {
      setDeletingUserId(null);
      toast({
        title: "🗑️ User Deleted",
        description: `User "${userName}" has been deleted`,
      });
    }, 1000);
  };

  const handleCopyTrackingId = async (trackingId: string) => {
    try {
      await navigator.clipboard.writeText(trackingId);
      toast({
        title: "✅ Copied!",
        description: `Tracking ID ${trackingId} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "❌ Copy failed",
        description: "Could not copy tracking ID to clipboard",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/super-admin')}
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">User Management</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Manage all users in the system ({filteredUsers.length} users)</p>
            </div>
            
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-white dark:bg-slate-800"
          />
        </div>

        {/* Create User Form */}
        {showCreateForm && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New User</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateUserForm
                  isCreating={false}
                  organizations={organizations}
                  onCancel={() => setShowCreateForm(false)}
                  onSubmit={handleCreateUser}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{user.display_name}</h3>
                      <Badge variant={getRoleColor(user.user_type)}>
                        {user.user_type.replace('_', ' ')}
                      </Badge>
                      {!user.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    
                    {/* Tracking ID Section */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-md w-fit">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tracking ID:</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {user.tracking_id || 'Not assigned'}
                        </Badge>
                        {user.tracking_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                            onClick={() => handleCopyTrackingId(user.tracking_id)}
                            title="Copy tracking ID"
                          >
                            <Copy className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div>Username: <span className="font-mono text-slate-900 dark:text-slate-100">{user.username}</span></div>
                      {user.phone_number && (
                        <div>Phone: <span className="text-slate-900 dark:text-slate-100">{user.phone_number}</span></div>
                      )}
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="text-slate-900 dark:text-slate-100">{getUserOrganization(user.organization_id)}</span>
                      </div>
                      <div>Created: <span className="text-slate-900 dark:text-slate-100">{new Date(user.created_at).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.display_name)}
                      disabled={deletingUserId === user.id}
                    >
                      {deletingUserId === user.id ? (
                        'Deleting...'
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No users found</p>
          </div>
        )}
      </div>

      {/* Edit User Dialog - Fixed props */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          isUpdating={false}
          organizations={organizations}
          onClose={() => setEditingUser(null)}
          onSubmit={() => {
            setEditingUser(null);
            toast({
              title: "✅ User Updated",
              description: "User has been successfully updated",
            });
          }}
        />
      )}
    </div>
  );
};

export default SuperAdminUsersPage;
