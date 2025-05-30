
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserPlus, X } from 'lucide-react';

interface CreateUserFormProps {
  isCreating: boolean;
  organizations: Array<{
    id: string;
    name: string;
  }>;
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
  const [userData, setUserData] = useState({
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
    onSubmit(userData);
  };

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserPlus className="h-6 w-6" />
            <CardTitle>Create New User</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white hover:bg-green-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user-email">Email *</Label>
              <Input
                id="user-email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="user-username">Username *</Label>
              <Input
                id="user-username"
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                placeholder="username"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user-password">Password *</Label>
              <Input
                id="user-password"
                type="password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                placeholder="Secure password"
                required
              />
            </div>
            <div>
              <Label htmlFor="user-display-name">Display Name *</Label>
              <Input
                id="user-display-name"
                value={userData.display_name}
                onChange={(e) => setUserData({ ...userData, display_name: e.target.value })}
                placeholder="Full name"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user-phone">Phone Number</Label>
              <Input
                id="user-phone"
                value={userData.phone_number}
                onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="user-type">User Type *</Label>
              <Select value={userData.user_type} onValueChange={(value) => setUserData({ ...userData, user_type: value })}>
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
          <div>
            <Label htmlFor="user-organization">Organization *</Label>
            <Select value={userData.organization_id} onValueChange={(value) => setUserData({ ...userData, organization_id: value })}>
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
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
