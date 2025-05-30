import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Users, 
  Key, 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  UserCheck, 
  Lock,
  AlertCircle,
  Mail,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorManagementProps {
  // Define any props here
}

const TwoFactorManagement = () => {
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const { toast } = useToast();

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
    }
    return codes;
  };

  const handleGenerateBackupCodes = async () => {
    setIsGeneratingCodes(true);
    try {
      const newCodes = generateBackupCodes();
      setBackupCodes(newCodes);
      
      // Send backup codes via email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'backup_codes',
          to: 'admin@example.com', // In real app, get from current user
          data: {
            username: 'Admin',
            backupCodes: newCodes
          }
        }
      });

      if (error) {
        console.error('Error sending backup codes email:', error);
        toast({
          title: "⚠️ Backup Codes Generated",
          description: "Backup codes generated but email sending failed. Please copy them manually.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Backup Codes Generated",
          description: "New backup codes generated and sent to your email.",
        });
      }
    } catch (error) {
      console.error('Error generating backup codes:', error);
      toast({
        title: "❌ Error",
        description: "Failed to generate backup codes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCodes(false);
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    try {
      const resetLink = `${window.location.origin}/reset-password?token=sample-token`;
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'password_reset',
          to: email,
          data: {
            username: 'User',
            resetLink: resetLink
          }
        }
      });

      if (error) {
        console.error('Error sending password reset email:', error);
        toast({
          title: "❌ Email Error",
          description: "Failed to send password reset email.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Password Reset Sent",
          description: `Password reset instructions sent to ${email}.`,
        });
      }
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: "❌ Error",
        description: "Failed to send password reset email.",
        variant: "destructive"
      });
    }
  };

  const handleSendSecurityAlert = async (message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'security_alert',
          to: 'admin@example.com',
          data: {
            username: 'Admin',
            alertMessage: message
          }
        }
      });

      if (error) {
        console.error('Error sending security alert:', error);
        toast({
          title: "❌ Alert Error",
          description: "Failed to send security alert email.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Security Alert Sent",
          description: "Security alert email sent successfully.",
        });
      }
    } catch (error) {
      console.error('Error sending security alert:', error);
      toast({
        title: "❌ Error",
        description: "Failed to send security alert.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced header section */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-red-900 dark:text-red-100">Two-Factor Authentication Management</h1>
            <p className="text-red-700 dark:text-red-300 mt-1">Secure access control and authentication settings</p>
          </div>
        </div>
      </div>

      {/* System Status and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 2FA Status Overview */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Users className="w-5 h-5" />
                2FA Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">156</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Enabled</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">23</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">12</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Disabled</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">8</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Locked</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup Codes Management */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                <Key className="w-5 h-5" />
                Backup Codes Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Generate New Backup Codes</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create new backup codes and send via email</p>
                  </div>
                  <Button 
                    onClick={handleGenerateBackupCodes}
                    disabled={isGeneratingCodes}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {isGeneratingCodes ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate Codes
                      </>
                    )}
                  </Button>
                </div>
                
                {backupCodes.length > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Generated Backup Codes:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="font-mono text-sm bg-white dark:bg-gray-900 p-2 rounded border text-gray-900 dark:text-gray-100">
                          {code}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      ⚠️ These codes have been sent to your email. Store them securely!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Email Testing Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                <Mail className="w-5 h-5" />
                Email Functions Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Test Password Reset Email</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter email address"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                    <Button 
                      onClick={() => handleSendPasswordReset(testEmail)}
                      variant="outline"
                      className="dark:border-gray-600 dark:text-gray-100"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Test Security Alert</Label>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => handleSendSecurityAlert(value)}>
                      <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                        <SelectValue placeholder="Select alert type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Suspicious login attempt detected">Suspicious Login</SelectItem>
                        <SelectItem value="Password changed successfully">Password Changed</SelectItem>
                        <SelectItem value="2FA disabled on your account">2FA Disabled</SelectItem>
                        <SelectItem value="Multiple failed login attempts">Failed Login Attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
              <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                <UserCheck className="w-4 h-4 mr-2" />
                Force 2FA Reset
              </Button>
              <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Bulk Enable 2FA
              </Button>
              <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Security Audit
              </Button>
              <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                <Lock className="w-4 h-4 mr-2" />
                Emergency Lockdown
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <AlertCircle className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Email Service: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">2FA Service: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Backup System: Maintenance</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorManagement;
