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
    if (!confirm(`Are you sure you want to delete "${orgName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingOrgId(orgId);
    try {
      const { error } = await supabase
        .from('organisations')
        .delete()
        .eq('id', orgId);

      if (error) {
        console.error('Organisation deletion error:', error);
        toast({
          title: "❌ Error",
          description: error.message || "Failed to delete organisation",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "✅ Success",
        description: `Organisation "${orgName}" deleted successfully`,
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
        organisations={organisations}
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
