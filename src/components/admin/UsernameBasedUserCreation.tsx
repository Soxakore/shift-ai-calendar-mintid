import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

interface CreateUserFormData {
  username: string;
  password: string;
  display_name: string;
  user_type: 'org_admin' | 'manager' | 'employee';
  organisation_id: string;
  department_id?: string;
}

export default function UsernameBasedUserCreation() {
  const { profile, createUser } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CreateUserFormData>({
    username: '',
    password: '',
    display_name: '',
    user_type: 'employee',
    organisation_id: profile?.organisation_id || '',
    department_id: profile?.department_id || ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Role-based permissions
  const canCreateRole = (role: string): boolean => {
    if (!profile) return false;
    
    switch (profile.user_type) {
      case 'super_admin':
        return true; // Can create any role
      case 'org_admin':
        return ['manager', 'employee'].includes(role);
      case 'manager':
        return role === 'employee';
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.display_name) {
      toast({
        title: "❌ Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!canCreateRole(formData.user_type)) {
      toast({
        title: "❌ Permission Denied",
        description: `You don't have permission to create ${formData.user_type} accounts`,
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const result = await createUser(formData);
      
      if (result.success) {
        toast({
          title: "✅ User Created Successfully",
          description: `${formData.display_name} can now log in with username: ${formData.username}`,
        });
        
        // Reset form
        setFormData({
          username: '',
          password: '',
          display_name: '',
          user_type: 'employee',
          organisation_id: profile?.organisation_id || '',
          department_id: profile?.department_id || ''
        });
      } else {
        toast({
          title: "❌ Creation Failed",
          description: result.error || "Failed to create user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "An unexpected error occurred while creating the user",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const generateRandomPassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
    toast({
      title: "🔑 Password Generated",
      description: "A secure password has been generated",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Create New User (Username-Based)
        </CardTitle>
        <CardDescription>
          Create users with username and password authentication (no email required)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="john.doe"
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique username for login (no spaces or special characters)
              </p>
            </div>

            <div>
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="John Doe"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter secure password"
                required
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 h-6 w-6"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateRandomPassword}
                  className="p-1 h-6 text-xs"
                >
                  Gen
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="user_type">Role *</Label>
            <Select 
              value={formData.user_type} 
              onValueChange={(value: 'org_admin' | 'manager' | 'employee') => 
                setFormData(prev => ({ ...prev, user_type: value }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {profile?.user_type === 'super_admin' && (
                  <SelectItem value="org_admin">Organization Admin</SelectItem>
                )}
                {canCreateRole('manager') && (
                  <SelectItem value="manager">Manager</SelectItem>
                )}
                {canCreateRole('employee') && (
                  <SelectItem value="employee">Employee</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Username-Based Authentication
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• No email address required</li>
              <li>• Users log in with username and password</li>
              <li>• Role-based permissions automatically applied</li>
              <li>• Secure password hashing and storage</li>
              <li>• Failed login attempt protection</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? 'Creating User...' : 'Create User'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setFormData({
                username: '',
                password: '',
                display_name: '',
                user_type: 'employee',
                organisation_id: profile?.organisation_id || '',
                department_id: profile?.department_id || ''
              })}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
