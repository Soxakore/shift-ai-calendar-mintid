
import React, { useEffect, useState } from 'react';
import EnhancedOrgAdminDashboard from '@/components/EnhancedOrgAdminDashboard';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Shield, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

const OrgAdminDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useSupabaseAuth();
  const { toast } = useToast();
  const [superAdminContext, setSuperAdminContext] = useState<{
    id: string;
    name: string;
    returnUrl: string;
  } | null>(null);

  useEffect(() => {
    // Check if super admin is viewing this organization
    const storedContext = sessionStorage.getItem('superAdminViewingOrg');
    if (storedContext) {
      setSuperAdminContext(JSON.parse(storedContext));
    }
  }, []);

  const handleReturnToSuperAdmin = () => {
    sessionStorage.removeItem('superAdminViewingOrg');
    navigate('/super-admin');
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />
      
      {/* Super Admin Viewing Banner */}
      {superAdminContext && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mx-4 mt-4 rounded-lg">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-200">
              <strong>Super Admin View:</strong> You are viewing {superAdminContext.name}'s organization admin panel
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReturnToSuperAdmin}
              className="ml-4 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Return to Super Admin
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {t('appName')} {t('organizationManagement')}
                  {superAdminContext && (
                    <span className="text-blue-600 dark:text-blue-400 ml-2">
                      - {superAdminContext.name}
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    {superAdminContext ? 'SUPER ADMIN VIEW' : 'ORG ADMIN'}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('tagline')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {!superAdminContext && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                className="shadow-sm hover:shadow-md transition-shadow text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <EnhancedOrgAdminDashboard />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default OrgAdminDashboard;
