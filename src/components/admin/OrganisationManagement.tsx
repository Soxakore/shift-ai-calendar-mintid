import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { 
  Building2, 
  Users, 
  UserPlus, 
  Briefcase, 
  Shield,
  ChevronRight,
  Settings,
  Trash2,
  Edit3,
  Plus
} from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CreateOrganisationForm from './CreateOrganisationForm';
import OrganisationsList from './OrganisationsList';
import { getOrganizationAlias, getOrganizationDescription } from '@/lib/organizationHelpers';

const OrganisationManagement = () => {
  const { organisations, profiles, departments, refetchOrganisations } = useSupabaseData();
  const { toast } = useToast();
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [newDeptData, setNewDeptData] = useState({
    name: '',
    description: ''
  });

  const handleCreateOrganisation = async (orgData: {
    name: string;
    description: string;
    alias: string;
  }) => {
    setIsCreating(true);
    try {
      console.log('Creating organisation with data:', orgData);
      
      const { data, error } = await supabase
        .from('organisations')
        .insert([{
          name: orgData.name.trim(),
          settings_json: {
            alias: orgData.alias?.trim() || null,
            description: orgData.description?.trim() || null
          }
        }])
        .select()
        .single();

      if (error) {
        console.error('Organisation creation error:', error);
        toast({
          title: "❌ Error",
          description: error.message || "Failed to create organisation",
          variant: "destructive"
        });
        return;
      }

      console.log('Organisation created successfully:', data);
      
      toast({
        title: "✅ Success",
        description: `Organisation "${orgData.name}" created successfully`,
      });

      setShowCreateOrg(false);
      refetchOrganisations();
      
    } catch (error) {
      console.error('Unexpected error creating organisation:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteOrganisation = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to delete "${orgName}"? This will also delete all associated users, departments, and credentials. This action cannot be undone.`)) {
      return;
    }

    setDeletingOrgId(orgId);
    try {
      console.log('🗑️ Safely deleting organisation:', orgName);
      
      // Use the safe deletion function
      const { data, error } = await supabase.rpc('safe_delete_organisation', {
        org_id: orgId
      });

      if (error) {
        console.error('Organisation deletion error:', error);
        toast({
          title: "❌ Error",
          description: error.message || "Failed to delete organisation",
          variant: "destructive"
        });
        return;
      }

      if (data && !data.success) {
        console.error('Deletion failed:', data);
        toast({
          title: "❌ Error",
          description: data.message || "Failed to delete organisation",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Organisation deleted:', data);
      toast({
        title: "✅ Success",
        description: `Organisation "${orgName}" and all related data deleted successfully`,
      });

      refetchOrganisations();
      
    } catch (error) {
      console.error('Unexpected error deleting organisation:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setDeletingOrgId(null);
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDeptData.name || !selectedOrg) {
      toast({
        title: "❌ Validation Error",
        description: "Department name and organisation selection are required",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingDept(true);
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert([{
          name: newDeptData.name.trim(),
          description: newDeptData.description?.trim() || null,
          organisation_id: selectedOrg
        }])
        .select()
        .single();

      if (error) {
        console.error('Department creation error:', error);
        toast({
          title: "❌ Error",
          description: error.message || "Failed to create department",
          variant: "destructive"
        });
        return;
      }

      console.log('Department created successfully:', data);
      
      toast({
        title: "✅ Success",
        description: `Department "${newDeptData.name}" created successfully`,
      });

      setNewDeptData({ name: '', description: '' });
      setIsCreateDeptOpen(false);
      
      // Refresh data
      window.location.reload();
      
    } catch (error) {
      console.error('Unexpected error creating department:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreatingDept(false);
    }
  };

  const currentOrg = organisations.find(org => org.id === selectedOrg);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Organisation Management</h1>
            <p className="text-muted-foreground">
              Manage organisations, view details, and create new organisations
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateOrg(!showCreateOrg)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create Organisation
        </Button>
      </div>

      {/* Create Organisation Form */}
      {showCreateOrg && (
        <CreateOrganisationForm
          isCreating={isCreating}
          onCancel={() => setShowCreateOrg(false)}
          onSubmit={handleCreateOrganisation}
        />
      )}

      {/* Organisations List */}
      <OrganisationsList
        organisations={organisations.map(org => ({
          ...org,
          settings_json: org.settings_json as Record<string, unknown> || {}
        }))}
        profiles={profiles}
        departments={departments}
        deletingOrgId={deletingOrgId}
        onDelete={handleDeleteOrganisation}
      />

      {/* Organisation Details */}
      {organisations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Organisation Details</CardTitle>
            <CardDescription>Select an organisation to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an organisation to view details" />
              </SelectTrigger>
              <SelectContent>
                {organisations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>{org.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentOrg && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Organisation</p>
                          <p className="text-lg font-bold">{currentOrg.name}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Users</p>
                          <p className="text-lg font-bold">
                            {profiles.filter(p => p.organisation_id === currentOrg.id).length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="text-sm font-medium">Departments</p>
                          <p className="text-lg font-bold">
                            {departments.filter(d => d.organisation_id === currentOrg.id).length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Department Management Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Department Management
                      </CardTitle>
                      <Dialog open={isCreateDeptOpen} onOpenChange={setIsCreateDeptOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Department
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Create New Department</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="dept_name" className="text-right">Name</Label>
                              <Input
                                id="dept_name"
                                value={newDeptData.name}
                                onChange={(e) => setNewDeptData(prev => ({...prev, name: e.target.value}))}
                                className="col-span-3"
                                placeholder="Engineering"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="dept_description" className="text-right">Description</Label>
                              <Textarea
                                id="dept_description"
                                value={newDeptData.description}
                                onChange={(e) => setNewDeptData(prev => ({...prev, description: e.target.value}))}
                                className="col-span-3"
                                placeholder="Software development team"
                                rows={3}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsCreateDeptOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateDepartment} disabled={isCreatingDept}>
                              {isCreatingDept ? "Creating..." : "Create Department"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {departments.filter(d => d.organisation_id === currentOrg.id).length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No departments found. Create your first department to organise users.
                        </p>
                      ) : (
                        departments
                          .filter(d => d.organisation_id === currentOrg.id)
                          .map(dept => {
                            const deptUsers = profiles.filter(u => u.department_id === dept.id);
                            return (
                              <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{dept.name}</h4>
                                    <p className="text-sm text-muted-foreground">{dept.description || 'No description'}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge variant="outline">{deptUsers.length} Users</Badge>
                                      <Badge variant="outline">
                                        {deptUsers.filter(u => u.is_active).length} Active
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="outline" size="sm">
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </CardContent>
                </Card>

                {getOrganizationDescription(currentOrg) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{getOrganizationDescription(currentOrg)}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-2">{new Date(currentOrg.created_at).toLocaleDateString()}</span>
                    </div>
                    {getOrganizationAlias(currentOrg) && (
                      <div>
                        <span className="font-medium">Alias:</span>
                        <span className="ml-2">{getOrganizationAlias(currentOrg)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganisationManagement;
