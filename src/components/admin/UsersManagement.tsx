
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, UserPlus, Edit, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'super_admin' | 'org_admin' | 'manager' | 'employee';
  status: 'Active' | 'Inactive';
  language: string;
  email: string;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([
    { 
      id: '1', 
      name: 'John Doe', 
      username: 'john.doe', 
      password: 'worker123',
      email: 'john.doe@company.com',
      role: 'employee', 
      status: 'Active', 
      language: 'English' 
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      username: 'jane.smith', 
      password: 'worker123',
      email: 'jane.smith@company.com',
      role: 'manager', 
      status: 'Active', 
      language: 'English' 
    },
    { 
      id: '3', 
      name: 'Demo Worker', 
      username: 'demo', 
      password: 'demo123',
      email: 'demo@company.com',
      role: 'employee', 
      status: 'Active', 
      language: 'Svenska' 
    },
  ]);

  const [newUser, setNewUser] = useState<{
    name: string;
    username: string;
    password: string;
    email: string;
    role: 'super_admin' | 'org_admin' | 'manager' | 'employee';
    language: string;
  }>({
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'employee',
    language: 'English'
  });

  const addUser = () => {
    const user: User = {
      id: Date.now().toString(),
      ...newUser,
      status: 'Active'
    };
    setUsers([...users, user]);
    setNewUser({ name: '', username: '', password: '', email: '', role: 'employee', language: 'English' });
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
        : user
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Users Management
          </CardTitle>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                  <Input
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                  <Select value={newUser.role} onValueChange={(value: 'super_admin' | 'org_admin' | 'manager' | 'employee') => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="org_admin">Org Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newUser.language} onValueChange={(value) => setNewUser({ ...newUser, language: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Svenska">Svenska</SelectItem>
                      <SelectItem value="العربية">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addUser} className="w-full">Add User</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="font-mono text-sm">{user.username}</TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="font-mono text-sm">{'*'.repeat(user.password.length)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'org_admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>{user.language}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={user.status === 'Active' ? 'destructive' : 'default'}
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
