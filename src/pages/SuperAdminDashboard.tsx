import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  Settings, 
  Shield, 
  BarChart3,
  Plus,
  Database,
  Globe
} from 'lucide-react';

const SuperAdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold">Super Administrator Dashboard</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white">SUPER ADMIN</Badge>
                  <span className="text-sm text-gray-600">System-wide Access</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* System Overview */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Globe className="w-5 h-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Total Organizations</p>
                  <p className="text-2xl font-bold text-red-600">12</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-red-600">1,247</p>
                </div>
                <Button size="sm" className="w-full bg-red-500 hover:bg-red-600">
                  <Database className="w-4 h-4 mr-2" />
                  Manage System
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Organizations Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">McDonald's Corp</p>
                  <p className="text-gray-600">156 users, 8 departments</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Burger King</p>
                  <p className="text-gray-600">89 users, 5 departments</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage All Organizations
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Global User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Organization Admins</p>
                  <p className="text-gray-600">12 active</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Department Managers</p>
                  <p className="text-gray-600">67 active</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  View All Users
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Create New Organization */}
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
                  Create Organization
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Create Admin Account
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* System Analytics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              System Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">$127K</p>
                <p className="text-blue-600">This month</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium text-green-800">Active Sessions</p>
                <p className="text-2xl font-bold text-green-600">847</p>
                <p className="text-green-600">Right now</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-yellow-800">System Health</p>
                <p className="text-2xl font-bold text-yellow-600">99.8%</p>
                <p className="text-yellow-600">Uptime</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-medium text-purple-800">Data Usage</p>
                <p className="text-2xl font-bold text-purple-600">2.4TB</p>
                <p className="text-purple-600">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent System Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">New organization registered</p>
                  <p className="text-sm text-gray-600">Subway Inc. - 5 minutes ago</p>
                </div>
                <Badge variant="outline">New</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">User account created</p>
                  <p className="text-sm text-gray-600">Admin for Pizza Hut - 12 minutes ago</p>
                </div>
                <Badge variant="outline">User</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">System backup completed</p>
                  <p className="text-sm text-gray-600">Daily backup - 1 hour ago</p>
                </div>
                <Badge variant="outline">System</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
