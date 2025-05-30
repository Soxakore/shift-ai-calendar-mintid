
import React, { useState, useEffect } from 'react';
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
  Settings, 
  BarChart3,
  Plus,
  UserCheck,
  Calendar,
  TrendingUp,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  ArrowUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import dataStore from '@/lib/dataStore';
import SickNoticeModal from '@/components/SickNoticeModal';
import QRCodeScanner from '@/components/QRCodeScanner';

const EnhancedOrgAdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [showPromoteEmployee, setShowPromoteEmployee] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    departmentId: '',
    userType: 'employee' as const
  });
  
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Load dashboard data and set up real-time updates
  useEffect(() => {
    if (!user?.organizationId) return;

    const loadData = () => {
      const data = dataStore.getTodaysData(user.organizationId!);
      const departments = dataStore.getDepartments(user.organizationId);
      const allUsers = dataStore.getUsers(user.organizationId);
      const sickNotices = dataStore.getSickNotices(user.organizationId, 'pending');
      
      setDashboardData({
        ...data,
        departments,
        allUsers,
        sickNotices,
        managers: allUsers.filter(u => u.userType === 'manager'),
        recentActivities: generateRecentActivities(allUsers, sickNotices)
      });
    };

    loadData();

    // Subscribe to real-time updates - now returns unsubscribe functions
    const unsubscribes = [
      dataStore.subscribe('user_added', loadData),
      dataStore.subscribe('user_updated', loadData),
      dataStore.subscribe('department_added', loadData),
      dataStore.subscribe('sick_notice_submitted', loadData),
      dataStore.subscribe('time_logged', loadData)
    ];

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [user?.organizationId]);

  const generateRecentActivities = (users: any[], sickNotices: any[]) => {
    const activities = [];
    
    // Recent sick notices
    sickNotices.slice(0, 3).forEach(notice => {
      const employee = users.find(u => u.id === notice.userId);
      activities.push({
        id: `sick_${notice.id}`,
        type: 'sick_notice',
        message: `${employee?.displayName || 'Employee'} submitted sick notice`,
        time: notice.submittedAt,
        priority: 'high'
      });
    });
    
    // Recent user additions (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    users.filter(u => new Date(u.createdAt) > yesterday).forEach(user => {
      activities.push({
        id: `user_${user.id}`,
        type: 'new_user',
        message: `New employee added: ${user.displayName}`,
        time: user.createdAt,
        priority: 'normal'
      });
    });
    
    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  };

  const handleAddEmployee = async () => {
    if (!user?.organizationId || !newEmployee.username || !newEmployee.displayName || !newEmployee.departmentId) {
      toast({
        title: t('error'),
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const addedUser = dataStore.addUser({
        ...newEmployee,
        organizationId: user.organizationId,
        roleId: 'employee_role',
        password: newEmployee.password || 'temp123',
        isActive: true,
        createdBy: user.id
      });

      toast({
        title: t('success'),
        description: `Employee ${addedUser.displayName} added successfully`
      });

      setNewEmployee({
        username: '',
        displayName: '',
        email: '',
        password: '',
        departmentId: '',
        userType: 'employee'
      });
      setShowAddEmployee(false);
    } catch (error) {
      toast({
        title: t('error'),
        description: "Failed to add employee",
        variant: "destructive"
      });
    }
  };

  const handleCreateDepartment = async () => {
    if (!user?.organizationId || !newDepartment.name) {
      toast({
        title: t('error'),
        description: "Please provide a department name",
        variant: "destructive"
      });
      return;
    }

    try {
      const addedDepartment = dataStore.addDepartment({
        ...newDepartment,
        organizationId: user.organizationId
      });

      toast({
        title: t('success'),
        description: `Department ${addedDepartment.name} created successfully`
      });

      setNewDepartment({
        name: '',
        description: '',
        color: '#3b82f6'
      });
      setShowCreateDepartment(false);
    } catch (error) {
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
      const success = dataStore.promoteUser(selectedEmployeeId, 'manager', 'manager_role');
      
      if (success) {
        toast({
          title: t('success'),
          description: "Employee promoted to manager successfully"
        });
        setShowPromoteEmployee(false);
        setSelectedEmployeeId('');
      } else {
        throw new Error('Failed to promote');
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: "Failed to promote employee",
        variant: "destructive"
      });
    }
  };

  const approveSickNotice = async (noticeId: string) => {
    try {
      const success = dataStore.approveSickNotice(noticeId, user?.id || '');
      if (success) {
        toast({
          title: t('success'),
          description: "Sick notice approved"
        });
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: "Failed to approve sick notice",
        variant: "destructive"
      });
    }
  };

  if (!dashboardData) {
    return <div className="p-6">{t('loading')}...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('organizationManagement')}</h1>
          <p className="text-muted-foreground">
            {t('appName')} - {t('tagline')}
          </p>
        </div>
        <div className="flex space-x-2">
          <SickNoticeModal trigger={
            <Button variant="outline" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t('sickNotice')}
            </Button>
          } />
          <QRCodeScanner trigger={
            <Button variant="outline" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              {t('qrTimeLogging')}
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
                <p className="text-sm font-medium text-blue-800">{t('totalEmployees')}</p>
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
                <p className="text-sm font-medium">{t('activeToday')}</p>
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
                <p className="text-sm font-medium">{t('departments')}</p>
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
                <p className="text-sm font-medium">{t('managers')}</p>
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
                <h3 className="font-semibold">{t('addEmployee')}</h3>
                <p className="text-sm text-muted-foreground">Add new team members</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('addEmployee')}</DialogTitle>
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
                    value={newEmployee.displayName}
                    onChange={(e) => setNewEmployee({...newEmployee, displayName: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={newEmployee.departmentId} onValueChange={(value) => setNewEmployee({...newEmployee, departmentId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboardData.departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddEmployee(false)}>{t('cancel')}</Button>
                <Button onClick={handleAddEmployee}>{t('add')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPromoteEmployee} onOpenChange={setShowPromoteEmployee}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <ArrowUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">{t('promoteToManager')}</h3>
                <p className="text-sm text-muted-foreground">Promote employees</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('promoteToManager')}</DialogTitle>
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
                    {dashboardData.allUsers.filter((u: any) => u.userType === 'employee').map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPromoteEmployee(false)}>{t('cancel')}</Button>
                <Button onClick={handlePromoteEmployee} disabled={!selectedEmployeeId}>{t('promoteToManager')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCreateDepartment} onOpenChange={setShowCreateDepartment}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">{t('createDepartment')}</h3>
                <p className="text-sm text-muted-foreground">Add new departments</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('createDepartment')}</DialogTitle>
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
              <div>
                <Label>Color</Label>
                <Input
                  type="color"
                  value={newDepartment.color}
                  onChange={(e) => setNewDepartment({...newDepartment, color: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDepartment(false)}>{t('cancel')}</Button>
                <Button onClick={handleCreateDepartment}>{t('create')}</Button>
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
              {t('today')}'s {t('schedule')} Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.schedules.map((schedule: any) => {
                const employee = dashboardData.allUsers.find((u: any) => u.id === schedule.userId);
                return (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{employee?.displayName || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{schedule.startTime} - {schedule.endTime}</p>
                    </div>
                    <Badge variant={schedule.status === 'checked-in' ? 'default' : 'outline'}>
                      {schedule.status}
                    </Badge>
                  </div>
                );
              })}
              {dashboardData.schedules.length === 0 && (
                <p className="text-muted-foreground text-center py-4">{t('noData')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Organization Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.type === 'sick_notice' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                    {activity.type === 'new_user' && <UserPlus className="w-4 h-4 text-blue-500" />}
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {activity.type === 'sick_notice' && (
                    <Button size="sm" onClick={() => approveSickNotice(activity.id.replace('sick_', ''))}>
                      {t('approve')}
                    </Button>
                  )}
                </div>
              ))}
              {dashboardData.recentActivities.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No recent activities</p>
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
            Current {t('managers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.managers.map((manager: any) => {
              const department = dashboardData.departments.find((d: any) => d.id === manager.departmentId);
              return (
                <div key={manager.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{manager.displayName}</p>
                      <p className="text-sm text-gray-600">{department?.name || 'Unknown Department'}</p>
                      <Badge variant="secondary" className="text-xs">
                        {manager.userType}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedOrgAdminDashboard;
