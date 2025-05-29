import React, { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Building2, 
  UserCheck,
  User,
  ArrowRight,
  Info,
  Settings
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import SEOHead from '@/components/SEOHead';

// Use lazy loading for role-specific dashboards
import { 
  LazySuperAdminDashboard,
  LazyOrgAdminDashboard,
  LazyManagerDashboard,
  LazyEmployeeDashboard
} from '@/components/LazyComponents';

// SEO imports
import { createSoftwareSchema, createFAQSchema, getPageMetadata } from '@/lib/seo';

const RoleSelector = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: 'super_admin',
      name: 'Super Administrator',
      description: 'Full system access across all organizations',
      icon: Shield,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-700',
      credentials: { username: 'super.admin', password: 'admin123' },
      component: LazySuperAdminDashboard
    },
    {
      id: 'org_admin',
      name: 'Organization Admin',
      description: 'Manage entire McDonald\'s organization',
      icon: Building2,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      credentials: { username: 'mc.admin', password: 'mcadmin123' },
      component: LazyOrgAdminDashboard
    },
    {
      id: 'manager',
      name: 'Department Manager',
      description: 'Manage kitchen department and staff only',
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      credentials: { username: 'kitchen.manager', password: 'kitchen123' },
      component: LazyManagerDashboard
    },
    {
      id: 'employee',
      name: 'Employee',
      description: 'View personal schedule and basic information',
      icon: User,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50 border-gray-200',
      textColor: 'text-gray-700',
      credentials: { username: 'mary.cook', password: 'mary123' },
      component: LazyEmployeeDashboard
    }
  ];

  // If a role is selected, render its component
  if (selectedRole) {
    const role = roles.find(r => r.id === selectedRole);
    if (role) {
      const Component = role.component;
      return (
        <div>
          <div className="bg-white border-b p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedRole(null)}
                  size="sm"
                >
                  ← Back to Role Selector
                </Button>
                <Badge className={role.color + ' text-white'}>
                  Currently Viewing: {role.name}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Demo Mode: Authentication Disabled
              </div>
            </div>
          </div>
          <Suspense fallback={<LoadingSpinner text={`Loading ${role.name} Dashboard...`} />}>
            <Component />
          </Suspense>
        </div>
      );
    }
  }

  // Default role selector view
  const pageMetadata = getPageMetadata('roles');
  
  const faqData = [
    {
      question: "What are the different user roles in MinTid?",
      answer: "MinTid supports four main roles: Super Administrator (full system access), Organization Admin (single organization management), Manager (department-level access), and Employee (personal information access)."
    },
    {
      question: "How does role-based access control work?",
      answer: "Each role has specific permissions and sees customized dashboards. Higher-level roles can access more features and data, while maintaining security and privacy for lower-level users."
    },
    {
      question: "Can I switch between different role views?",
      answer: "Yes, in demo mode you can experience all role perspectives to understand how different users interact with the system."
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        canonicalUrl={pageMetadata.canonical}
        pageName="roles"
        structuredData={[
          createSoftwareSchema(),
          createFAQSchema(faqData)
        ]}
      />
      
      {/* Header */}
      <header className="bg-white border-b px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">Role-Based Access Control Demo</h1>
          <p className="text-gray-600 mb-4">
            Select a role to see how different users experience the system
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
            <div className="flex items-center gap-2 text-yellow-800">
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">Demo Mode: Authentication is temporarily disabled for easy testing</span>
            </div>
          </div>
        </div>
      </header>

      {/* Role Selection Cards */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card 
                key={role.id} 
                className={`${role.bgColor} hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader>
                  <CardTitle className={`flex items-center gap-3 ${role.textColor}`}>
                    <IconComponent className="w-8 h-8" />
                    <div>
                      <div className="text-xl">{role.name}</div>
                      <Badge className={`${role.color} text-white mt-1`}>
                        {role.id.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{role.description}</p>
                  
                  <div className="bg-white/50 p-3 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Demo Credentials:</p>
                    <p className="text-sm text-gray-600">
                      Username: <code className="bg-gray-200 px-1 rounded">{role.credentials.username}</code>
                    </p>
                    <p className="text-sm text-gray-600">
                      Password: <code className="bg-gray-200 px-1 rounded">{role.credentials.password}</code>
                    </p>
                  </div>

                  <Button className="w-full group">
                    View {role.name} Dashboard
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Information */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">System Features Demonstrated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Hierarchical Access Control</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Super Admin: All organizations and features</li>
                  <li>• Org Admin: Single organization management</li>
                  <li>• Manager: Department-level access only</li>
                  <li>• Employee: Personal information only</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Key Capabilities</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Role-based UI customization</li>
                  <li>• Scoped data access and management</li>
                  <li>• Account creation within permissions</li>
                  <li>• Department-specific dashboards</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation Links */}
        <Card className="mt-8 bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800">Additional Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                onClick={() => window.open('/admin', '_blank')}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin Panel (Account Creation)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('/login', '_blank')}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Login Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Refresh Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RoleSelector;
