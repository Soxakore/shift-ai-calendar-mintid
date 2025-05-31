import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Building2, 
  UserCheck,
  Calendar,
  Clock,
  AlertTriangle,
  UserPlus,
  ArrowUp
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import SickNoticeModal from '@/components/SickNoticeModal';
import QRCodeScanner from '@/components/QRCodeScanner';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Department = Tables<'departments'>;
type Schedule = Tables<'schedules'>;
type SickNotice = Tables<'sick_notices'>;
type TimeLog = Tables<'time_logs'>;

const EnhancedOrgAdminDashboard = () => {
  const { profile } = useSupabaseAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    departments, 
    profiles: allUsers, 
    schedules, 
    sickNotices, 
    timeLogs,
    loading 
  } = useSupabaseData();
  
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [showPromoteEmployee, setShowPromoteEmployee] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    display_name: '',
    email: '',
    password: '',
    department_id: '',
    user_type: 'employee' as const
  });
  
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: ''
  });
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Calculate dashboard data from Supabase data
  const dashboardData = React.useMemo(() => {
    if (!profile?.organization_id || !allUsers || !departments) return null;

    const orgUsers = allUsers.filter(u => u.organization_id === profile.organization_id);
    const orgDepartments = departments.filter(d => d.organization_id === profile.organization_id);
    const orgSchedules = schedules?.filter(s => s.organization_id === profile.organization_id) || [];
    const orgSickNotices = sickNotices?.filter(s => s.organization_id === profile.organization_id && s.status === 'pending') || [];
    const orgTimeLogs = timeLogs?.filter(t => t.organization_id === profile.organization_id) || [];

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = orgSchedules.filter(s => s.date === today);
    const todayTimeLogs = orgTimeLogs.filter(t => t.date === today);

    return {
      users: orgUsers,
      departments: orgDepartments,
      sickNotices: orgSickNotices,
      schedules: todaySchedules,
      timeLogs: todayTimeLogs,
      totalEmployees: orgUsers.length,
      activeToday: todayTimeLogs.filter(log => log.clock_in).length,
      onTime: todayTimeLogs.filter(log => log.clock_in && log.clock_out).length,
      managers: orgUsers.filter(u => u.user_type === 'manager'),
    };
  }, [profile?.organization_id, allUsers, departments, schedules, sickNotices, timeLogs]);

  const handleAddEmployee = async () => {
    if (!profile?.organization_id || !newEmployee.username || !newEmployee.display_name || !newEmployee.department_id) {
      toast({
        title: t('error'),
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate email for the user
      const email = `${newEmployee.username.trim()}@${profile.organization_id}.mintid.local`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: newEmployee.password || 'temp123',
        options: {
          data: {
            username: newEmployee.username.trim(),
            display_name: newEmployee.display_name.trim(),
            user_type: newEmployee.user_type,
            organization_id: profile.organization_id,
            department_id: newEmployee.department_id,
            created_by: profile.id
          }
        }
      });

      if (error) {
        console.error('User creation error:', error);
        toast({
          title: t('error'),
          description: error.message || "Failed to create user",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('success'),
        description: `Employee ${newEmployee.display_name} added successfully`
      });

      setNewEmployee({
        username: '',
        display_name: '',
        email: '',
        password: '',
        department_id: '',
        user_type: 'employee'
      });
      setShowAddEmployee(false);
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      toast({
        title: t('error'),
        description: "Failed to add employee",
        variant: "destructive"
      });
    }
  };

  const handleCreateDepartment = async () => {
    if (!profile?.organization_id || !newDepartment.name) {
      toast({
        title: t('error'),
        description: "Please provide a department name",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('departments')
        .insert([{
          name: newDepartment.name.trim(),
          description: newDepartment.description.trim() || null,
          organization_id: profile.organization_id
        }])
        .select()
        .single();

      if (error) {
        console.error('Department creation error:', error);
        toast({
          title: t('error'),
          description: error.message || "Failed to create department",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('success'),
        description: `Department ${newDepartment.name} created successfully`
      });

      setNewDepartment({
        name: '',
        description: ''
      });
      setShowCreateDepartment(false);
    } catch (error) {
      console.error('Unexpected error creating department:', error);
      toast({
        title: t('error'),
        description: "Failed to create department",
        variant: "destructive"
      });
    }
  };

  const handlePromoteEmployee = async () => {
    if (!selectedEmployeeId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: 'manager' })
        .eq('id', selectedEmployeeId);

      if (error) {
        console.error('User promotion error:', error);
        toast({
          title: t('error'),
          description: error.message || "Failed to promote employee",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('success'),
        description: "Employee promoted to manager successfully"
      });
      setShowPromoteEmployee(false);
      setSelectedEmployeeId('');
    } catch (error) {
      console.error('Unexpected error promoting user:', error);
      toast({
        title: t('error'),
        description: "Failed to promote employee",
        variant: "destructive"
      });
    }
  };

  const approveSickNotice = async (noticeId: string) => {
    try {
      const { error } = await supabase
        .from('sick_notices')
        .update({ 
          status: 'approved',
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', noticeId);

      if (error) {
        console.error('Sick notice approval error:', error);
        toast({
          title: t('error'),
          description: error.message || "Failed to approve sick notice",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('success'),
        description: "Sick notice approved"
      });
    } catch (error) {
      console.error('Unexpected error approving sick notice:', error);
      toast({
        title: t('error'),
        description: "Failed to approve sick notice",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!dashboardData) {
    return <div className="p-6">No organization data available</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">
            MinTid - Shift Scheduling Management
          </p>
        </div>
        <div className="flex space-x-2">
          <SickNoticeModal trigger={
            <Button variant="outline" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Sick Notice
            </Button>
          } />
          <QRCodeScanner trigger={
            <Button variant="outline" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              QR Time Logging
            </Button>
          } />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Total Employees</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Today</p>
                <p className="text-2xl font-bold text-green-600">{dashboardData.activeToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Departments</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardData.departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Managers</p>
                <p className="text-2xl font-bold text-orange-600">{dashboardData.managers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <UserPlus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Add Employee</h3>
                <p className="text-sm text-muted-foreground">Add new team members</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
              <DialogDescription>Add a new employee to your organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input
                    value={newEmployee.username}
                    onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                    placeholder="john.doe"
                  />
                </div>
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={newEmployee.display_name}
                    onChange={(e) => setNewEmployee({...newEmployee, display_name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <Label>Department</Label>
                <Select value={newEmployee.department_id} onValueChange={(value) => setNewEmployee({...newEmployee, department_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboardData.departments.map((dept: Department) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddEmployee(false)}>Cancel</Button>
                <Button onClick={handleAddEmployee}>Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPromoteEmployee} onOpenChange={setShowPromoteEmployee}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <ArrowUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Promote to Manager</h3>
                <p className="text-sm text-muted-foreground">Promote employees</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promote to Manager</DialogTitle>
              <DialogDescription>Select an employee to promote to manager</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Employee</Label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboardData.users.filter((u: Profile) => u.user_type === 'employee').map((emp: Profile) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPromoteEmployee(false)}>Cancel</Button>
                <Button onClick={handlePromoteEmployee} disabled={!selectedEmployeeId}>Promote to Manager</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCreateDepartment} onOpenChange={setShowCreateDepartment}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Create Department</h3>
                <p className="text-sm text-muted-foreground">Add new departments</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Department</DialogTitle>
              <DialogDescription>Create a new department in your organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Department Name</Label>
                <Input
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                  placeholder="Department Name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                  placeholder="Department Description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDepartment(false)}>Cancel</Button>
                <Button onClick={handleCreateDepartment}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Real-time Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Schedule Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.schedules.map((schedule: Schedule) => {
                const employee = dashboardData.users.find((u: Profile) => u.id === schedule.user_id);
                return (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{employee?.display_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{schedule.start_time} - {schedule.end_time}</p>
                    </div>
                    <Badge variant={schedule.status === 'checked-in' ? 'default' : 'outline'}>
                      {schedule.status}
                    </Badge>
                  </div>
                );
              })}
              {dashboardData.schedules.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No schedules for today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Sick Notices */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Sick Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.sickNotices.map((notice: SickNotice) => {
                const employee = dashboardData.users.find((u: Profile) => u.id === notice.user_id);
                return (
                  <div key={notice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">{employee?.display_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notice.start_date).toLocaleDateString()} - {new Date(notice.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">{notice.reason}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => approveSickNotice(notice.id)}>
                      Approve
                    </Button>
                  </div>
                );
              })}
              {dashboardData.sickNotices.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No pending sick notices</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Managers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Current Managers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.managers.map((manager: Profile) => {
              const department = dashboardData.departments.find((d: Department) => d.id === manager.department_id);
              return (
                <div key={manager.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{manager.display_name}</p>
                      <p className="text-sm text-gray-600">{department?.name || 'Unknown Department'}</p>
                      <Badge variant="secondary" className="text-xs">
                        {manager.user_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            {dashboardData.managers.length === 0 && (
              <p className="text-muted-foreground text-center py-4 col-span-3">No managers found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedOrgAdminDashboard;
