
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SuperAdminOrganizationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load organizations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter(org => 
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.alias?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to delete organization "${orgName}"?`)) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: "✅ Organization Deleted",
        description: `Organization "${orgName}" has been deleted successfully`,
      });
      
      fetchOrganizations(); // Refresh the list
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "❌ Error",
        description: "Failed to delete organization",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/super-admin')}
            className="text-slate-700 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization Management ({filteredOrganizations.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button 
                  onClick={() => navigate('/super-admin/create-organization')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Organization
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrganizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">
                        {org.name?.charAt(0).toUpperCase() || 'O'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{org.name}</h3>
                      {org.alias && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">Alias: {org.alias}</p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {org.description || 'No description'}
                      </p>
                      {org.organization_number && (
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          ID: {org.organization_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      Created: {new Date(org.created_at).toLocaleDateString()}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Organization
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteOrganization(org.id, org.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Organization
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredOrganizations.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No organizations found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminOrganizationsPage;
