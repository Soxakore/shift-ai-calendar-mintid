
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface EditUserDialogProps {
  user: any;
  isUpdating: boolean;
  organizations: Array<{
    id: string;
    name: string;
  }>;
  onClose: () => void;
  onSubmit: () => void;
}

export default function EditUserDialog({
  user,
  isUpdating,
  organizations,
  onClose,
  onSubmit
}: EditUserDialogProps) {
  const [editUserData, setEditUserData] = useState({
    username: '',
    display_name: '',
    phone_number: '',
    user_type: 'org_admin',
    organization_id: '',
    department_id: '',
    new_password: ''
  });

  useEffect(() => {
    if (user) {
      setEditUserData({
        username: user.username || '',
        display_name: user.display_name || '',
        phone_number: user.phone_number || '',
        user_type: user.user_type || 'org_admin',
        organization_id: user.organization_id || '',
        department_id: user.department_id || '',
        new_password: ''
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User: {user.display_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-username">Username *</Label>
            <Input
              id="edit-username"
              value={editUserData.username}
              onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-display-name">Display Name *</Label>
            <Input
              id="edit-display-name"
              value={editUserData.display_name}
              onChange={(e) => setEditUserData({ ...editUserData, display_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-phone">Phone Number</Label>
            <Input
              id="edit-phone"
              value={editUserData.phone_number}
              onChange={(e) => setEditUserData({ ...editUserData, phone_number: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-user-type">User Type *</Label>
            <Select value={editUserData.user_type} onValueChange={(value) => setEditUserData({ ...editUserData, user_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="org_admin">Organization Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-organization">Organization *</Label>
            <Select value={editUserData.organization_id} onValueChange={(value) => setEditUserData({ ...editUserData, organization_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-password">New Password (Optional)</Label>
            <Input
              id="edit-password"
              type="password"
              value={editUserData.new_password}
              onChange={(e) => setEditUserData({ ...editUserData, new_password: e.target.value })}
              placeholder="Leave empty to keep current password"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
