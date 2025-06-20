
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, Edit, Trash2, Phone, Building, Calendar, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  display_name: string;
  user_type: string;
  organization_id?: string;
  phone_number?: string;
  tracking_id?: string;
  created_at: string;
  is_active: boolean;
}

interface UsersListProps {
  users: User[];
  organizations: Array<{
    id: string;
    name: string;
  }>;
  deletingUserId: string | null;
  onEdit: (user: User) => void;
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
  const { toast } = useToast();

  // Add debugging
  console.log('🔍 UsersList received data:', {
    usersCount: users?.length || 0,
    organizationsCount: organizations?.length || 0,
    firstUser: users?.[0] || null
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'org_admin': return 'default';
      case 'manager': return 'secondary';
      case 'employee': return 'outline';
      default: return 'outline';
    }
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

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div 
          key={user.id} 
          className="p-6 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 shadow-sm"
        >
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
              
              {/* Tracking ID Section - Always visible */}
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
                      onClick={() => handleCopyTrackingId(user.tracking_id!)}
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
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="text-slate-900 dark:text-slate-100">{user.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  <span className="text-slate-900 dark:text-slate-100">{getUserOrganization(user.organization_id!)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-slate-900 dark:text-slate-100">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="hover:bg-blue-50 hover:border-blue-300"
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
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No users found
        </div>
      )}
    </div>
  );
}
