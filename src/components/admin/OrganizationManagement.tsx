
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Building2, 
  Users, 
  UserPlus, 
  Briefcase, 
  Shield,
  ChevronRight,
  Settings,
  Trash2,
  Edit3
} from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CreateOrganizationForm from './CreateOrganizationForm';
import OrganizationsList from './OrganizationsList';

const OrganizationManagement = () => {
  const { organizations, profiles, departments, refetchOrganizations } = useSupabaseData();
  const { toast } = useToast();
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);

  const handleCreateOrganization = async (orgData: {
    name: string;
    description: string;
    alias: string;
  }) => {
    setIsCreating(true);
    try {
      console.log('Creating organization with data:', orgData);
      
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: orgData.name.trim(),
          description: orgData.description.trim() || null,
          alias: orgData.alias.trim() || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Organization creation error:', error);
        toast({
          title: "❌ Error",
          description: error.message || "Failed to create organization",
          variant: "destructive"
        });
        return;
      }

      console.log('Organization created successfully:', data);
      
      toast({
        title: "✅ Success",
        description: `Organization "${orgData.name}" created successfully`,
      });

      setShowCreateOrg(false);
      refetchOrganizations();
      
    } catch (error) {
      console.error('Unexpected error creating organization:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to delete "${orgName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingOrgId(orgId);
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) {
        console.error('Organization deletion error:', error);
        toast({
          title: "❌ Error",
          description: error.message || "Failed to delete organization",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "✅ Success",
        description: `Organization "${orgName}" deleted successfully`,
      });

      refetchOrganizations();
      
    } catch (error) {
      console.error('Unexpected error deleting organization:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setDeletingOrgId(null);
    }
  };

  const currentOrg = organizations.find(org => org.id === selectedOrg);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Organization Management</h1>
            <p className="text-muted-foreground">
              Manage organizations, view details, and create new organizations
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateOrg(!showCreateOrg)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Create Organization Form */}
      {showCreateOrg && (
        <CreateOrganizationForm
          isCreating={isCreating}
          onCancel={() => setShowCreateOrg(false)}
          onSubmit={handleCreateOrganization}
        />
      )}

      {/* Organizations List */}
      <OrganizationsList
        organizations={organizations}
        profiles={profiles}
        departments={departments}
        deletingOrgId={deletingOrgId}
        onDelete={handleDeleteOrganization}
      />

      {/* Organization Details */}
      {organizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Select an organization to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an organization to view details" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
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
                          <p className="text-sm font-medium">Organization</p>
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
                            {profiles.filter(p => p.organization_id === currentOrg.id).length}
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
                            {departments.filter(d => d.organization_id === currentOrg.id).length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {currentOrg.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{currentOrg.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-2">{new Date(currentOrg.created_at).toLocaleDateString()}</span>
                    </div>
                    {currentOrg.alias && (
                      <div>
                        <span className="font-medium">Alias:</span>
                        <span className="ml-2">{currentOrg.alias}</span>
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

export default OrganizationManagement;
