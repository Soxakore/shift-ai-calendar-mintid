
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, Edit, Trash2, Phone, Building, Calendar } from 'lucide-react';

interface UsersListProps {
  users: Array<{
    id: string;
    username: string;
    display_name: string;
    user_type: string;
    organization_id?: string;
    phone_number?: string;
    tracking_id?: string;
    created_at: string;
    is_active: boolean;
  }>;
  organizations: Array<{
    id: string;
    name: string;
  }>;
  deletingUserId: string | null;
  onEdit: (user: any) => void;
  onDelete: (userId: string, userName: string) => void;
  getUserOrganization: (orgId: string) => string;
}

export default function UsersList({
  users,
  organizations,
  deletingUserId,
  onEdit,
  onDelete,
  getUserOrganization
}: UsersListProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'org_admin': return 'default';
      case 'manager': return 'secondary';
      case 'employee': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Users ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="p-4 border rounded-lg hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{user.display_name}</h3>
                    <Badge variant={getRoleColor(user.user_type)}>
                      {user.user_type.replace('_', ' ')}
                    </Badge>
                    {!user.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                    {user.tracking_id && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {user.tracking_id}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                    <div>Username: <span className="font-mono">{user.username}</span></div>
                    {user.phone_number && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.phone_number}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {getUserOrganization(user.organization_id!)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(user.id, user.display_name)}
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
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No users found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
