
import React from 'react';
import { Button } from '../ui/button';
import { Building, UserPlus } from 'lucide-react';

interface QuickActionsProps {
  onCreateOrganization: () => void;
  onCreateUser: () => void;
  isCreatingOrg: boolean;
  isCreatingUser: boolean;
}

export default function QuickActions({
  onCreateOrganization,
  onCreateUser,
  isCreatingOrg,
  isCreatingUser
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Button 
        onClick={onCreateOrganization}
        className="h-24 text-left justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        disabled={isCreatingOrg}
        size="lg"
      >
        <Building className="h-8 w-8 mr-4 flex-shrink-0" />
        <div>
          <div className="font-semibold text-lg">Create Organization</div>
          <div className="text-sm text-blue-100 mt-1">Add new company with auto-numbering</div>
        </div>
      </Button>
      
      <Button 
        onClick={onCreateUser}
        className="h-24 text-left justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        disabled={isCreatingUser}
        size="lg"
      >
        <UserPlus className="h-8 w-8 mr-4 flex-shrink-0" />
        <div>
          <div className="font-semibold text-lg">Create User</div>
          <div className="text-sm text-green-100 mt-1">Instant activation with tracking ID</div>
        </div>
      </Button>
    </div>
  );
}
