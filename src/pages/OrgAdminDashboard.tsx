
import React from 'react';
import EnhancedOrgAdminDashboard from '@/components/EnhancedOrgAdminDashboard';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useTranslation } from '@/hooks/useTranslation';

const OrgAdminDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { t, currentLanguage } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
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
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded text-white flex items-center justify-center font-bold text-sm">
                M
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">{t('appName')} {t('organizationManagement')}</h1>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">ORG ADMIN</span>
                  <span className="text-xs sm:text-sm text-gray-600">{t('tagline')}</span>
                </div>
              </div>
            </div>
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
