
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
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmployeeHeader from '@/components/EmployeeHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useToast } from '@/hooks/use-toast';

const SchedulePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pageMetadata = getPageMetadata('schedule');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4)); // May 2025

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
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Mock schedule data
  const scheduleData = [
    { day: 'Thu', date: 6, hours: '6 h', time: '20:50-03' },
    { day: 'Fri', date: 7, hours: '84 h', time: '20:50-fri' },
    { day: 'Mon', date: 10, hours: '6 h', time: '20:50-09' },
    { day: 'Tue', date: 11, hours: '16 h', time: '20:50-08' },
    { day: 'Thu', date: 13, hours: '30 h', time: '28:30-fri' },
    { day: 'Fri', date: 14, hours: '4', time: '' },
    { day: 'Thu', date: 20, hours: '26 h', time: '22:30-fri' },
    { day: 'Fri', date: 21, hours: '4', time: '' },
    { day: 'Sat', date: 22, hours: '4', time: '' },
    { day: 'Mon', date: 31, hours: '3', time: '' }
  ];

  const hoursWorkedData = [
    { period: 'Day', hours: '9 h' },
    { period: 'Week', hours: '37 h' },
    { period: 'Month', hours: '148 h' }
  ];

  const urloardData = [
    { label: 'Total', hours: '32 h' },
    { label: 'Horus', hours: '148 h' }
  ];

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
                {/* Week headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, index) => {
                    const dayNumber = index - 3; // Adjust for month start
                    const isValidDay = dayNumber > 0 && dayNumber <= 31;
                    const scheduleItem = scheduleData.find(item => item.date === dayNumber);
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[80px] p-2 border border-gray-200 dark:border-slate-600 rounded-lg ${
                          isValidDay ? 'bg-white dark:bg-slate-700' : 'bg-gray-50 dark:bg-slate-800'
                        }`}
                      >
                        {isValidDay && (
                          <>
                            <div className="text-sm text-gray-900 dark:text-gray-100">{dayNumber}</div>
                            {scheduleItem && (
                              <div className="mt-1">
                                <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-center">
                                  <div className="font-medium">{scheduleItem.hours}</div>
                                  {scheduleItem.time && (
                                    <div className="text-xs">{scheduleItem.time}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

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
            {/* Hours Worked */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Clock className="w-5 h-5" />
                  Hours Worked
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Chart placeholder */}
                <div className="h-32 bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-800 dark:to-blue-600 rounded-lg mb-4 flex items-end justify-center p-4">
                  <div className="flex items-end gap-1">
                    {[40, 30, 60, 50, 80, 90, 70].map((height, index) => (
                      <div
                        key={index}
                        className="bg-blue-500 dark:bg-blue-400 rounded-t"
                        style={{ width: '8px', height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {hoursWorkedData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.period}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.hours}</span>
                    </div>
                  ))}
                </div>
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
