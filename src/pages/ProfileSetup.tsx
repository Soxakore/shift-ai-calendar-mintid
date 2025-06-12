import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Users, Building2, Loader2 } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

const ProfileSetup = () => {
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'org_admin' | 'manager' | 'employee'>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, createUser } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Extract username from GitHub user data
      const username = user?.user_metadata?.login || 
                      user?.user_metadata?.user_name || 
                      user?.user_metadata?.preferred_username || 
                      user?.email?.split('@')[0] || 
                      'github-user';

      const result = await createUser({
        username: username,
        password: 'github-oauth', // Not used for OAuth users
        display_name: displayName.trim(),
        user_type: userType,
        organisation_id: undefined, // Will be assigned later
        department_id: undefined, // Will be assigned later
      });

      if (result.success) {
        toast({
          title: "✅ Profile Created",
          description: "Your profile has been set up successfully!",
        });

        // Redirect based on user type
        switch (userType) {
          case 'org_admin':
            navigate('/org-admin');
            break;
          case 'manager':
            navigate('/manager');
            break;
          case 'employee':
            navigate('/employee');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(result.error || 'Failed to create profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MinaTid</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Complete your profile setup</p>
        </div>

        {/* GitHub User Info */}
        <Card className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 dark:text-green-200 text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Welcome, {user.user_metadata?.name || user.email}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Signed in with GitHub: @{user.user_metadata?.login || user.user_metadata?.user_name}
            </p>
          </CardContent>
        </Card>

        {/* Profile Setup Form */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">Set Up Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="displayName" className="text-gray-700 dark:text-gray-300">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading}
                  className="mt-1"
                  placeholder="How should we display your name?"
                  defaultValue={user.user_metadata?.name || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="userType" className="text-gray-700 dark:text-gray-300">Role</Label>
                <Select value={userType} onValueChange={(value: 'org_admin' | 'manager' | 'employee') => setUserType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Employee
                      </div>
                    </SelectItem>
                    <SelectItem value="manager">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Manager
                      </div>
                    </SelectItem>
                    <SelectItem value="org_admin">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Organization Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up profile...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Your administrator will assign you to an organization and department.
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
