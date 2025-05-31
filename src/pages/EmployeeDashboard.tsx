
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
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
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import EnhancedScheduleCalendar from '@/components/EnhancedScheduleCalendar';

const EmployeeDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [systemStatus, setSystemStatus] = useState('operational'); // operational, maintenance, emergency
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

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

  const handleViewDetailedSchedule = () => {
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
    
    // Previous data from current month
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Schedule Calendar - Now Main Feature */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Calendar className="w-5 h-5" />
                    My Schedule
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

                {/* Action Buttons */}
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleViewDetailedSchedule}
                    className="flex items-center gap-2 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Detailed Analytics
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            {/* Current Shift */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Clock className="w-5 h-5" />
                  Current Shift
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Today's Schedule</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">9 AM - 5 PM</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Station Assignment</p>
                    <p className="text-blue-600 dark:text-blue-400">Grill Station</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Time Remaining</p>
                    <p className="text-blue-600 dark:text-blue-400">3 hours 24 minutes</p>
                  </div>
                  <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700" onClick={handleClockOut}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Clock Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Performance Stats */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <TrendingUp className="w-5 h-5" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Hours Worked</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">36h</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Overtime</p>
                    <p className="text-orange-600 dark:text-orange-400">4h</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Attendance</p>
                    <p className="text-green-600 dark:text-green-400">100%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium text-blue-600 dark:text-blue-400">Schedule Update</p>
                    <p className="text-gray-600 dark:text-gray-400">Next week schedule available</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-green-600 dark:text-green-400">Achievement</p>
                    <p className="text-gray-600 dark:text-gray-400">Perfect attendance this month!</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleViewNotifications}>
                    <Bell className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Today's Tasks */}
        <Card className="mt-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <CheckCircle className="w-5 h-5" />
              Today's Tasks & Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-l-4 border-green-400">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <p className="font-medium text-green-800 dark:text-green-200">Completed</p>
                </div>
                <p className="text-green-700 dark:text-green-300">Food safety check</p>
                <p className="text-green-600 dark:text-green-400 text-xs">Completed at 9:15 AM</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="font-medium text-blue-800 dark:text-blue-200">In Progress</p>
                </div>
                <p className="text-blue-700 dark:text-blue-300">Grill station operations</p>
                <p className="text-blue-600 dark:text-blue-400 text-xs">Started at 11:00 AM</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border-l-4 border-yellow-400">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Upcoming</p>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300">Lunch rush prep</p>
                <p className="text-yellow-600 dark:text-yellow-400 text-xs">Starts at 2:00 PM</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border-l-4 border-purple-400">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <p className="font-medium text-purple-800 dark:text-purple-200">Goal</p>
                </div>
                <p className="text-purple-700 dark:text-purple-300">Complete 50 orders</p>
                <p className="text-purple-600 dark:text-purple-400 text-xs">Progress: 32/50</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleViewDetailedSchedule}>
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">Analytics</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleViewReports}>
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">My Reports</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleViewNotifications}>
                <Bell className="w-5 h-5" />
                <span className="text-sm">Notifications</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={handleUpdateProfile}>
                <Settings className="w-5 h-5" />
                <span className="text-sm">Profile Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default EmployeeDashboard;
