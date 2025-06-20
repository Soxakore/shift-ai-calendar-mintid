
import React, { useState, useEffect, Suspense } from 'react';
import { Calendar, ChevronLeft, ChevronRight, BarChart3, Clock, Settings, LogOut, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { SupportedLanguage } from '@/lib/translations';
import { useToast } from '@/hooks/use-toast';
import WorkHoursStats from '@/components/WorkHoursStats';
import ImageScheduleParser from '@/components/ImageScheduleParser';
import SickNoticeModal from '@/components/SickNoticeModal';
import QRCodeScanner from '@/components/QRCodeScanner';
import Footer from '@/components/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import SEOHead from '@/components/SEOHead';

// Lazy loaded components
import { 
  LazyScheduleCalendar,
  LazyHoursWorkedChart,
  LazyTaskManagement,
  LazyReportsManagement
} from '@/components/LazyComponents';

// Analytics imports
import { trackFeatureUsage, trackScheduleAction, trackTaskAction, trackAuthAction } from '@/lib/analytics';
// SEO imports
import { createWebApplicationSchema, createOrganisationSchema, getPageMetadata } from '@/lib/seo';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user, logout, hasRole } = useAuth();
  const { t, currentLanguage, setLanguage, getLanguageName } = useTranslation();
  const { toast } = useToast();

  // Welcome message on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: `${t('appName')} 🎉`,
        description: `${t('loading')} ${user?.name || 'User'}! All features are now fully functional with real-time updates.`,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [user?.name, toast, t]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    
    trackScheduleAction('view', `month_${direction}`);
    
    const monthName = direction === 'prev' ? 'Previous' : 'Next';
    toast({
      title: `📅 ${t('calendar')}`,
      description: `${monthName} month loaded successfully!`,
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as SupportedLanguage);
    trackFeatureUsage('language_change', user?.role);
    toast({
      title: "🌐 Language Changed",
      description: `Interface language switched to ${getLanguageName(newLanguage as SupportedLanguage)}`,
    });
  };

  const handleLogout = async () => {
    trackAuthAction('logout', user?.role);
    await logout();
    toast({
      title: `👋 ${t('logout')}`,
      description: "You have been successfully logged out.",
    });
  };

  const handleTabChange = (tabValue: string) => {
    const tabNames = {
      calendar: t('calendar'),
      tasks: t('tasks'),
      reports: t('reports')
    };
    
    trackFeatureUsage(`tab_${tabValue}`, user?.role);
    
    toast({
      title: "📂 Tab Switched",
      description: `Switched to ${tabNames[tabValue as keyof typeof tabNames]} view`,
    });
  };

  const handleRoleSwitch = () => {
    trackFeatureUsage('role_switch', user?.role);
    toast({
      title: "🎭 Role Switcher",
      description: "Opening role selection panel...",
    });
  };

  const handleAdminPanel = () => {
    trackFeatureUsage('admin_panel_access', user?.role);
    toast({
      title: `⚙️ ${t('settings')}`,
      description: "Opening administrative dashboard...",
    });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : currentLanguage === 'sv' ? 'sv-SE' : currentLanguage === 'de' ? 'de-DE' : currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
  };

  const pageMetadata = getPageMetadata('home');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="home"
        structuredData={[
          createWebApplicationSchema(),
          createOrganisationSchema()
        ]}
      />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={currentLanguage === 'ar' ? 'right' : 'left'} className="w-80">
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">{t('appName')}</h2>
                  </div>
                  
                  <div className="space-y-2">
                    {hasRole('admin') && (
                      <Link 
                        to="/admin" 
                        className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={handleAdminPanel}
                      >
                        ⚙️ {t('settings')}
                      </Link>
                    )}
                    <SickNoticeModal trigger={
                      <button className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        🤒 {t('sickNotice')}
                      </button>
                    } />
                    <QRCodeScanner trigger={
                      <button className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        📱 {t('qrTimeLogging')}
                      </button>
                    } />
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Logo */}
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t('appName')}</h1>
            <span className="hidden sm:block text-sm text-gray-600">{t('tagline')}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector */}
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-20 sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="sv">Svenska</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
            
            <ThemeToggle />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/role-selector">
                <Button variant="outline" size="sm" onClick={handleRoleSwitch}>
                  🎭 Switch Role
                </Button>
              </Link>
              
              {hasRole('admin') && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" onClick={handleAdminPanel}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('settings')}
                  </Button>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <Tabs defaultValue="calendar" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">{t('calendar')}</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tasks')}</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('reports')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            {/* Enhanced Features Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImageScheduleParser onScheduleParsed={(schedules) => {
                toast({
                  title: t('success'),
                  description: `Added ${schedules.length} schedule entries from image`
                });
              }} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <SickNoticeModal />
                  <QRCodeScanner />
                </CardContent>
              </Card>
              
              <WorkHoursStats />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('prev')}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <h2 className="text-lg sm:text-xl font-semibold">{formatMonth(currentDate)}</h2>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('next')}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<LoadingSpinner text={`${t('loading')} ${t('calendar')}...`} />}>
                      <LazyScheduleCalendar currentDate={currentDate} />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="space-y-6">
                <Suspense fallback={<LoadingSpinner text={`${t('loading')} Charts...`} />}>
                  <LazyHoursWorkedChart />
                </Suspense>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Suspense fallback={<LoadingSpinner text={`${t('loading')} ${t('tasks')}...`} />}>
              <LazyTaskManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Suspense fallback={<LoadingSpinner text={`${t('loading')} ${t('reports')}...`} />}>
              <LazyReportsManagement />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
