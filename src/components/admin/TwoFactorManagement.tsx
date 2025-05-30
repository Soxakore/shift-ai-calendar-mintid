
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, Smartphone, AlertTriangle, Unlock, 
  Search, Users, Building, Clock, Key
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TwoFactorUser {
  id: string;
  username: string;
  display_name: string;
  organization_name: string;
  twofa_enabled: boolean;
  twofa_enrolled_at: string | null;
  last_login: string | null;
  is_locked: boolean;
  backup_codes_used: number;
  total_backup_codes: number;
}

interface Organization {
  id: string;
  name: string;
  twofa_required: boolean;
  twofa_grace_period_days: number;
  users_with_2fa: number;
  total_users: number;
}

const TwoFactorManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('all');
  
  // Mock data - in real implementation, this would come from Supabase
  const [organizations] = useState<Organization[]>([
    {
      id: '1',
      name: 'Tech Corp',
      twofa_required: true,
      twofa_grace_period_days: 7,
      users_with_2fa: 45,
      total_users: 50
    },
    {
      id: '2',
      name: 'Marketing Agency',
      twofa_required: false,
      twofa_grace_period_days: 0,
      users_with_2fa: 12,
      total_users: 25
    },
    {
      id: '3',
      name: 'Finance Solutions',
      twofa_required: true,
      twofa_grace_period_days: 3,
      users_with_2fa: 18,
      total_users: 20
    }
  ]);

  const [users] = useState<TwoFactorUser[]>([
    {
      id: '1',
      username: 'john.doe',
      display_name: 'John Doe',
      organization_name: 'Tech Corp',
      twofa_enabled: true,
      twofa_enrolled_at: '2024-01-15T10:00:00Z',
      last_login: '2024-01-30T09:00:00Z',
      is_locked: false,
      backup_codes_used: 2,
      total_backup_codes: 10
    },
    {
      id: '2',
      username: 'jane.smith',
      display_name: 'Jane Smith',
      organization_name: 'Tech Corp',
      twofa_enabled: true,
      twofa_enrolled_at: '2024-01-10T14:30:00Z',
      last_login: '2024-01-29T16:45:00Z',
      is_locked: true,
      backup_codes_used: 10,
      total_backup_codes: 10
    },
    {
      id: '3',
      username: 'mike.wilson',
      display_name: 'Mike Wilson',
      organization_name: 'Marketing Agency',
      twofa_enabled: false,
      twofa_enrolled_at: null,
      last_login: '2024-01-30T11:20:00Z',
      is_locked: false,
      backup_codes_used: 0,
      total_backup_codes: 0
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.organization_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrg === 'all' || user.organization_name === selectedOrg;
    
    return matchesSearch && matchesOrg;
  });

  const handleUnlock2FA = async (userId: string, userName: string) => {
    try {
      // In real implementation, this would call Supabase to reset 2FA
      console.log('Unlocking 2FA for user:', userId);
      
      toast({
        title: "🔓 2FA Unlocked",
        description: `Successfully unlocked 2FA for ${userName}. User can now log in and re-setup 2FA.`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to unlock 2FA. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResetBackupCodes = async (userId: string, userName: string) => {
    try {
      // In real implementation, this would generate new backup codes
      console.log('Resetting backup codes for user:', userId);
      
      toast({
        title: "🔄 Backup Codes Reset",
        description: `New backup codes generated for ${userName}.`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to reset backup codes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleOrgRequirement = async (orgId: string, required: boolean) => {
    try {
      console.log('Toggling 2FA requirement for org:', orgId, required);
      
      toast({
        title: required ? "🔒 2FA Required" : "🔓 2FA Optional",
        description: `2FA is now ${required ? 'required' : 'optional'} for this organization.`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to update organization settings.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Two-Factor Authentication</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage 2FA settings and unlock users who've lost access</p>
        </div>
      </div>

      {/* Organization 2FA Settings */}
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Building className="w-5 h-5" />
            Organization 2FA Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{org.name}</h3>
                    <Badge variant={org.twofa_required ? "default" : "secondary"}>
                      {org.twofa_required ? "2FA Required" : "2FA Optional"}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {org.users_with_2fa}/{org.total_users} users have 2FA enabled
                    {org.twofa_required && ` • ${org.twofa_grace_period_days} day grace period`}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Require 2FA</span>
                    <Switch
                      checked={org.twofa_required}
                      onCheckedChange={(checked) => handleToggleOrgRequirement(org.id, checked)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User 2FA Management */}
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Users className="w-5 h-5" />
            User 2FA Management
          </CardTitle>
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
                className="pl-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
            >
              <option value="all">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.name}>{org.name}</option>
              ))}
            </select>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{user.display_name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username} • {user.organization_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.twofa_enabled ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Shield className="w-3 h-3 mr-1" />
                          2FA Enabled
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Smartphone className="w-3 h-3 mr-1" />
                          No 2FA
                        </Badge>
                      )}
                      {user.is_locked && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                  {user.twofa_enabled && (
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-4">
                      <span>Enrolled: {new Date(user.twofa_enrolled_at!).toLocaleDateString()}</span>
                      <span>Backup codes: {user.total_backup_codes - user.backup_codes_used}/{user.total_backup_codes} remaining</span>
                      {user.last_login && (
                        <span>Last login: {new Date(user.last_login).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {user.twofa_enabled && user.is_locked && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Unlock className="w-4 h-4 mr-2" />
                          Unlock 2FA
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Unlock 2FA for {user.display_name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will disable 2FA for this user and allow them to log in normally. 
                            They will need to set up 2FA again after logging in.
                            <br /><br />
                            <strong>This action should only be used when the user has lost access to their 2FA device.</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleUnlock2FA(user.id, user.display_name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Unlock 2FA
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {user.twofa_enabled && !user.is_locked && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Key className="w-4 h-4 mr-2" />
                          Reset Codes
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Backup Codes for {user.display_name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will generate new backup codes and invalidate all existing ones. 
                            The user will receive the new codes via email.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleResetBackupCodes(user.id, user.display_name)}>
                            Reset Codes
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No users found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Total with 2FA</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">75</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Locked Accounts</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">1</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Orgs Requiring 2FA</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">2</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Grace Period Users</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">5</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TwoFactorManagement;
