import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading';
import { Users, Calendar, BarChart3, Settings, Brain, Database, ArrowLeft, Building2, Shield, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';
import { useAuth } from '@/hooks/useAuth';
import {
  LazyAISettings,
  LazyOrganisationManagement,
  LazySystemSettings,
  LazyUsersManagement,
  LazyAdminReportsManagement
} from '@/components/LazyComponents';

export default function Admin() {
  const { user, logout } = useAuth();
  const pageMetadata = getPageMetadata('admin');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be logged in to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead {...pageMetadata} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user.username}</span>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-4">
          <Tabs defaultValue="organisations" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="organisations" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organisations
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Settings
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="organisations">
              <Suspense fallback={<LoadingSpinner text="Loading Organisation Management..." />}>
                <LazyOrganisationManagement />
              </Suspense>
            </TabsContent>

            <TabsContent value="users">
              <Suspense fallback={<LoadingSpinner text="Loading Users Management..." />}>
                <LazyUsersManagement />
              </Suspense>
            </TabsContent>

            <TabsContent value="reports">
              <Suspense fallback={<LoadingSpinner text="Loading Reports Management..." />}>
                <LazyAdminReportsManagement />
              </Suspense>
            </TabsContent>

            <TabsContent value="ai">
              <Suspense fallback={<LoadingSpinner text="Loading AI Settings..." />}>
                <LazyAISettings />
              </Suspense>
            </TabsContent>

            <TabsContent value="system">
              <Suspense fallback={<LoadingSpinner text="Loading System Settings..." />}>
                <LazySystemSettings />
              </Suspense>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
