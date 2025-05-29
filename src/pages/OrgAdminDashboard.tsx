import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  Settings, 
  BarChart3,
  Plus,
  UserCheck,
  Calendar,
  TrendingUp
} from 'lucide-react';

const OrgAdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold">McDonald's Organization Dashboard</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500 text-white">ORG ADMIN</Badge>
                  <span className="text-sm text-gray-600">McDonald's Corporation</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Organization Settings
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Organization Overview */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Building2 className="w-5 h-5" />
                Organization Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Total Employees</p>
                  <p className="text-2xl font-bold text-blue-600">156</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Active Today</p>
                  <p className="text-2xl font-bold text-blue-600">142</p>
                </div>
                <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600">
                  <Users className="w-4 h-4 mr-2" />
                  View All Employees
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Department Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Kitchen Department</p>
                  <p className="text-gray-600">24 employees, 3 managers</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Front Counter</p>
                  <p className="text-gray-600">18 employees, 2 managers</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Drive-Thru</p>
                  <p className="text-gray-600">16 employees, 2 managers</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage Departments
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manager Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Department Managers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">John - Kitchen Manager</p>
                  <p className="text-gray-600">Managing 24 employees</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Sarah - Counter Manager</p>
                  <p className="text-gray-600">Managing 18 employees</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <UserCheck className="w-4 h-4 mr-2" />
                  View All Managers
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Employee
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Promote to Manager
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Building2 className="w-4 h-4 mr-2" />
                  Create Department
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Performance Analytics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Organization Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium text-green-800">Revenue This Month</p>
                <p className="text-2xl font-bold text-green-600">$47K</p>
                <p className="text-green-600">+12% from last month</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-blue-600">94.2%</p>
                <p className="text-blue-600">Based on reviews</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-yellow-800">Average Order Time</p>
                <p className="text-2xl font-bold text-yellow-600">3.2min</p>
                <p className="text-yellow-600">Target: 3.5min</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-medium text-purple-800">Employee Attendance</p>
                <p className="text-2xl font-bold text-purple-600">96.8%</p>
                <p className="text-purple-600">This week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Schedule Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Morning Shift (6 AM - 2 PM)</h4>
                <p className="text-sm text-gray-600">Kitchen: 8 employees</p>
                <p className="text-sm text-gray-600">Counter: 6 employees</p>
                <p className="text-sm text-gray-600">Drive-Thru: 4 employees</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Afternoon Shift (2 PM - 10 PM)</h4>
                <p className="text-sm text-gray-600">Kitchen: 10 employees</p>
                <p className="text-sm text-gray-600">Counter: 8 employees</p>
                <p className="text-sm text-gray-600">Drive-Thru: 6 employees</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Night Shift (10 PM - 6 AM)</h4>
                <p className="text-sm text-gray-600">Kitchen: 4 employees</p>
                <p className="text-sm text-gray-600">Counter: 3 employees</p>
                <p className="text-sm text-gray-600">Drive-Thru: 3 employees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Organization Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">New employee onboarded</p>
                  <p className="text-sm text-gray-600">Mike Johnson - Kitchen Department - 15 minutes ago</p>
                </div>
                <Badge variant="outline">New Employee</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Schedule updated</p>
                  <p className="text-sm text-gray-600">Counter Department - Next week schedule - 1 hour ago</p>
                </div>
                <Badge variant="outline">Schedule</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Performance review completed</p>
                  <p className="text-sm text-gray-600">Kitchen team quarterly review - 2 hours ago</p>
                </div>
                <Badge variant="outline">Review</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrgAdminDashboard;
