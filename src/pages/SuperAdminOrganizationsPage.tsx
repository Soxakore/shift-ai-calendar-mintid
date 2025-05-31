
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Users, Calendar, Plus, Edit, Trash2, Pause, Play } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateOrganizationForm from '@/components/admin/CreateOrganizationForm';
import OrganizationPauseManager from '@/components/admin/OrganizationPauseManager';

const SuperAdminOrganizationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch organizations and profiles
  const fetchData = async () => {
    try {
      const [orgsResponse, profilesResponse] = await Promise.all([
        supabase.from('organizations').select('*').order('name'),
        supabase.from('profiles').select('*').order('display_name')
      ]);

      if (orgsResponse.data) setOrganizations(orgsResponse.data);
      if (profilesResponse.data) setProfiles(profilesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('organizations-page-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizations'
        },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUserCount = (orgId: string) => {
    return profiles.filter(profile => profile.organization_id === orgId).length;
  };

  const handleCreateOrganization = (orgData: any) => {
    setShowCreateForm(false);
    toast({
      title: "✅ Organization Created",
      description: "New organization has been successfully created",
    });
  };

  const handleOrganizationPauseChange = (orgId: string, isPaused: boolean) => {
    setOrganizations(prev => 
      prev.map(org => 
        org.id === orgId 
          ? { ...org, is_paused: isPaused, paused_at: isPaused ? new Date().toISOString() : null }
          : org
      )
    );
  };

  const filteredOrganizations = organizations.filter(org => 
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.alias?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/super-admin')}
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Organization Management</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Manage all organizations in the system</p>
            </div>
            
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-white dark:bg-slate-800"
          />
        </div>

        {/* Create Organization Form */}
        {showCreateForm && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateOrganizationForm
                  isCreating={false}
                  onCancel={() => setShowCreateForm(false)}
                  onSubmit={handleCreateOrganization}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Building className="w-8 h-8 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      {org.alias && (
                        <Badge variant="outline" className="mt-1">{org.alias}</Badge>
                      )}
                    </div>
                  </div>
                  <OrganizationPauseManager 
                    organization={org}
                    onPauseChange={handleOrganizationPauseChange}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {org.description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>{getUserCount(org.id)} users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>Created {new Date(org.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {org.organization_number && (
                    <div className="text-xs text-slate-500 font-mono">
                      ID: {org.organization_number}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrganizations.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No organizations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminOrganizationsPage;
