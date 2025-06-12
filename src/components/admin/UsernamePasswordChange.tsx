import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

export default function UsernamePasswordChange() {
  const { profile } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isChanging, setIsChanging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "❌ Missing Information",
        description: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "❌ Password Mismatch",
        description: "New password and confirmation don't match",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "❌ Password Too Short",
        description: "New password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.username) {
      toast({
        title: "❌ Error",
        description: "Username not found in profile",
        variant: "destructive"
      });
      return;
    }

    setIsChanging(true);
    
    try {
      // Call the username password change function
      const response = await supabase.rpc('change_user_password', {
        p_username: profile.username,
        p_current_password: formData.currentPassword,
        p_new_password: formData.newPassword
      } as unknown as Record<string, unknown>);

      if (response.error) {
        console.error('Password change RPC error:', response.error);
        toast({
          title: "❌ Service Error",
          description: "Password change service is unavailable",
          variant: "destructive"
        });
        return;
      }

      const result = response.data as unknown as { success: boolean; error?: string };
      if (!result?.success) {
        toast({
          title: "❌ Password Change Failed",
          description: result?.error || "Failed to change password",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "✅ Password Changed",
        description: "Your password has been updated successfully",
      });
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "An unexpected error occurred while changing password",
        variant: "destructive"
      });
    } finally {
      setIsChanging(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const generateSecurePassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ 
      ...prev, 
      newPassword: password, 
      confirmPassword: password 
    }));
    toast({
      title: "🔑 Secure Password Generated",
      description: "A strong password has been generated and filled in both fields",
    });
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    if (strength < 40) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength < 70) return { strength, label: 'Medium', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your username-based account password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password *</Label>
            <div className="relative mt-1">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="newPassword">New Password *</Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Password Strength: {passwordStrength.label}</span>
                  <span>{passwordStrength.strength}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
            )}
          </div>

          <Button 
            type="button" 
            variant="outline" 
            onClick={generateSecurePassword}
            className="w-full"
          >
            Generate Secure Password
          </Button>

          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Password Requirements:</h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include numbers and special characters</li>
              <li>• Avoid common words or personal information</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={isChanging || formData.newPassword !== formData.confirmPassword}
              className="flex-1"
            >
              {isChanging ? 'Changing Password...' : 'Change Password'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
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
