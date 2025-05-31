
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Settings, Utensils } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface EmployeeHeaderProps {
  onUpdateProfile: () => void;
}

const EmployeeHeader = ({ onUpdateProfile }: EmployeeHeaderProps) => {
  const isOnline = true;

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 dark:text-gray-400" />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to MinTid, Mary</h1>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-500 text-white text-xs">EMPLOYEE</Badge>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <Utensils className="w-4 h-4" />
                  Kitchen Department
                </div>
                <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={onUpdateProfile}>
            <Settings className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">My </span>Profile
          </Button>
        </div>
      </div>
    </header>
  );
};

export default EmployeeHeader;
