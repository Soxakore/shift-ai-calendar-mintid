
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck,
  Settings, 
  BarChart3,
  Plus,
  Calendar,
  Clock,
  Utensils,
  CheckCircle
} from 'lucide-react';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';

const ManagerDashboard = () => {
  const pageMetadata = getPageMetadata('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="dashboard"
      />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">MinTid Manager Dashboard</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white text-xs">MANAGER</Badge>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <Utensils className="w-4 h-4" />
                    Kitchen Department
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Settings className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Team </span>Settings
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* My Team Overview */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Users className="w-5 h-5" />
                My Kitchen Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Total Team Members</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">24</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Working Today</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">18</p>
                </div>
                <Button size="sm" className="w-full bg-green-500 hover:bg-green-600">
                  <Users className="w-4 h-4 mr-2" />
                  View Team Members
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Clock className="w-5 h-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Morning Shift</p>
                  <p className="text-gray-600 dark:text-gray-300">6 AM - 2 PM (8 workers)</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Afternoon Shift</p>
                  <p className="text-gray-600 dark:text-gray-300">2 PM - 10 PM (10 workers)</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">My Shift</p>
                  <p className="text-green-600 dark:text-green-400">8 AM - 6 PM</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Performance */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <BarChart3 className="w-5 h-5" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Orders Completed</p>
                  <p className="text-gray-600 dark:text-gray-300">847 today</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Average Prep Time</p>
                  <p className="text-gray-600 dark:text-gray-300">2.8 minutes</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Team Efficiency</p>
                  <p className="text-green-600 dark:text-green-400">96.2%</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Team Member */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Plus className="w-5 h-5" />
                Team Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Kitchen Staff
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Review Performance
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Update Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Kitchen Operations Dashboard */}
        <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Utensils className="w-5 h-5" />
              Kitchen Operations Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="font-medium text-blue-800 dark:text-blue-300">Orders Prepared</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">847</p>
                <p className="text-blue-600 dark:text-blue-400">Target: 800</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="font-medium text-green-800 dark:text-green-300">Food Safety Score</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">98%</p>
                <p className="text-green-600 dark:text-green-400">Excellent</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="font-medium text-yellow-800 dark:text-yellow-300">Average Prep Time</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">2.8min</p>
                <p className="text-yellow-600 dark:text-yellow-400">Target: 3.0min</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="font-medium text-purple-800 dark:text-purple-300">Team Attendance</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">95%</p>
                <p className="text-purple-600 dark:text-purple-400">18/19 present</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Team Status */}
        <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="w-5 h-5" />
              Current Team Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Currently Working (6)
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Mary Cook - Grill Station</li>
                  <li>• John Smith - Fryer Station</li>
                  <li>• Sarah Wilson - Prep Station</li>
                  <li>• Mike Johnson - Assembly</li>
                  <li>• Lisa Brown - Quality Check</li>
                  <li>• David Lee - Dishwasher</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Coming Next Shift (4)
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Tom Garcia - 2:00 PM</li>
                  <li>• Amy Davis - 2:00 PM</li>
                  <li>• Chris Martin - 2:30 PM</li>
                  <li>• Julia Adams - 3:00 PM</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  Off Today (14)
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">14 team members are scheduled off today</p>
                <Button variant="outline" size="sm" className="mt-2">
                  View Full Team List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Team Activities */}
        <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Recent Kitchen Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Mike Johnson completed food safety training</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Kitchen Staff - 30 minutes ago</p>
                </div>
                <Badge variant="outline">Training</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Sarah Wilson achieved prep time goal</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Prep Station - 1 hour ago</p>
                </div>
                <Badge variant="outline">Achievement</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Next week schedule updated</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Kitchen Department - 2 hours ago</p>
                </div>
                <Badge variant="outline">Schedule</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ManagerDashboard;
