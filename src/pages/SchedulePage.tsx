import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload,
  Calendar,
  ArrowLeft,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmployeeHeader from '@/components/EmployeeHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useToast } from '@/hooks/use-toast';
import WorkHoursStats from '@/components/WorkHoursStats';
import HoursWorkedChart from '@/components/HoursWorkedChart';
import MonthlyPrecisionChart from '@/components/MonthlyPrecisionChart';
import EnhancedScheduleCalendar from '@/components/EnhancedScheduleCalendar';

const SchedulePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pageMetadata = getPageMetadata('schedule');
  const [currentDate, setCurrentDate] = useState(new Date()); // Current month (December 2024)
  const [showPrecisionChart, setShowPrecisionChart] = useState(false);

  const handleUpdateProfile = () => {
    toast({
      title: "Profile Settings",
      description: "Opening profile settings...",
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
        pageName="schedule"
      />

      <EmployeeHeader onUpdateProfile={handleUpdateProfile} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/employee')}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

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

      <Footer />
    </div>
  );
};

export default SchedulePage;
