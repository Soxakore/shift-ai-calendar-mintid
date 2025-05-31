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
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">MinTid Manager Dashboard</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white text-xs">MANAGER</Badge>
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
            <span className="hidden sm:inline">Team </span>Settings
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* My Team Overview */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Users className="w-5 h-5" />
                My Kitchen Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Total Team Members</p>
                  <p className="text-2xl font-bold text-green-600">24</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Working Today</p>
                  <p className="text-2xl font-bold text-green-600">18</p>
                </div>
                <Button size="sm" className="w-full bg-green-500 hover:bg-green-600">
                  <Users className="w-4 h-4 mr-2" />
                  View Team Members
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Morning Shift</p>
                  <p className="text-gray-600">6 AM - 2 PM (8 workers)</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Afternoon Shift</p>
                  <p className="text-gray-600">2 PM - 10 PM (10 workers)</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">My Shift</p>
                  <p className="text-green-600">8 AM - 6 PM</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Orders Completed</p>
                  <p className="text-gray-600">847 today</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Average Prep Time</p>
                  <p className="text-gray-600">2.8 minutes</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Team Efficiency</p>
                  <p className="text-green-600">96.2%</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Team Member */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Kitchen Operations Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">Orders Prepared</p>
                <p className="text-2xl font-bold text-blue-600">847</p>
                <p className="text-blue-600">Target: 800</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium text-green-800">Food Safety Score</p>
                <p className="text-2xl font-bold text-green-600">98%</p>
                <p className="text-green-600">Excellent</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-yellow-800">Average Prep Time</p>
                <p className="text-2xl font-bold text-yellow-600">2.8min</p>
                <p className="text-yellow-600">Target: 3.0min</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-medium text-purple-800">Team Attendance</p>
                <p className="text-2xl font-bold text-purple-600">95%</p>
                <p className="text-purple-600">18/19 present</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Team Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Current Team Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Currently Working (6)
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Mary Cook - Grill Station</li>
                  <li>• John Smith - Fryer Station</li>
                  <li>• Sarah Wilson - Prep Station</li>
                  <li>• Mike Johnson - Assembly</li>
                  <li>• Lisa Brown - Quality Check</li>
                  <li>• David Lee - Dishwasher</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Coming Next Shift (4)
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tom Garcia - 2:00 PM</li>
                  <li>• Amy Davis - 2:00 PM</li>
                  <li>• Chris Martin - 2:30 PM</li>
                  <li>• Julia Adams - 3:00 PM</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  Off Today (14)
                </h4>
                <p className="text-sm text-gray-600">14 team members are scheduled off today</p>
                <Button variant="outline" size="sm" className="mt-2">
                  View Full Team List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Team Activities */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Kitchen Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Mike Johnson completed food safety training</p>
                  <p className="text-sm text-gray-600">Kitchen Staff - 30 minutes ago</p>
                </div>
                <Badge variant="outline">Training</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Sarah Wilson achieved prep time goal</p>
                  <p className="text-sm text-gray-600">Prep Station - 1 hour ago</p>
                </div>
                <Badge variant="outline">Achievement</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Next week schedule updated</p>
                  <p className="text-sm text-gray-600">Kitchen Department - 2 hours ago</p>
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
