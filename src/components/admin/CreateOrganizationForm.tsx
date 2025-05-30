
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    alias: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Building className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-blue-900">Create New Organization</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name *</Label>
              <Input
                id="org-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter organization name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-alias">Alias</Label>
              <Input
                id="org-alias"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                placeholder="Short name or acronym"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Organization description"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !formData.name.trim()}>
              {isCreating ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
