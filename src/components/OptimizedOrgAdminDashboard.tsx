
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
  UserCheck,
  Calendar,
  Clock,
  AlertTriangle,
  UserPlus,
  ArrowUp,
  Shield,
  Download
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Department = Tables<'departments'>;

interface ExtendedProfile extends Profile {
  department_name?: string;
}

const OptimizedOrgAdminDashboard = () => {
  const { profile } = useSupabaseAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    departments, 
    profiles: allUsers, 
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

    return {
      users: orgUsers,
      departments: orgDepartments,
      totalEmployees: orgUsers.length,
      managers: orgUsers.filter(u => u.user_type === 'manager'),
    };
  }, [profile?.organization_id, allUsers, departments]);

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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Today</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
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

export default OptimizedOrgAdminDashboard;
