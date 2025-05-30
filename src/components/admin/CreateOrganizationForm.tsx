
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Building, X } from 'lucide-react';

interface CreateOrganizationFormProps {
  isCreating: boolean;
  onCancel: () => void;
  onSubmit: (orgData: {
    name: string;
    description: string;
    alias: string;
  }) => void;
}

export default function CreateOrganizationForm({
  isCreating,
  onCancel,
  onSubmit
}: CreateOrganizationFormProps) {
  const [orgData, setOrgData] = useState({
    name: '',
    description: '',
    alias: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(orgData);
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building className="h-6 w-6" />
            <CardTitle>Create New Organization</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white hover:bg-blue-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="org-name">Organization Name *</Label>
              <Input
                id="org-name"
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                placeholder="Enter organization name"
                required
              />
            </div>
            <div>
              <Label htmlFor="org-alias">Alias (Optional)</Label>
              <Input
                id="org-alias"
                value={orgData.alias}
                onChange={(e) => setOrgData({ ...orgData, alias: e.target.value })}
                placeholder="Short name or abbreviation"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="org-description">Description (Optional)</Label>
            <Textarea
              id="org-description"
              value={orgData.description}
              onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
              placeholder="Describe the organization"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
