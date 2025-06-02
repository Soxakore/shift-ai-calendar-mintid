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
  Plus,
  Menu
} from 'lucide-react';
import { getUIPermissions } from '@/types/permissions';
import { useIsMobile } from '@/hooks/use-mobile';

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) {
    return <div>Please log in to continue.</div>;
  }

  // Convert AuthUser to include role property for permissions - properly type the role
  const userWithRole = { 
    ...user, 
    role: user.role as 'super_admin' | 'org_admin' | 'manager' | 'employee'
  };
  const permissions = getUIPermissions(userWithRole);
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Shield className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-red-500`} />;
      case 'org_admin': return <Building2 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-blue-500`} />;
      case 'manager': return <UserCheck className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-green-500`} />;
      case 'employee': return <Users className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-gray-500`} />;
      default: return <Users className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />;
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
      {/* Mobile-First Header */}
      <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            {isMobile && <Menu className="w-5 h-5 text-gray-500" />}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {getRoleIcon(user.role)}
              <div className="min-w-0">
                <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold truncate`}>
                  Welcome, {user.name}
                </h1>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <Badge className={`${getRoleBadgeColor(user.role)} text-xs`}>
                    {user.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {user.departmentId && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      {getDepartmentIcon(user.departmentId)}
                      <span className="hidden sm:inline">
                        {user.departmentId.replace('-', ' ')} Department
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" size={isMobile ? "sm" : "default"} className="shrink-0">
            <Settings className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} ${isMobile ? '' : 'mr-2'}`} />
            {!isMobile && 'Profile'}
          </Button>
        </div>
      </header>

      {/* Main Content - Responsive Grid */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* My Schedule */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                My Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Today's Shift</p>
                <p className="text-gray-600 text-xs sm:text-sm">9:00 AM - 5:00 PM</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Next Shift</p>
                <p className="text-gray-600 text-xs sm:text-sm">Tomorrow 10:00 AM - 6:00 PM</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-xs sm:text-sm">View Full Schedule</span>
              </Button>
            </CardContent>
          </Card>

          {/* User Management (Manager+ only) */}
          {(permissions.canCreateUsers || permissions.canEditUsers) && (
            <Card className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="truncate">
                    {user.role === 'manager' ? 'My Team' : 'User Management'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">
                    {user.role === 'manager' 
                      ? `${user.departmentId?.replace('-', ' ')} Team` 
                      : 'Total Users'
                    }
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {user.role === 'manager' ? '8 team members' : '156 users'}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Active Today</p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {user.role === 'manager' ? '6 working' : '142 active'}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">Manage Team</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Create Accounts (Manager+ only) */}
          {permissions.canCreateUsers && (
            <Card className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="truncate">Add Team Member</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  {user.role === 'manager' 
                    ? `Create accounts for your ${user.departmentId?.replace('-', ' ')} team`
                    : 'Create accounts for your organization'
                  }
                </p>
                <Button size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">Create New Account</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Analytics (Manager+ only) */}
          {permissions.canViewReports && (
            <Card className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="truncate">
                    {user.role === 'manager' ? 'Department Analytics' : 'Analytics'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">This Week</p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {user.role === 'manager' ? '320 hours logged' : '2,840 hours logged'}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Efficiency</p>
                  <p className="text-gray-600 text-xs sm:text-sm">94.2%</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">View Reports</span>
                </Button>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Role-specific Access Information - Mobile Optimized */}
        <Card className="mt-4 sm:mt-6 bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 text-base sm:text-lg">Your Access Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-blue-800 text-xs sm:text-sm">Organization Access</p>
                <p className="text-blue-600 text-xs mt-1">
                  {permissions.dataScope === 'all' ? 'All Organizations' : 
                   permissions.dataScope === 'organization' ? user.organizationId?.toUpperCase() : 
                   'Department Only'}
                </p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-blue-800 text-xs sm:text-sm">User Management</p>
                <p className="text-blue-600 text-xs mt-1">
                  {(permissions.canCreateUsers || permissions.canEditUsers) ? 
                    (user.role === 'manager' ? 'Department Team' : 'Organization') : 
                    'Own Profile Only'
                  }
                </p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-blue-800 text-xs sm:text-sm">Reports Access</p>
                <p className="text-blue-600 text-xs mt-1">
                  {permissions.canViewReports ? 
                    (user.role === 'manager' ? 'Department Reports' : 'All Reports') : 
                    'Personal Reports'
                  }
                </p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-blue-800 text-xs sm:text-sm">Account Creation</p>
                <p className="text-blue-600 text-xs mt-1">
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
