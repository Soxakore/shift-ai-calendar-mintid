
import { ReactNode } from 'react';
import { Calendar } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">MinTid</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        
        {children}
      </div>
    </div>
  );
};
