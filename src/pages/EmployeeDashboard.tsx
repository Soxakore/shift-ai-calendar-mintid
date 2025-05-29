import React from 'react';
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
  Bell
} from 'lucide-react';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';

const EmployeeDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">Welcome to MinTid, Mary</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-500 text-white text-xs">EMPLOYEE</Badge>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                    <Utensils className="w-4 h-4" />
                    Kitchen Department
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Settings className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">My </span>Profile
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Current Shift */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Clock className="w-5 h-5" />
                Current Shift
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Today's Schedule</p>
                  <p className="text-2xl font-bold text-blue-600">9 AM - 5 PM</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Station Assignment</p>
                  <p className="text-blue-600">Grill Station</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Time Remaining</p>
                  <p className="text-blue-600">3 hours 24 minutes</p>
                </div>
                <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                My Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Tomorrow</p>
                  <p className="text-gray-600">10 AM - 6 PM (Prep Station)</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Friday</p>
                  <p className="text-gray-600">9 AM - 5 PM (Grill Station)</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Weekend</p>
                  <p className="text-gray-600">Off - Enjoy!</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Full Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                My Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">This Week</p>
                  <p className="text-gray-600">36 hours worked</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Attendance Rate</p>
                  <p className="text-green-600">100%</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Performance Score</p>
                  <p className="text-green-600">95/100</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-blue-600">Schedule Update</p>
                  <p className="text-gray-600">Next week schedule available</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-600">Achievement</p>
                  <p className="text-gray-600">Perfect attendance this month!</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Bell className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Today's Tasks */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Today's Tasks & Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="font-medium text-green-800">Completed</p>
                </div>
                <p className="text-green-700">Food safety check</p>
                <p className="text-green-600 text-xs">Completed at 9:15 AM</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <p className="font-medium text-blue-800">In Progress</p>
                </div>
                <p className="text-blue-700">Grill station operations</p>
                <p className="text-blue-600 text-xs">Started at 11:00 AM</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <p className="font-medium text-yellow-800">Upcoming</p>
                </div>
                <p className="text-yellow-700">Lunch rush prep</p>
                <p className="text-yellow-600 text-xs">Starts at 2:00 PM</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <p className="font-medium text-purple-800">Goal</p>
                </div>
                <p className="text-purple-700">Complete 50 orders</p>
                <p className="text-purple-600 text-xs">Progress: 32/50</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Location Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Work Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">McDonald's - Downtown Branch</p>
                  <p className="text-sm text-gray-600">123 Main Street, Downtown</p>
                  <p className="text-sm text-gray-600">Store Manager: Jennifer Smith</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">Department: Kitchen</p>
                  <p className="text-sm text-gray-600">Department Manager: John Kitchen</p>
                  <p className="text-sm text-gray-600">Team Size: 24 employees</p>
                </div>
                <Button variant="outline" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  View Store Directory
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                My Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">Employee ID: #MC-K-001</p>
                  <p className="text-sm text-gray-600">Hire Date: January 15, 2024</p>
                  <p className="text-sm text-gray-600">Position: Kitchen Staff</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">Contact Information</p>
                  <p className="text-sm text-gray-600">Email: mary.cook@mcdonalds.com</p>
                  <p className="text-sm text-gray-600">Phone: (555) 123-4567</p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex flex-col gap-1">
                <Clock className="w-5 h-5" />
                <span className="text-sm">View Schedule</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">My Reports</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1">
                <Bell className="w-5 h-5" />
                <span className="text-sm">Notifications</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1">
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
