
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { 
  Users, Search, Filter, Download, Upload, 
  Trash2, Edit, MoreHorizontal, UserPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  display_name: string;
  user_type: string;
  organization_id: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

interface EnhancedUserManagementProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string, userName: string) => void;
  onBulkAction: (action: string, userIds: string[]) => void;
}

export default function EnhancedUserManagement({ 
  users, 
  onEdit, 
  onDelete, 
  onBulkAction 
}: EnhancedUserManagementProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.user_type === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} selected users?`)) {
      onBulkAction('delete', selectedUsers);
      setSelectedUsers([]);
    }
  };

  const handleBulkStatusChange = (status: 'activate' | 'deactivate') => {
    if (selectedUsers.length === 0) return;
    
    onBulkAction(status, selectedUsers);
    setSelectedUsers([]);
    toast({
      title: "✅ Bulk Action Complete",
      description: `${selectedUsers.length} users ${status}d successfully`,
    });
  };

  const exportUsers = () => {
    const csvContent = [
      ['Username', 'Display Name', 'Role', 'Status', 'Organization', 'Created'],
      ...filteredUsers.map(user => [
        user.username,
        user.display_name,
        user.user_type,
        user.is_active ? 'Active' : 'Inactive',
        user.organization_id,
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📊 Export Complete",
      description: "User data has been exported to CSV",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Enhanced User Management ({filteredUsers.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={exportUsers} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border rounded-md bg-blue-50 border-blue-300 text-blue-900 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="org_admin">Org Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-md bg-blue-50 border-blue-300 text-blue-900 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <span className="text-sm font-medium">
              {selectedUsers.length} users selected
            </span>
            <Button onClick={() => handleBulkStatusChange('activate')} variant="outline" size="sm">
              Activate
            </Button>
            <Button onClick={() => handleBulkStatusChange('deactivate')} variant="outline" size="sm">
              Deactivate
            </Button>
            <Button onClick={handleBulkDelete} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-md border">
          <div className="p-4 border-b bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="font-medium">Select All</span>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4 border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{user.display_name}</p>
                      <p className="text-sm text-slate-500">@{user.username}</p>
                    </div>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{user.user_type}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                    {user.last_login && ` • Last login: ${new Date(user.last_login).toLocaleDateString()}`}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(user.id, user.display_name)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No users found matching your criteria
          </div>
        )}
      </CardContent>
    </Card>
  );
}
