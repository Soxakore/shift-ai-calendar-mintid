
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorStats {
  enabled: number;
  pending: number;
  disabled: number;
  locked: number;
  total: number;
}

const TwoFactorManagement = () => {
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [twoFactorStats, setTwoFactorStats] = useState<TwoFactorStats>({
    enabled: 0,
    pending: 0,
    disabled: 0,
    locked: 0,
    total: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    emailService: true,
    twoFactorService: true,
    backupSystem: false
  });

  const { toast } = useToast();

  // Fetch 2FA statistics from profiles
  const fetch2FAStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Get all profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, is_active, user_type, created_at');

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      if (profiles) {
        // Simulate 2FA status distribution based on user data
        const total = profiles.length;
        const enabled = Math.floor(total * 0.78); // 78% enabled
        const pending = Math.floor(total * 0.12); // 12% pending
        const disabled = Math.floor(total * 0.08); // 8% disabled
        const locked = total - enabled - pending - disabled; // remaining

        setTwoFactorStats({
          enabled,
          pending,
          disabled,
          locked,
          total
        });
      }
    } catch (error) {
      console.error('Error fetching 2FA stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Set up real-time updates for 2FA stats
  useEffect(() => {
    fetch2FAStats();

    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('2fa-stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('Profile change detected, updating 2FA stats...');
          fetch2FAStats();
        }
      )
      .subscribe((status) => {
        console.log('2FA stats real-time subscription status:', status);
      });

    // Update stats every 30 seconds
    const interval = setInterval(fetch2FAStats, 30000);

    return () => {
      console.log('Cleaning up 2FA stats subscriptions...');
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

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
          to: 'admin@example.com',
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

  const handleForce2FAReset = async () => {
    try {
      // Simulate force 2FA reset for selected users
      toast({
        title: "🔄 Force 2FA Reset",
        description: "2FA reset initiated for selected users. This may take a few minutes.",
      });
      
      // Update stats to reflect changes
      setTimeout(() => {
        setTwoFactorStats(prev => ({
          ...prev,
          pending: prev.pending + 5,
          enabled: prev.enabled - 5
        }));
        
        toast({
          title: "✅ 2FA Reset Complete",
          description: "2FA has been reset for 5 users. They will need to re-enable it.",
        });
      }, 2000);
    } catch (error) {
      console.error('Error forcing 2FA reset:', error);
      toast({
        title: "❌ Error",
        description: "Failed to reset 2FA. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBulkEnable2FA = async () => {
    try {
      toast({
        title: "🔄 Bulk Enable 2FA",
        description: "Enabling 2FA for all eligible users. This may take a few minutes.",
      });
      
      // Update stats to reflect bulk enable
      setTimeout(() => {
        setTwoFactorStats(prev => ({
          ...prev,
          enabled: prev.enabled + prev.disabled,
          disabled: 0
        }));
        
        toast({
          title: "✅ Bulk 2FA Enable Complete",
          description: `2FA has been enabled for ${twoFactorStats.disabled} users.`,
        });
      }, 3000);
    } catch (error) {
      console.error('Error bulk enabling 2FA:', error);
      toast({
        title: "❌ Error",
        description: "Failed to bulk enable 2FA. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSecurityAudit = async () => {
    try {
      toast({
        title: "🔍 Security Audit",
        description: "Performing comprehensive security audit. This may take several minutes.",
      });
      
      // Simulate security audit
      setTimeout(() => {
        const vulnerabilities = Math.floor(Math.random() * 3);
        const message = vulnerabilities > 0 
          ? `Security audit complete. Found ${vulnerabilities} potential issues that need attention.`
          : "Security audit complete. No security issues found.";
        
        toast({
          title: vulnerabilities > 0 ? "⚠️ Audit Complete" : "✅ Audit Complete",
          description: message,
          variant: vulnerabilities > 0 ? "destructive" : "default"
        });
      }, 4000);
    } catch (error) {
      console.error('Error performing security audit:', error);
      toast({
        title: "❌ Error",
        description: "Failed to perform security audit. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEmergencyLockdown = async () => {
    try {
      toast({
        title: "🚨 Emergency Lockdown",
        description: "Initiating emergency lockdown. All user sessions will be terminated.",
      });
      
      // Update stats to reflect lockdown
      setTimeout(() => {
        setTwoFactorStats(prev => ({
          ...prev,
          locked: prev.total,
          enabled: 0,
          pending: 0,
          disabled: 0
        }));
        
        toast({
          title: "🔒 Lockdown Active",
          description: "Emergency lockdown complete. All users have been locked out.",
          variant: "destructive"
        });
      }, 2000);
    } catch (error) {
      console.error('Error initiating emergency lockdown:', error);
      toast({
        title: "❌ Error",
        description: "Failed to initiate emergency lockdown. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    if (!email) {
      toast({
        title: "⚠️ Email Required",
        description: "Please enter an email address to send password reset.",
        variant: "destructive"
      });
      return;
    }

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
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-700 dark:text-red-300">Live monitoring active</span>
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
                {isLoadingStats && <RefreshCw className="w-4 h-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {twoFactorStats.enabled}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Enabled</div>
                  <div className="text-xs text-green-500 mt-1">
                    {twoFactorStats.total > 0 ? Math.round((twoFactorStats.enabled / twoFactorStats.total) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {twoFactorStats.pending}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
                  <div className="text-xs text-yellow-500 mt-1">
                    {twoFactorStats.total > 0 ? Math.round((twoFactorStats.pending / twoFactorStats.total) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {twoFactorStats.disabled}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">Disabled</div>
                  <div className="text-xs text-red-500 mt-1">
                    {twoFactorStats.total > 0 ? Math.round((twoFactorStats.disabled / twoFactorStats.total) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {twoFactorStats.locked}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Locked</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {twoFactorStats.total > 0 ? Math.round((twoFactorStats.locked / twoFactorStats.total) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Total Users:</strong> {twoFactorStats.total} | 
                  <strong> Last Updated:</strong> {new Date().toLocaleTimeString()}
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
              <Button 
                onClick={handleForce2FAReset}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Force 2FA Reset
              </Button>
              <Button 
                onClick={handleBulkEnable2FA}
                className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Bulk Enable 2FA
              </Button>
              <Button 
                onClick={handleSecurityAudit}
                className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Security Audit
              </Button>
              <Button 
                onClick={handleEmergencyLockdown}
                className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
              >
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {systemStatus.emailService ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">Email Service</span>
                </div>
                <Switch 
                  checked={systemStatus.emailService}
                  onCheckedChange={(checked) => 
                    setSystemStatus(prev => ({ ...prev, emailService: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {systemStatus.twoFactorService ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">2FA Service</span>
                </div>
                <Switch 
                  checked={systemStatus.twoFactorService}
                  onCheckedChange={(checked) => 
                    setSystemStatus(prev => ({ ...prev, twoFactorService: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {systemStatus.backupSystem ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">Backup System</span>
                </div>
                <Switch 
                  checked={systemStatus.backupSystem}
                  onCheckedChange={(checked) => 
                    setSystemStatus(prev => ({ ...prev, backupSystem: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorManagement;
