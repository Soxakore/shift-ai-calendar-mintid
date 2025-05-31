
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload,
  Calendar,
  Clock,
  User,
  Settings, 
  BarChart3,
  CheckCircle,
  Utensils,
  MapPin,
  Bell,
  AlertTriangle,
  Shield,
  PieChart
} from 'lucide-react';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import WorkHoursStats from '@/components/WorkHoursStats';
import HoursWorkedChart from '@/components/HoursWorkedChart';
import MonthlyPrecisionChart from '@/components/MonthlyPrecisionChart';
import EnhancedScheduleCalendar from '@/components/EnhancedScheduleCalendar';

const EmployeeDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [systemStatus, setSystemStatus] = useState('operational'); // operational, maintenance, emergency
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date()); // Current month (December 2024)
  const [showPrecisionChart, setShowPrecisionChart] = useState(false);

  // Mock system status (in real app this would come from useSystemStatus hook)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockOut = () => {
    toast({
      title: "Clock Out Successful",
      description: "You have been clocked out at " + currentTime.toLocaleTimeString(),
    });
  };

  const handleViewSchedule = () => {
    navigate('/schedule');
  };

  const handleViewReports = () => {
    toast({
      title: "Reports Opened",
      description: "Loading your performance reports...",
    });
  };

  const handleViewNotifications = () => {
    toast({
      title: "Notifications",
      description: "You have 2 new notifications",
    });
  };

  const handleUpdateProfile = () => {
    toast({
      title: "Profile Settings",
      description: "Opening profile settings...",
    });
  };

  const handleViewDirectory = () => {
    toast({
      title: "Store Directory",
      description: "Loading store directory...",
    });
  };

  const handleUploadImage = () => {
    toast({
      title: "Upload Schedule",
      description: "Opening image upload for schedule...",
    });
  };

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

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Enhanced mock schedule data with various time formats for testing
  const scheduleData = [
    // This week's shifts with different time formats
    { day: 'Mon', date: 30, hours: '8', time: '09:00-17:00' }, // Standard format
    { day: 'Tue', date: 31, hours: '10', time: '08:15-18:30' }, // With minutes
    { day: 'Wed', date: 1, hours: '8', time: '9-17' },         // Short format
    { day: 'Thu', date: 2, hours: '9', time: '07:45-16:50' },  // Odd minutes
    { day: 'Fri', date: 3, hours: '12', time: '22:30-10:15' }, // Overnight shift
    
    // Previous data from May 2025 (for comparison)
    { day: 'Thu', date: 6, hours: '6', time: '7:15-13:30' },   // Single digit hour
    { day: 'Fri', date: 7, hours: '8', time: '09:00-17:00' },
    { day: 'Mon', date: 10, hours: '6', time: '8-14' },        // No colon format
    { day: 'Tue', date: 11, hours: '8', time: '09:30-17:45' },
    { day: 'Thu', date: 13, hours: '7', time: '10:15-17:30' },
    { day: 'Fri', date: 14, hours: '4', time: '13:00-17:00' },
    { day: 'Thu', date: 20, hours: '8', time: '22:00-06:00' },
    { day: 'Fri', date: 21, hours: '4', time: '14:30-18:45' },
    { day: 'Sat', date: 22, hours: '4', time: '10:00-14:00' }
  ];

  // Mock schedule data - now with time ranges for better calculation
  const urloardData = [
    { label: 'Total', hours: '32 h' },
    { label: 'Horus', hours: '148 h' }
  ];

  const toggleChartView = () => {
    setShowPrecisionChart(!showPrecisionChart);
    toast({
      title: showPrecisionChart ? "Weekly Chart View" : "Monthly Precision View",
      description: showPrecisionChart 
        ? "Switched to weekly hours chart" 
        : "Switched to monthly precision chart with detailed analytics",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />

      {/* System Status Banner */}
      {systemStatus !== 'operational' && (
        <Alert className={`mx-4 mt-4 ${
          systemStatus === 'emergency' 
            ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' 
            : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
        }`}>
          <AlertTriangle className={`h-4 w-4 ${
            systemStatus === 'emergency' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
          }`} />
          <AlertDescription className={
            systemStatus === 'emergency' 
              ? 'text-red-800 dark:text-red-200' 
              : 'text-yellow-800 dark:text-yellow-200'
          }>
            <strong>System Status:</strong> {systemStatus === 'emergency' ? 'Emergency Mode Active' : 'Maintenance Mode'} - 
            Contact your manager for updates
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 dark:text-gray-400" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to MinTid, Mary</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-500 text-white text-xs">EMPLOYEE</Badge>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <Utensils className="w-4 h-4" />
                    Kitchen Department
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={handleUpdateProfile}>
            <Settings className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">My </span>Profile
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your work schedule</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Calendar className="w-5 h-5" />
                    Calendar
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      className="border-gray-300 dark:border-slate-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[120px] text-center">
                      {monthName}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      className="border-gray-300 dark:border-slate-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <EnhancedScheduleCalendar 
                  currentDate={currentDate}
                  scheduleData={scheduleData}
                />

                {/* Upload Button */}
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleUploadImage}
                    className="flex items-center gap-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <Upload className="w-4 h-4" />
                    Upload image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            {/* Live Hours Worked Stats */}
            <WorkHoursStats scheduleData={scheduleData} currentDate={currentDate} />

            {/* Chart with Toggle */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    {showPrecisionChart ? <PieChart className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    {showPrecisionChart ? 'Monthly Analytics' : 'Weekly Chart'}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleChartView}
                    className="flex items-center gap-2"
                  >
                    {showPrecisionChart ? <BarChart3 className="w-4 h-4" /> : <PieChart className="w-4 h-4" />}
                    {showPrecisionChart ? 'Weekly' : 'Monthly'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showPrecisionChart ? (
                  <MonthlyPrecisionChart scheduleData={scheduleData} currentDate={currentDate} />
                ) : (
                  <HoursWorkedChart scheduleData={scheduleData} currentDate={currentDate} />
                )}
              </CardContent>
            </Card>

            {/* Urloard across */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Urloard across</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {urloardData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation to Detailed Dashboard */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  View detailed dashboard with performance metrics, tasks, and more.
                </p>
                <Button 
                  onClick={handleViewSchedule}
                  className="w-full flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Detailed Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Mobile Time Period Selector */}
            <div className="lg:hidden">
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-2">
                    {['Day', 'Week', 'Month', 'Year'].map((period) => (
                      <Button
                        key={period}
                        variant={period === 'Month' ? 'default' : 'outline'}
                        size="sm"
                        className={period === 'Month' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300'
                        }
                      >
                        {period}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default EmployeeDashboard;
