
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { User, Trash2, Edit, Phone, Calendar, IdCard } from 'lucide-react';

interface UsersListProps {
  users: any[];
  organizations: any[];
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
  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'super_admin': return 'bg-red-500 text-white';
      case 'org_admin': return 'bg-blue-500 text-white';
      case 'manager': return 'bg-green-500 text-white';
      case 'employee': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Users ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-foreground">{user.display_name}</h3>
                  <Badge className={getUserTypeColor(user.user_type)}>
                    {user.user_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {user.tracking_id && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <IdCard className="h-3 w-3" />
                      {user.tracking_id}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>Username: <strong className="text-foreground">{user.username}</strong></div>
                  <div>Organization: <strong className="text-foreground">{getUserOrganization(user.organization_id)}</strong></div>
                  {user.phone_number && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {user.phone_number}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                  onClick={() => onDelete(user.id, user.username)}
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
          ))}
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
