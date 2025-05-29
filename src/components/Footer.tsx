import React from 'react';
import { Calendar } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">MinTid</span>
            <span className="text-gray-600 text-sm">Work Schedule Calendar</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>© {currentYear} MinTid. All rights reserved.</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          Professional work schedule management platform
        </div>
      </div>
    </footer>
  );
};

export default Footer;
