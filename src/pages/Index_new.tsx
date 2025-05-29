import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, BarChart3, Clock, Settings, LogOut, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import HoursWorkedChart from '@/components/HoursWorkedChart';
import WorkHoursStats from '@/components/WorkHoursStats';
import ImageUpload from '@/components/ImageUpload';
import TaskManagement from '@/components/TaskManagement';
import ReportsManagement from '@/components/ReportsManagement';
import Footer from '@/components/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [language, setLanguage] = useState('English');
  const { user, logout, hasRole } = useAuth();

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
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">MinTid</h2>
                  </div>
                  
                  <div className="space-y-2">
                    <Link 
                      to="/role-selector" 
                      className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      🎭 Switch Role
                    </Link>
                    {hasRole(['super_admin', 'org_admin']) && (
                      <Link 
                        to="/admin" 
                        className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        ⚙️ Admin Panel
                      </Link>
                    )}
                    <button 
                      onClick={logout}
                      className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Logo */}
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">MinTid</h1>
            <span className="hidden sm:block text-sm text-gray-600">Work Schedule Calendar</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-20 sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Español</SelectItem>
                <SelectItem value="French">Français</SelectItem>
                <SelectItem value="German">Deutsch</SelectItem>
                <SelectItem value="Swedish">Svenska</SelectItem>
                <SelectItem value="Arabic">العربية</SelectItem>
              </SelectContent>
            </Select>
            
            <ThemeToggle />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/role-selector">
                <Button variant="outline" size="sm">
                  🎭 Switch Role
                </Button>
              </Link>
              
              {hasRole(['super_admin', 'org_admin']) && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
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
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            {/* AI Upload Section */}
            <div className="w-full">
              <ImageUpload />
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
                    <ScheduleCalendar currentDate={currentDate} />
                  </CardContent>
                </Card>
              </div>

              {/* Stats Section */}
              <div className="space-y-6">
                <WorkHoursStats />
                <HoursWorkedChart />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsManagement />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
