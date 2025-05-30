
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
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Create New Organization</CardTitle>
              <p className="text-blue-100 text-sm">Add a new organization to the system</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="org-name" className="text-slate-700 dark:text-slate-300 font-medium">Organization Name *</Label>
              <Input
                id="org-name"
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                placeholder="Enter organization name"
                required
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-alias" className="text-slate-700 dark:text-slate-300 font-medium">Alias (Optional)</Label>
              <Input
                id="org-alias"
                value={orgData.alias}
                onChange={(e) => setOrgData({ ...orgData, alias: e.target.value })}
                placeholder="Short name or abbreviation"
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="org-description" className="text-slate-700 dark:text-slate-300 font-medium">Description (Optional)</Label>
            <Textarea
              id="org-description"
              value={orgData.description}
              onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
              placeholder="Describe the organization"
              rows={3}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Building className="h-4 w-4 mr-2" />
                  Create Organization
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
