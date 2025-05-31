
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Building, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateManagerPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    phone_number: '',
    organization_id: '',
    department_id: '',
    password: ''
  });

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      
      if (data) setOrganizations(data);
    };

    fetchOrganizations();
  }, []);

  // Fetch departments when organization is selected
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!selectedOrgId) {
        setDepartments([]);
        return;
      }

      const { data } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', selectedOrgId)
        .order('name');
      
      if (data) setDepartments(data);
    };

    fetchDepartments();
  }, [selectedOrgId]);

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('create-manager-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizations'
        },
        () => {
          // Refetch organizations if needed
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'departments'
        },
        () => {
          // Refetch departments if needed
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'organization_id') {
      setSelectedOrgId(value);
      setFormData(prev => ({ ...prev, department_id: '' })); // Reset department
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.display_name || !formData.organization_id || !formData.password) {
      toast({
        title: "❌ Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${formData.username}@temp.com`, // Temporary email
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            display_name: formData.display_name,
            user_type: 'manager',
            organization_id: formData.organization_id,
            department_id: formData.department_id || null,
            phone_number: formData.phone_number || null
          }
        }
      });

      if (authError) throw authError;

      toast({
        title: "✅ Manager Created Successfully",
        description: `Manager "${formData.display_name}" has been created`,
      });

      // Reset form
      setFormData({
        username: '',
        display_name: '',
        phone_number: '',
        organization_id: '',
        department_id: '',
        password: ''
      });
      setSelectedOrgId('');

    } catch (error: any) {
      console.error('Error creating manager:', error);
      toast({
        title: "❌ Creation Failed",
        description: error.message || "Failed to create manager",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/super-admin')}
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create Manager</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Create a new manager account with appropriate permissions</p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Manager Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="manager.name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="Manager Name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organization">Organization *</Label>
                  <Select value={formData.organization_id} onValueChange={(value) => handleInputChange('organization_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {org.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Select 
                    value={formData.department_id} 
                    onValueChange={(value) => handleInputChange('department_id', value)}
                    disabled={!selectedOrgId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedOrgId ? "Select Department" : "Select Organization first"} />
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
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCreating ? (
                    'Creating Manager...'
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Manager
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => navigate('/super-admin')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{organizations.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Organizations</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{departments.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Departments Available</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <UserPlus className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">Manager</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Role Level</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateManagerPage;
