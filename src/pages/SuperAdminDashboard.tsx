
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  LogOut,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import SuperAdminUserManagement from '@/components/admin/SuperAdminUserManagement';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

const SuperAdminDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { signOut } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleHistoryClick = () => {
    navigate('/history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />
      
      {/* Modern Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    MinTid Super Admin
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm">
                      SUPER ADMIN
                    </Badge>
                    <span className="text-sm text-slate-600 dark:text-slate-400">System Management Console</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleHistoryClick}
                className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Management Interface */}
          <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                User & Organization Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SuperAdminUserManagement />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
