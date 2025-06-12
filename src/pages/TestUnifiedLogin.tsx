import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Shield, Users, Building2 } from 'lucide-react';

const TestUnifiedLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const testUsers = [
    { username: 'admin', role: 'Super Admin', icon: Shield, color: 'text-red-500', redirectTo: '/super-admin' },
    { username: 'org.admin.test', role: 'Organization Admin', icon: Building2, color: 'text-blue-500', redirectTo: '/org-admin' },
    { username: 'manager.test', role: 'Manager', icon: Users, color: 'text-green-500', redirectTo: '/manager' },
    { username: 'employee', role: 'Employee', icon: Users, color: 'text-gray-500', redirectTo: '/employee' },
  ];

  const handleTestLogin = (user: typeof testUsers[0]) => {
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      console.log(`🎯 Test login: ${user.username} → ${user.redirectTo}`);
      navigate(user.redirectTo);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MinaTid</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Test Mode - Unified Login</p>
        </div>

        {/* Test Login Card */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-center dark:text-white">
              🧪 Test Role-Based Redirection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testUsers.map((user) => {
                const IconComponent = user.icon;
                return (
                  <Button
                    key={user.username}
                    onClick={() => handleTestLogin(user)}
                    disabled={isLoading}
                    className="w-full justify-start p-4 h-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <IconComponent className={`w-5 h-5 ${user.color}`} />
                      <div className="text-left">
                        <div className="font-medium">{user.role}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.username} → {user.redirectTo}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                <strong>Test Mode:</strong> Click any role to test automatic redirection<br />
                No authentication required - testing UI flow only
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <Button
                onClick={() => navigate('/login')}
                variant="link"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Back to Real Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestUnifiedLogin;
