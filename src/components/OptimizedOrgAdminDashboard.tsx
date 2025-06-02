import React, { useState, useCallback, useMemo, lazy, Suspense, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  UserCheck,
  Calendar,
  Clock,
  AlertTriangle,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  Eye,
  QrCode,
  Shield,
  History,
  Download,
  RefreshCw
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Tables } from '@/integrations/supabase/types';

// Lazy load components for better performance
const QRCodeGenerator = lazy(() => import('@/components/QRCodeGenerator'));
const TimeStampHistory = lazy(() => import('@/components/TimeStampHistory'));
const PasswordHistory = lazy(() => import('@/components/PasswordHistory'));

type Profile = Tables<'profiles'>;
type Department = Tables<'departments'>;
type Schedule = Tables<'schedules'>;
type SickNotice = Tables<'sick_notices'>;
type TimeLog = Tables<'time_logs'>;

interface ExtendedProfile extends Profile {
  departments?: { name: string; id: string };
}

const OptimizedOrgAdminDashboard = () => {
  const { profile: authProfile } = useSupabaseAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<ExtendedProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<ExtendedProfile | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    display_name: '',
    password: '',
    department_id: '',
    user_type: 'employee' as 'employee' | 'manager'
  });
  
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: ''
  });

  // Efficient data loading
  const loadData = useCallback(async () => {
    if (!authProfile || !authProfile.organization_id) {
      console.log('No authenticated user or organization_id found');
      return;
    }

    setLoading(true);
    try {
      // Load employees with department info
      const { data: employeesData } = await supabase
        .from('profiles')
        .select(`
          *,
          departments (name, id),
          password_histories (created_at),
          qr_codes (is_active, expires_at)
        `)
        .eq('organization_id', authProfile.organization_id)
        .neq('user_type', 'org_admin');

      // Load departments
      const { data: deptData } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', authProfile.organization_id);

      // Load recent time logs
      const { data: logsData } = await supabase
        .from('time_logs')
        .select('*')
        .eq('organization_id', authProfile.organization_id)
        .order('created_at', { ascending: false })
        .limit(100);

      setEmployees(employeesData || []);
      setDepartments(deptData || []);
      setTimeLogs(logsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load organization data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [authProfile, toast]);

  // Filtered employees for search
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.departments?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // Dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.is_active).length;
    const managers = employees.filter(emp => emp.user_type === 'manager').length;
    const todayLogs = timeLogs.filter(log => {
      const logDate = new Date(log.created_at).toDateString();
      const today = new Date().toDateString();
      return logDate === today;
    });
    const checkedInToday = todayLogs.filter(log => log.clock_in && !log.clock_out).length;

    return {
      totalEmployees,
      activeEmployees,
      managers,
      checkedInToday,
      totalDepartments: departments.length
    };
  }, [employees, departments, timeLogs]);

  // Employee management functions
  const handleAddEmployee = async () => {
    if (!newEmployee.username || !newEmployee.display_name || !newEmployee.department_id || !newEmployee.password) {
      toast({
        title: "❌ Error",
        description: "Please fill in all required fields including password",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate a temporary email for auth purposes
      const email = `${newEmployee.username}@${authProfile.organization_id}.mintid.local`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: newEmployee.password,
        options: {
          data: {
            username: newEmployee.username,
            display_name: newEmployee.display_name,
            user_type: newEmployee.user_type,
            organization_id: authProfile.organization_id,
            department_id: newEmployee.department_id,
            created_by: authProfile.id
          }
        }
      });

      if (error) {
        toast({
          title: "❌ Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Log password creation
      await supabase.from('password_histories').insert({
        user_id: data.user?.id,
        changed_by: authProfile.id,
        action: 'created',
        organization_id: authProfile.organization_id
      });

      toast({
        title: "✅ Success",
        description: `Employee ${newEmployee.display_name} added successfully`
      });

      setNewEmployee({ username: '', display_name: '', password: '', department_id: '', user_type: 'employee' });
      loadData();
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "❌ Error",
        description: "Failed to create employee",
        variant: "destructive"
      });
    }
  };

  const handlePromoteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: 'manager' })
        .eq('id', employeeId);

      if (error) throw error;

      toast({
        title: "✅ Success",
        description: "Employee promoted to manager"
      });
      loadData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to promote employee",
        variant: "destructive"
      });
    }
  };

  const handleDemoteManager = async (managerId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: 'employee' })
        .eq('id', managerId);

      if (error) throw error;

      toast({
        title: "✅ Success",
        description: "Manager demoted to employee"
      });
      loadData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to demote manager",
        variant: "destructive"
      });
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to remove this employee? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', employeeId);

      if (error) throw error;

      toast({
        title: "✅ Success",
        description: "Employee removed successfully"
      });
      loadData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to remove employee",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async () => {
    if (!selectedEmployee) {
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "❌ Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update password in Supabase Auth
      const { error: authError } = await supabase.auth.admin.updateUserById(
        selectedEmployee.id,
        { password: newPassword }
      );

      if (authError) throw authError;

      // Log password change
      await supabase.from('password_histories').insert({
        user_id: selectedEmployee.id,
        changed_by: authProfile.id,
        action: 'changed',
        organization_id: authProfile.organization_id
      });

      toast({
        title: "✅ Success",
        description: "Password updated successfully"
      });

      setShowPasswordDialog(false);
      setNewPassword('');
      setSelectedEmployee(null);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to update password",
        variant: "destructive"
      });
    }
  };

  const handleGenerateQRCode = async (employeeId: string) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

      const { error } = await supabase
        .from('qr_codes')
        .upsert({
          user_id: employeeId,
          organization_id: authProfile.organization_id,
          qr_code: `mintid-qr-${employeeId}-${Date.now()}`,
          expires_at: expiresAt.toISOString(),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "✅ Success",
        description: "QR Code generated successfully (30 days validity)"
      });
      loadData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDepartment.name) {
      toast({
        title: "❌ Error",
        description: "Department name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('departments')
        .insert({
          name: newDepartment.name,
          description: newDepartment.description,
          organization_id: authProfile.organization_id
        });

      if (error) throw error;

      toast({
        title: "✅ Success",
        description: "Department created successfully"
      });
      setNewDepartment({ name: '', description: '' });
      loadData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to create department",
        variant: "destructive"
      });
    }
  };

  const handleRemoveDepartment = async (deptId: string) => {
    if (!confirm('Are you sure you want to remove this department? All employees in this department will need to be reassigned.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', deptId);

      if (error) throw error;

      toast({
        title: "✅ Success",
        description: "Department removed successfully"
      });
      loadData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to remove department",
        variant: "destructive"
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Authentication checks
  if (!authProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the organization dashboard.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Debug logging for permission check
  console.log('🔍 OptimizedOrgAdminDashboard permission check:', {
    authProfile: authProfile,
    user_type: authProfile.user_type,
    includes_check: ['org_admin', 'super_admin'].includes(authProfile.user_type)
  });

  if (!['org_admin', 'super_admin'].includes(authProfile.user_type)) {
    console.log('❌ Access denied. User type:', authProfile.user_type);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this dashboard.</p>
          <p className="text-sm text-gray-500 mb-4">User type: {authProfile.user_type}</p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading organization dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Dashboard</h1>
          <p className="text-muted-foreground">Manage your organization efficiently</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.checkedInToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.managers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.totalDepartments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardMetrics.activeEmployees}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="history">Time History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Add Employee
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Add new employees to your organization</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>Create a new employee account</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newEmployee.username}
                      onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                      placeholder="john_doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_name">Full Name</Label>
                    <Input
                      id="display_name"
                      value={newEmployee.display_name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, display_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={newEmployee.department_id}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, department_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newEmployee.user_type}
                      onValueChange={(value: 'employee' | 'manager') => setNewEmployee({ ...newEmployee, user_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddEmployee} className="w-full">
                    Create Employee
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Add Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Create new departments</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Department</DialogTitle>
                  <DialogDescription>Add a new department to your organization</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dept_name">Department Name</Label>
                    <Input
                      id="dept_name"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      placeholder="e.g., Kitchen, Front Counter"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dept_desc">Description</Label>
                    <Input
                      id="dept_desc"
                      value={newDepartment.description}
                      onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                  <Button onClick={handleCreateDepartment} className="w-full">
                    Create Department
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab('history')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  View History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Check employee time logs and activities</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Employee List */}
          <div className="grid gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-lg">{employee.display_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          @{employee.username} • {employee.departments?.name}
                        </p>
                      </div>
                      <Badge variant={employee.user_type === 'manager' ? 'default' : 'secondary'}>
                        {employee.user_type}
                      </Badge>
                      {employee.qr_code_enabled && (
                        <Badge variant="outline" className="text-green-600">
                          <QrCode className="w-3 h-3 mr-1" />
                          QR Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Password Management */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowPasswordDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      {/* QR Code Management */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateQRCode(employee.id)}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>

                      {/* History */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowHistoryDialog(true);
                        }}
                      >
                        <History className="w-4 h-4" />
                      </Button>

                      {/* Role Management */}
                      {employee.user_type === 'employee' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePromoteEmployee(employee.id)}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDemoteManager(employee.id)}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Remove Employee */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveEmployee(employee.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Last Login:</span>{' '}
                      {employee.last_login ? new Date(employee.last_login).toLocaleString() : 'Never'}
                    </div>
                    <div>
                      <span className="font-medium">Password Changed:</span>{' '}
                      {employee.password_changed_at ? new Date(employee.password_changed_at).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4">
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{dept.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{dept.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>
                        {employees.filter(emp => emp.department_id === dept.id).length} employees
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveDepartment(dept.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Suspense fallback={<LoadingSpinner text="Loading time history..." />}>
            <TimeStampHistory timeLogs={timeLogs} employees={employees} />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update password for {selectedEmployee?.display_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleChangePassword} className="flex-1">
                Update Password
              </Button>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code for {selectedEmployee?.display_name}</DialogTitle>
            <DialogDescription>
              Print this QR code for employee to use for quick login
            </DialogDescription>
          </DialogHeader>
          <Suspense fallback={<LoadingSpinner text="Generating QR code..." />}>
            <QRCodeGenerator 
              employeeId={selectedEmployee?.id} 
              organizationId={authProfile.organization_id} 
            />
          </Suspense>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Employee History - {selectedEmployee?.display_name}</DialogTitle>
            <DialogDescription>
              Time logs and password change history
            </DialogDescription>
          </DialogHeader>
          <Suspense fallback={<LoadingSpinner text="Loading history..." />}>
            <PasswordHistory 
              employeeId={selectedEmployee?.id} 
              organizationId={authProfile.organization_id} 
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OptimizedOrgAdminDashboard;
