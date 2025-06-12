import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Shield, Building2, UserCog, Mail, Calendar, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PendingUser {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Organisation {
  id: string;
  name: string;
}

const UserManagement = () => {
  const { user, profile } = useSupabaseAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningRole, setAssigningRole] = useState<string | null>(null);

  // Check if user is super admin
  const isSuperAdmin = profile?.role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchPendingUsers();
      fetchOrganisations();
    }
  }, [isSuperAdmin]);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_users');
      
      if (error) {
        console.error('Error fetching pending users:', error);
        toast({
          title: "Error",
          description: "Failed to load pending users",
          variant: "destructive",
        });
        return;
      }

      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganisations = async () => {
    try {
      const { data, error } = await supabase
        .from('organisations')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching organisations:', error);
        return;
      }

      setOrganisations(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const assignRole = async (userId: string, role: string, organisationId?: string) => {
    setAssigningRole(userId);
    
    try {
      const { data, error } = await supabase.rpc('assign_user_role', {
        target_user_id: userId,
        new_role: role,
        organisation_id: organisationId || null
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Role Assigned",
        description: `User role updated to ${role}`,
      });

      // Refresh pending users list
      fetchPendingUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setAssigningRole(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Shield className="w-4 h-4" />;
      case 'org_admin': return <Building2 className="w-4 h-4" />;
      case 'manager': return <UserCog className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'org_admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isSuperAdmin) {
    return (
      <Alert>
        <Shield className="w-4 h-4" />
        <AlertDescription>
          Access denied. Only super administrators can manage users.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading user management...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            User Role Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Assign roles to users who have registered via GitHub OAuth. 
            New users are automatically assigned as 'employee' until you update their role.
          </p>

          {pendingUsers.length === 0 ? (
            <Alert>
              <Users className="w-4 h-4" />
              <AlertDescription>
                No pending users found. All registered users have been assigned appropriate roles.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <UserCard
                  key={user.user_id}
                  user={user}
                  organisations={organisations}
                  onAssignRole={assignRole}
                  isAssigning={assigningRole === user.user_id}
                  getRoleIcon={getRoleIcon}
                  getRoleBadgeColor={getRoleBadgeColor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface UserCardProps {
  user: PendingUser;
  organisations: Organisation[];
  onAssignRole: (userId: string, role: string, organisationId?: string) => void;
  isAssigning: boolean;
  getRoleIcon: (role: string) => React.ReactNode;
  getRoleBadgeColor: (role: string) => string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  organisations,
  onAssignRole,
  isAssigning,
  getRoleIcon,
  getRoleBadgeColor
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('employee');
  const [selectedOrganisation, setSelectedOrganisation] = useState<string>('');

  const handleAssign = () => {
    onAssignRole(user.user_id, selectedRole, selectedOrganisation || undefined);
  };

  const needsOrganisation = ['org_admin', 'manager'].includes(selectedRole);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{user.full_name}</span>
              </div>
              <Badge className={getRoleBadgeColor(user.role)}>
                {getRoleIcon(user.role)}
                <span className="ml-1">{user.role}</span>
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              {user.email}
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              Registered: {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="org_admin">Org Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>

            {needsOrganisation && (
              <Select value={selectedOrganisation} onValueChange={setSelectedOrganisation}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select org..." />
                </SelectTrigger>
                <SelectContent>
                  {organisations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={handleAssign}
              disabled={isAssigning || (needsOrganisation && !selectedOrganisation)}
              size="sm"
            >
              {isAssigning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Assign'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
