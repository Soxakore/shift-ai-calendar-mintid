
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Building, Users, Trash2, Calendar } from 'lucide-react';

interface OrganizationsListProps {
  organizations: Array<{
    id: string;
    name: string;
    description?: string;
    alias?: string;
    organization_number?: string;
    created_at: string;
  }>;
  profiles: Array<{
    organization_id?: string;
  }>;
  departments: Array<{
    organization_id: string;
  }>;
  deletingOrgId: string | null;
  onDelete: (orgId: string, orgName: string) => void;
}

export default function OrganizationsList({
  organizations,
  profiles,
  departments,
  deletingOrgId,
  onDelete
}: OrganizationsListProps) {
  const getUserCount = (orgId: string) => {
    return profiles.filter(p => p.organization_id === orgId).length;
  };

  const getDepartmentCount = (orgId: string) => {
    return departments.filter(d => d.organization_id === orgId).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Organizations ({organizations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {organizations.map((org) => (
            <div key={org.id} className="p-4 border rounded-lg hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    {org.alias && (
                      <Badge variant="secondary">
                        {org.alias}
                      </Badge>
                    )}
                    {org.organization_number && (
                      <Badge variant="outline">
                        {org.organization_number}
                      </Badge>
                    )}
                  </div>
                  {org.description && (
                    <p className="text-slate-600 mb-2">{org.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {getUserCount(org.id)} users
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {getDepartmentCount(org.id)} departments
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(org.id, org.name)}
                  disabled={deletingOrgId === org.id}
                  className="ml-4"
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
          ))}
          {organizations.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No organizations found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
