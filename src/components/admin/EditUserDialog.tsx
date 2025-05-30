
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('••••••••');
  const { toast } = useToast();

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
      // Simulate current password (in real app, you'd fetch this securely)
      setCurrentPassword('SecurePass123');
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
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

  const handleCopyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "✅ Password Copied!",
        description: "Current password copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "❌ Copy failed",
        description: "Could not copy password to clipboard",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">Edit User: {user.display_name}</DialogTitle>
          {user.tracking_id && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-sm">
                {user.tracking_id}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                onClick={() => handleCopyTrackingId(user.tracking_id)}
                title="Copy tracking ID"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="text-sm font-medium text-slate-700 dark:text-slate-300">Username *</Label>
              <Input
                id="edit-username"
                value={editUserData.username}
                onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                required
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-display-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name *</Label>
              <Input
                id="edit-display-name"
                value={editUserData.display_name}
                onChange={(e) => setEditUserData({ ...editUserData, display_name: e.target.value })}
                required
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</Label>
              <Input
                id="edit-phone"
                value={editUserData.phone_number}
                onChange={(e) => setEditUserData({ ...editUserData, phone_number: e.target.value })}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-type" className="text-sm font-medium text-slate-700 dark:text-slate-300">User Type *</Label>
              <Select value={editUserData.user_type} onValueChange={(value) => setEditUserData({ ...editUserData, user_type: value })}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org_admin">Organization Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-organization" className="text-sm font-medium text-slate-700 dark:text-slate-300">Organization *</Label>
            <Select value={editUserData.organization_id} onValueChange={(value) => setEditUserData({ ...editUserData, organization_id: value })}>
              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
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

          {/* Current Password Section */}
          <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                readOnly
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="px-3"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopyPassword(currentPassword)}
                className="px-3"
                title="Copy current password"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This is the user's current password. Copy it before setting a new one to avoid conflicts.
            </p>
          </div>
          
          {/* New Password Section */}
          <div className="space-y-2">
            <Label htmlFor="edit-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password (Optional)</Label>
            <Input
              id="edit-password"
              type="password"
              value={editUserData.new_password}
              onChange={(e) => setEditUserData({ ...editUserData, new_password: e.target.value })}
              placeholder="Leave empty to keep current password"
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only fill this if you want to change the user's password
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
