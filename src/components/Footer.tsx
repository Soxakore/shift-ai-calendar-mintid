
import React from 'react';
import { Calendar } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-gray-900 dark:text-slate-100">MinTid</span>
            <span className="text-gray-600 dark:text-slate-300 text-sm">Work Schedule Calendar</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-300">
            <span>© {currentYear} MinTid. All rights reserved.</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 text-center text-xs text-gray-500 dark:text-slate-400">
          Professional work schedule management platform
        </div>
      </div>
    </footer>
  );
};

export default Footer;
