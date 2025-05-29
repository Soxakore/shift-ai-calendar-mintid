import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Shield, 
  Building2, 
  Utensils, 
  Coffee,
  Clock,
  UserCheck,
  Plus
} from 'lucide-react';
import { checkPermission, getUIPermissions } from '@/types/permissions';

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to continue.</div>;
  }

  const permissions = getUIPermissions(user);
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Shield className="w-6 h-6 text-red-500" />;
      case 'org_admin': return <Building2 className="w-6 h-6 text-blue-500" />;
      case 'manager': return <UserCheck className="w-6 h-6 text-green-500" />;
      case 'employee': return <Users className="w-6 h-6 text-gray-500" />;
      default: return <Users className="w-6 h-6" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500 text-white';
      case 'org_admin': return 'bg-blue-500 text-white';
      case 'manager': return 'bg-green-500 text-white';
      case 'employee': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDepartmentIcon = (departmentId?: string) => {
    switch (departmentId) {
      case 'kitchen': return <Utensils className="w-5 h-5" />;
      case 'front-counter': return <Coffee className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {getRoleIcon(user.role)}
              <div>
                <h1 className="text-xl font-bold">Welcome, {user.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {user.departmentId && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      {getDepartmentIcon(user.departmentId)}
                      {user.departmentId.replace('-', ' ')} Department
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* My Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                My Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Today's Shift</p>
                  <p className="text-gray-600">9:00 AM - 5:00 PM</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Next Shift</p>
                  <p className="text-gray-600">Tomorrow 10:00 AM - 6:00 PM</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Full Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Management (Manager+ only) */}
          {(permissions.canCreateUsers || permissions.canEditUsers) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {user.role === 'manager' ? 'My Team' : 'User Management'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">
                      {user.role === 'manager' 
                        ? `${user.departmentId?.replace('-', ' ')} Team` 
                        : 'Total Users'
                      }
                    </p>
                    <p className="text-gray-600">
                      {user.role === 'manager' ? '8 team members' : '156 users'}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Active Today</p>
                    <p className="text-gray-600">
                      {user.role === 'manager' ? '6 working' : '142 active'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Accounts (Manager+ only) */}
          {permissions.canCreateUsers && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Team Member
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {user.role === 'manager' 
                      ? `Create accounts for your ${user.departmentId?.replace('-', ' ')} team`
                      : 'Create accounts for your organization'
                    }
                  </p>
                  <Button size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics (Manager+ only) */}
          {permissions.canViewReports && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {user.role === 'manager' ? 'Department Analytics' : 'Analytics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">This Week</p>
                    <p className="text-gray-600">
                      {user.role === 'manager' ? '320 hours logged' : '2,840 hours logged'}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Efficiency</p>
                    <p className="text-gray-600">94.2%</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Role-specific Access Information */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Your Access Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-800">Organization Access</p>
                <p className="text-blue-600">
                  {permissions.dataScope === 'all' ? 'All Organizations' : 
                   permissions.dataScope === 'organization' ? user.organizationId?.toUpperCase() : 
                   'Department Only'}
                </p>
              </div>
              <div>
                <p className="font-medium text-blue-800">User Management</p>
                <p className="text-blue-600">
                  {(permissions.canCreateUsers || permissions.canEditUsers) ? 
                    (user.role === 'manager' ? 'Department Team' : 'Organization') : 
                    'Own Profile Only'
                  }
                </p>
              </div>
              <div>
                <p className="font-medium text-blue-800">Reports Access</p>
                <p className="text-blue-600">
                  {permissions.canViewReports ? 
                    (user.role === 'manager' ? 'Department Reports' : 'All Reports') : 
                    'Personal Reports'
                  }
                </p>
              </div>
              <div>
                <p className="font-medium text-blue-800">Account Creation</p>
                <p className="text-blue-600">
                  {permissions.canCreateUsers ? 
                    (user.role === 'manager' ? 'Team Members' : 'Organization Users') : 
                    'Not Allowed'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RoleBasedDashboard;
