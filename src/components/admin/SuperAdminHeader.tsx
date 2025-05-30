
import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Crown,
  RefreshCw,
  Shield,
  CheckCircle,
  Search
} from 'lucide-react';

interface SuperAdminHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  organizationsCount: number;
  usersCount: number;
  departmentsCount: number;
  filteredOrganizationsCount: number;
  filteredUsersCount: number;
}

export default function SuperAdminHeader({
  searchTerm,
  onSearchChange,
  onRefresh,
  organizationsCount,
  usersCount,
  departmentsCount,
  filteredOrganizationsCount,
  filteredUsersCount
}: SuperAdminHeaderProps) {
  return (
    <div className="space-y-6 p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              System Administration
            </h1>
            <p className="text-lg text-slate-600 mt-1">
              Complete control over organizations and users
            </p>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center space-x-4">
          <Badge variant="destructive" className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold shadow-sm">
            <Shield className="h-4 w-4" />
            SUPER ADMIN
          </Badge>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg border border-green-200">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">System Active</span>
          </div>
        </div>
      </div>

      {/* Stats and Search Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Live Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-2xl font-bold text-slate-900">
              {filteredOrganizationsCount}/{organizationsCount}
            </div>
            <div className="text-sm text-slate-600">Organizations</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-2xl font-bold text-slate-900">
              {filteredUsersCount}/{usersCount}
            </div>
            <div className="text-sm text-slate-600">Users</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-2xl font-bold text-slate-900">{departmentsCount}</div>
            <div className="text-sm text-slate-600">Departments</div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users, organizations, tracking IDs..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <Button onClick={onRefresh} variant="outline" size="sm" className="shadow-sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
