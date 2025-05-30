
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
    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Create New User</CardTitle>
              <p className="text-emerald-100 text-sm">Add a new user to the system</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="user-email" className="text-slate-700 dark:text-slate-300 font-medium">Email Address *</Label>
              <Input
                id="user-email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder="user@example.com"
                required
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-username" className="text-slate-700 dark:text-slate-300 font-medium">Username *</Label>
              <Input
                id="user-username"
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                placeholder="username"
                required
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="user-password" className="text-slate-700 dark:text-slate-300 font-medium">Password *</Label>
              <Input
                id="user-password"
                type="password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                placeholder="Secure password"
                required
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-display-name" className="text-slate-700 dark:text-slate-300 font-medium">Display Name *</Label>
              <Input
                id="user-display-name"
                value={userData.display_name}
                onChange={(e) => setUserData({ ...userData, display_name: e.target.value })}
                placeholder="Full name"
                required
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="user-phone" className="text-slate-700 dark:text-slate-300 font-medium">Phone Number</Label>
              <Input
                id="user-phone"
                value={userData.phone_number}
                onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
                placeholder="+1234567890"
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-type" className="text-slate-700 dark:text-slate-300 font-medium">User Type *</Label>
              <Select value={userData.user_type} onValueChange={(value) => setUserData({ ...userData, user_type: value })}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <SelectItem value="org_admin">Organization Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user-organization" className="text-slate-700 dark:text-slate-300 font-medium">Organization *</Label>
            <Select value={userData.organization_id} onValueChange={(value) => setUserData({ ...userData, organization_id: value })}>
              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
