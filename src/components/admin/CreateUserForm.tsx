
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserPlus, X } from 'lucide-react';
import OrgSelectionDebugger from '../debug/OrgSelectionDebugger';

interface CreateUserFormProps {
  isCreating: boolean;
  organisations: Array<{
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
    organisation_id: string;
    department_id: string;
  }) => void;
}

export default function CreateUserForm({
  isCreating,
  organisations,
  onCancel,
  onSubmit
}: CreateUserFormProps) {
  const [userData, setUserData] = useState({
    email: '',
    username: '',
    password: '',
    display_name: '',
    phone_number: '',
    user_type: 'employee', // Default to employee instead of org_admin
    organisation_id: '',
    department_id: ''
  });

  // Reset form when organisations change to ensure clean state
  useEffect(() => {
    setUserData(prev => ({
      ...prev,
      organisation_id: '', // Clear any potentially corrupted org ID
      department_id: ''     // Clear any potentially corrupted dept ID
    }));
  }, [organisations]);

  // Determine which fields are required based on user type
  const isOrgAdmin = userData.user_type === 'org_admin';
  const emailRequired = isOrgAdmin; // Only org_admin needs email for email/password login
  const usernameRequired = !isOrgAdmin; // Manager and employee need username for username/password login

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // CRITICAL: Check for "12" immediately
    if (userData.organisation_id === '12') {
      console.error('🚨 CRITICAL: organisation_id is "12" - BLOCKING SUBMISSION');
      alert('CRITICAL ERROR: Organization ID is "12" which is invalid. This suggests a bug in the form. Please refresh the page and try again.');
      return;
    }
    
    // Conditional validation based on user type
    const isOrgAdmin = userData.user_type === 'org_admin';
    
    // Validate email for org_admin
    if (isOrgAdmin && (!userData.email || userData.email.trim() === '')) {
      alert('Email is required for Organisation Admin users.');
      return;
    }
    
    // Validate username for manager and employee
    if (!isOrgAdmin && (!userData.username || userData.username.trim() === '')) {
      alert('Username is required for Manager and Employee users.');
      return;
    }
    
    // Validate that an organisation is selected
    if (!userData.organisation_id || userData.organisation_id.trim() === '') {
      alert('Please select an organisation before creating the user.');
      return;
    }
    
    // CRITICAL: Check if organisation_id is a numeric string (this should never happen but let's be safe)
    if (/^\d+$/.test(userData.organisation_id)) {
      console.error('❌ CRITICAL ERROR: Numeric value detected for organisation_id:', userData.organisation_id);
      alert('Invalid organization selection detected. Please refresh the page and try again.');
      return;
    }
    
    // Find the selected organisation
    const selectedOrg = organisations.find(org => org.id === userData.organisation_id);
    
    if (!selectedOrg) {
      console.error('❌ VALIDATION FAILED: Selected organisation not found in available organisations');
      alert('Selected organisation is invalid. Please refresh the page and try again.');
      return;
    }
    
    // Validate that organisation ID is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(userData.organisation_id)) {
      console.error('❌ UUID VALIDATION FAILED for organisation_id:', userData.organisation_id);
      alert('Selected organisation has an invalid ID format. Please refresh the page and try again.');
      return;
    }
    
    // Also validate department_id if it's provided
    if (userData.department_id && userData.department_id.trim() !== '') {
      if (!uuidRegex.test(userData.department_id)) {
        console.error('❌ UUID VALIDATION FAILED for department_id:', userData.department_id);
        alert('Department ID has an invalid format. Please clear the department field and try again.');
        return;
      }
    }
    
    onSubmit(userData);
  };

  return (    <div className="space-y-4">
      {/* Debugging Component */}
      <OrgSelectionDebugger organizations={organisations} />
      
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
              <Label htmlFor="user-email" className="text-slate-700 dark:text-slate-300 font-medium">
                Email Address {emailRequired ? '*' : ''}
              </Label>
              <Input
                id="user-email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder="user@example.com"
                required={emailRequired}
                disabled={!isOrgAdmin}
                className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors ${
                  !isOrgAdmin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              {!isOrgAdmin && (
                <p className="text-xs text-slate-500">Email not required for this user type</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-username" className="text-slate-700 dark:text-slate-300 font-medium">
                Username {usernameRequired ? '*' : ''}
              </Label>
              <Input
                id="user-username"
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                placeholder="username"
                required={usernameRequired}
                disabled={isOrgAdmin}
                className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors ${
                  isOrgAdmin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              {isOrgAdmin && (
                <p className="text-xs text-slate-500">Username not required for Organisation Admin</p>
              )}
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
              <Select 
                value={userData.user_type} 
                onValueChange={(value) => {
                  console.log('🔄 User Type changed to:', value);
                  // Clear email/username when switching types to avoid confusion
                  setUserData({ 
                    ...userData, 
                    user_type: value,
                    email: value === 'org_admin' ? userData.email : '', // Keep email only for org_admin
                    username: value !== 'org_admin' ? userData.username : '' // Keep username only for manager/employee
                  });
                }}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <SelectItem value="org_admin">Organisation Admin (Email/Password)</SelectItem>
                  <SelectItem value="manager">Manager (Username/Password)</SelectItem>
                  <SelectItem value="employee">Employee (Username/Password)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-slate-500 mt-1">
                {isOrgAdmin ? (
                  <span className="text-blue-600">🔐 Logs in with Email & Password</span>
                ) : (
                  <span className="text-green-600">👤 Logs in with Username & Password</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user-organization" className="text-slate-700 dark:text-slate-300 font-medium">Organisation *</Label>
            <Select 
              value={userData.organisation_id} 
              onValueChange={(value) => {
                // Immediately reject any numeric values
                if (/^\d+$/.test(String(value))) {
                  console.error('❌ REJECTING NUMERIC ORGANIZATION ID:', value);
                  alert(`Invalid organization ID detected: "${value}". This should be a UUID, not a number. Please contact support.`);
                  return;
                }
                
                // Validate it's a proper UUID
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(String(value))) {
                  console.error('❌ INVALID UUID received in organisation select:', value);
                  alert(`Invalid organization ID format: "${value}". Expected UUID format. Please refresh the page.`);
                  return;
                }
                
                setUserData({ ...userData, organisation_id: String(value) });
              }}
            >
              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400">
                <SelectValue placeholder="Select organisation" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                {organisations.map((org) => (
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
    </div>
  );
}
