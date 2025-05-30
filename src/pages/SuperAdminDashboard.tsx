
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  Settings, 
  Shield, 
  BarChart3,
  Plus,
  Database,
  Globe,
  Calendar,
  LogOut
} from 'lucide-react';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import SuperAdminUserManagement from '@/components/admin/SuperAdminUserManagement';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

const SuperAdminDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { signOut } = useSupabaseAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "✅ Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "❌ Logout Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />
      {/* Header */}
      <header className="bg-white border-b px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">MinTid Super Admin Dashboard</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white text-xs">SUPER ADMIN</Badge>
                  <span className="text-xs sm:text-sm text-gray-600">System-wide Management</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Settings className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">System </span>Settings
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="text-xs sm:text-sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Log </span>Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <SuperAdminUserManagement />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
