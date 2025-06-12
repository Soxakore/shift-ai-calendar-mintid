
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Building, Users, Trash2, Calendar, Eye, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getOrganizationAlias, getOrganizationDescription } from '@/lib/organizationHelpers';

interface OrganisationsListProps {
  organisations: Array<{
    id: string;
    name: string;
    settings_json?: Record<string, unknown>;
    tracking_id?: string;
    created_at: string;
  }>;
  profiles: Array<{
    organisation_id?: string;
  }>;
  departments: Array<{
    organisation_id: string;
  }>;
  deletingOrgId: string | null;
  onDelete: (orgId: string, orgName: string) => void;
}

export default function OrganisationsList({
  organisations,
  profiles,
  departments,
  deletingOrgId,
  onDelete
}: OrganisationsListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getUserCount = (orgId: string) => {
    return profiles.filter(p => p.organisation_id === orgId).length;
  };

  const getDepartmentCount = (orgId: string) => {
    return departments.filter(d => d.organisation_id === orgId).length;
  };

  const handleViewOrgPanel = (orgId: string, orgName: string) => {
    sessionStorage.setItem('superAdminViewingOrg', JSON.stringify({
      id: orgId,
      name: orgName,
      returnUrl: '/super-admin'
    }));
    navigate('/org-admin');
  };

  const handleCopyOrgNumber = async (orgNumber: string) => {
    try {
      await navigator.clipboard.writeText(orgNumber);
      toast({
        title: "✅ Copied!",
        description: `Organisation number ${orgNumber} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "❌ Copy failed",
        description: "Could not copy organisation number to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Organisations ({organisations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {organisations.map((org) => (
            <div 
              key={org.id} 
              className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{org.name}</h3>
                    {getOrganizationAlias(org) && (
                      <Badge variant="secondary">
                        {getOrganizationAlias(org)}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Organisation Number Section - Always visible */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-md w-fit">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Organisation ID:</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {org.tracking_id || 'Not assigned'}
                      </Badge>
                      {org.tracking_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                          onClick={() => handleCopyOrgNumber(org.tracking_id!)}
                          title="Copy organisation number"
                        >
                          <Copy className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {getOrganizationDescription(org) && (
                    <p className="text-slate-600 dark:text-slate-400 mb-2">{getOrganizationDescription(org)}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="text-slate-900 dark:text-slate-100">{getUserCount(org.id)} users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span className="text-slate-900 dark:text-slate-100">{getDepartmentCount(org.id)} departments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-slate-900 dark:text-slate-100">Created {new Date(org.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrgPanel(org.id, org.name)}
                    className="hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Admin Panel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(org.id, org.name)}
                    disabled={deletingOrgId === org.id}
                  >
                    {deletingOrgId === org.id ? (
                      'Deleting...'
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {organisations.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No organisations found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
