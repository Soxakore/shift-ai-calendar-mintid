
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  LogOut,
  Settings
} from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />
      
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    MinTid Super Admin
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm">
                      SUPER ADMIN
                    </Badge>
                    <span className="text-sm text-muted-foreground">System Management Console</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                className="shadow-sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
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
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Management Interface */}
          <Card className="border shadow-lg bg-card">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-xl font-semibold text-foreground">
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
