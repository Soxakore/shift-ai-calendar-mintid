import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'super_admin' | 'org_admin' | 'manager' | 'employee';
  organizationId: string;
  departmentId?: string;
  createdAt: string;
}

const UserAccountManager = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>([
    // Demo accounts already created
    {
      id: 'super-admin-001',
      username: 'super.admin',
      password: 'admin123',
      name: 'Super Administrator',
      role: 'super_admin',
      organizationId: 'all',
      createdAt: '2025-05-29'
    },
    {
      id: 'mc-admin-001', 
      username: 'mc.admin',
      password: 'mcadmin123',
      name: 'McDonald\'s Administrator',
      role: 'org_admin',
      organizationId: 'mcdonalds',
      createdAt: '2025-05-29'
    },
    {
      id: 'kitchen-mgr-001',
      username: 'kitchen.manager',
      password: 'kitchen123',
      name: 'Kitchen Manager',
      role: 'manager',
      organizationId: 'mcdonalds',
      departmentId: 'kitchen',
      createdAt: '2025-05-29'
    },
    {
      id: 'employee-001',
      username: 'mary.cook',
      password: 'mary123',
      name: 'Mary Cook',
      role: 'employee',
      organizationId: 'mcdonalds',
      departmentId: 'kitchen',
      createdAt: '2025-05-29'
    }
  ]);

  const [newAccount, setNewAccount] = useState({
    username: '',
    password: '',
    name: '',
    role: 'employee' as const,
    organizationId: 'mcdonalds',
    departmentId: 'kitchen'
  });

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const organizations = [
    { id: 'mcdonalds', name: 'McDonald\'s' },
    { id: 'starbucks', name: 'Starbucks' },
    { id: 'subway', name: 'Subway' }
  ];

  const departments = [
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'front-counter', name: 'Front Counter' },
    { id: 'drive-thru', name: 'Drive Thru' },
    { id: 'management', name: 'Management' }
  ];

  const handleCreateAccount = () => {
    if (!newAccount.username || !newAccount.password || !newAccount.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Check if username already exists
    if (accounts.some(acc => acc.username === newAccount.username)) {
      toast({
        title: "Username Taken",
        description: "This username already exists. Please choose another.",
        variant: "destructive"
      });
      return;
    }

    const account: UserAccount = {
      id: `user-${Date.now()}`,
      ...newAccount,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAccounts([...accounts, account]);
    
    // Save to localStorage so the system remembers
    localStorage.setItem('user_accounts', JSON.stringify([...accounts, account]));

    toast({
      title: "Account Created",
      description: `${newAccount.name} can now log in with username: ${newAccount.username}`,
    });

    // Reset form
    setNewAccount({
      username: '',
      password: '',
      name: '',
      role: 'employee',
      organizationId: 'mcdonalds',
      departmentId: 'kitchen'
    });
  };

  const handleDeleteAccount = (id: string) => {
    const updatedAccounts = accounts.filter(acc => acc.id !== id);
    setAccounts(updatedAccounts);
    localStorage.setItem('user_accounts', JSON.stringify(updatedAccounts));
    
    toast({
      title: "Account Deleted",
      description: "User account has been removed",
    });
  };

  const copyCredentials = (account: UserAccount) => {
    const credentials = `Username: ${account.username}\nPassword: ${account.password}`;
    navigator.clipboard.writeText(credentials);
    toast({
      title: "Credentials Copied",
      description: "Username and password copied to clipboard",
    });
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500';
      case 'org_admin': return 'bg-blue-500';
      case 'manager': return 'bg-green-500';
      case 'employee': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Account */}
      <Card>
        <CardHeader>
          <CardTitle>Create New User Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newAccount.name}
                onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newAccount.username}
                onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
                placeholder="john.doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newAccount.password}
                onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                placeholder="Password123"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newAccount.role} onValueChange={(value: any) => setNewAccount({...newAccount, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="org_admin">Organization Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Select value={newAccount.organizationId} onValueChange={(value) => setNewAccount({...newAccount, organizationId: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={newAccount.departmentId} onValueChange={(value) => setNewAccount({...newAccount, departmentId: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCreateAccount} className="w-full">
            Create Account
          </Button>
        </CardContent>
      </Card>

      {/* Existing Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Existing User Accounts ({accounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{account.name}</h3>
                    <Badge className={`text-white ${getRoleBadgeColor(account.role)}`}>
                      {account.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCredentials(account)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Username:</span> {account.username}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Password:</span>
                    <span className="font-mono">
                      {showPasswords[account.id] ? account.password : '••••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility(account.id)}
                    >
                      {showPasswords[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Organization:</span> {organizations.find(o => o.id === account.organizationId)?.name}
                  </div>
                  {account.departmentId && (
                    <div>
                      <span className="font-medium">Department:</span> {departments.find(d => d.id === account.departmentId)?.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-700">
          <p>• Create accounts here with specific roles and departments</p>
          <p>• Give the username/password to your managers and employees</p>
          <p>• When they log in, they automatically see only their allowed areas</p>
          <p>• Kitchen managers can only see kitchen staff, front counter managers only see front counter staff, etc.</p>
          <p>• All credentials are saved automatically - the system remembers everything</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAccountManager;
