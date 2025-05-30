
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserPlus, X } from 'lucide-react';

interface CreateUserFormProps {
  isCreating: boolean;
  organizations: any[];
  onCancel: () => void;
  onSubmit: (userData: {
    email: string;
    username: string;
    password: string;
    display_name: string;
    phone_number: string;
    user_type: string;
    organization_id: string;
    department_id: string;
  }) => void;
}

export default function CreateUserForm({
  isCreating,
  organizations,
  onCancel,
  onSubmit
}: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    display_name: '',
    phone_number: '',
    user_type: 'org_admin',
    organization_id: '',
    department_id: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-green-900">Create New User</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-email">Email *</Label>
              <Input
                id="user-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-username">Username *</Label>
              <Input
                id="user-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-display-name">Display Name *</Label>
              <Input
                id="user-display-name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-phone">Phone Number</Label>
              <Input
                id="user-phone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="Phone number"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-password">Password *</Label>
              <Input
                id="user-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-type">User Type *</Label>
              <Select value={formData.user_type} onValueChange={(value) => setFormData({ ...formData, user_type: value })}>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-organization">Organization *</Label>
            <Select value={formData.organization_id} onValueChange={(value) => setFormData({ ...formData, organization_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name} ({org.organization_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !formData.email.trim() || !formData.username.trim()}>
              {isCreating ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
