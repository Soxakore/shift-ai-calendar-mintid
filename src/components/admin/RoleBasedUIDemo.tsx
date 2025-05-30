
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Building2, 
  Users, 
  UserCheck, 
  Settings, 
  Eye, 
  EyeOff,
  Calendar,
  BarChart3,
  Lock,
  Unlock,
  Info
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AuthUser, getUIPermissions } from '@/types/permissions';

// Create demo users that match AuthUser interface
const demoUsers: AuthUser[] = [
  {
    id: '1',
    name: 'Super Admin',
    username: 'super.admin',
    role: 'super_admin',
    organizationId: 'all',
    departmentId: undefined
  },
  {
    id: '2',
    name: 'Org Admin',
    username: 'org.admin',
    role: 'org_admin',
    organizationId: 'mcdonalds',
    departmentId: undefined
  },
  {
    id: '3',
    name: 'Kitchen Manager',
    username: 'kitchen.manager',
    role: 'manager',
    organizationId: 'mcdonalds',
    departmentId: 'kitchen'
  },
  {
    id: '4',
    name: 'Employee',
    username: 'john.employee',
    role: 'employee',
    organizationId: 'mcdonalds',
    departmentId: 'kitchen'
  }
];

const RoleBasedUIDemo = () => {
  const [selectedUser, setSelectedUser] = useState<AuthUser>(demoUsers[0]);
  const [showPermissions, setShowPermissions] = useState(true);
  const isMobile = useIsMobile();

  const permissions = getUIPermissions(selectedUser);

  const getRoleIcon = (role: string) => {
    const iconClass = isMobile ? 'w-4 h-4' : 'w-5 h-5';
    switch (role) {
      case 'super_admin': return <Shield className={`${iconClass} text-red-500`} />;
      case 'org_admin': return <Building2 className={`${iconClass} text-blue-500`} />;
      case 'manager': return <UserCheck className={`${iconClass} text-green-500`} />;
      case 'employee': return <Users className={`${iconClass} text-gray-500`} />;
      default: return <Users className={iconClass} />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'org_admin': return 'default';
      case 'manager': return 'secondary';
      case 'employee': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
            Role-Based Access Control Demo
          </h2>
          <p className="text-muted-foreground text-sm">
            Experience how different user roles see and interact with the application
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-permissions"
              checked={showPermissions}
              onCheckedChange={setShowPermissions}
            />
            <Label htmlFor="show-permissions" className="text-sm">Show Permissions</Label>
          </div>
          
          <Select 
            value={selectedUser.id} 
            onValueChange={(userId) => {
              const user = demoUsers.find(u => u.id === userId);
              if (user) setSelectedUser(user);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {demoUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <span className="font-medium">{user.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current User Display */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            {getRoleIcon(selectedUser.role)}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className={isMobile ? 'text-lg' : 'text-xl'}>{selectedUser.name}</span>
                <Badge variant={getRoleBadgeVariant(selectedUser.role)} className="w-fit">
                  {selectedUser.role.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {selectedUser.organizationId && selectedUser.organizationId !== 'all' && (
                  <span>Organization: {selectedUser.organizationId.toUpperCase()}</span>
                )}
                {selectedUser.departmentId && (
                  <span className="ml-2">Department: {selectedUser.departmentId.replace('-', ' ')}</span>
                )}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Permissions Overview */}
      {showPermissions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              Current Permissions & Access Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Data Access
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Data Scope</span>
                    <Badge variant="outline" className="text-xs">
                      {permissions.dataScope === 'all' ? 'All Organizations' : 
                       permissions.dataScope === 'organization' ? 'Organization' : 'Department'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>View All Organizations</span>
                    {permissions.canViewOrganizations ? 
                      <Unlock className="w-4 h-4 text-green-500" /> : 
                      <Lock className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span>View All Users</span>
                    {permissions.canViewAllUsers ? 
                      <Unlock className="w-4 h-4 text-green-500" /> : 
                      <Lock className="w-4 h-4 text-red-500" />
                    }
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Management
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Create Users</span>
                    {permissions.canCreateUsers ? 
                      <Unlock className="w-4 h-4 text-green-500" /> : 
                      <Lock className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Edit Users</span>
                    {permissions.canEditUsers ? 
                      <Unlock className="w-4 h-4 text-green-500" /> : 
                      <Lock className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delete Users</span>
                    {permissions.canDeleteUsers ? 
                      <Unlock className="w-4 h-4 text-green-500" /> : 
                      <Lock className="w-4 h-4 text-red-500" />
                    }
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  System Access
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>View Reports</span>
                    {permissions.canViewReports ? 
                      <Unlock className="w-4 h-4 text-green-500" /> : 
                      <Lock className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Manage Organizations</span>
                    {permissions.canViewOrganizations ? 
                      <Unlock className="w-4 h-4 text-green-500" /> : 
                      <Lock className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Settings</span>
                    {permissions.canViewSettings ? 
                      <Unlock className="w-4 h-4 text-green-500" /> : 
                      <Lock className="w-4 h-4 text-red-500" />
                    }
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Interface - Mobile Responsive */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs sm:text-sm">Schedule</TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Role-specific dashboard content */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  My Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">
                  {selectedUser.role === 'employee' 
                    ? 'View your assigned shifts and upcoming schedule'
                    : 'Manage team schedules and assign shifts'
                  }
                </p>
                <Button size="sm" className="mt-3 w-full" variant="outline">
                  View Schedule
                </Button>
              </CardContent>
            </Card>

            {permissions.canViewReports && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground">
                    {selectedUser.role === 'super_admin' 
                      ? 'System-wide analytics and performance metrics'
                      : permissions.dataScope === 'organization'
                      ? 'Organization-wide reports and analytics'
                      : 'Department performance and team metrics'
                    }
                  </p>
                  <Button size="sm" className="mt-3 w-full" variant="outline">
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            )}

            {permissions.canCreateUsers && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground">
                    {selectedUser.role === 'super_admin' 
                      ? 'Manage all users across all organizations'
                      : selectedUser.role === 'org_admin'
                      ? 'Manage users within your organization'
                      : 'Manage your department team members'
                    }
                  </p>
                  <Button size="sm" className="mt-3 w-full" variant="outline">
                    Manage Users
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {!permissions.canViewReports && !permissions.canCreateUsers && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                As an employee, you have access to your personal schedule, tasks, and basic reporting features.
                Contact your manager or administrator for additional access permissions.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Management</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUser.role === 'employee' ? (
                <p>View your schedule here.</p>
              ) : (
                <p>Manage schedules for your team.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUser.role === 'super_admin' ? (
                <p>Manage all users in the system.</p>
              ) : (
                <p>Manage users in your organization.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports and Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUser.role === 'super_admin' ? (
                <p>View system-wide reports.</p>
              ) : (
                <p>View reports for your organization.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
};

export default RoleBasedUIDemo;
