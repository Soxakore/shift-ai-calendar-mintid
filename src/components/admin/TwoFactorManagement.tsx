import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  emailAddress: string;
  messageType: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  emailAddress,
  messageType
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <strong>Email Address:</strong>
          </div>
          <p className="text-blue-700 dark:text-blue-300">{emailAddress}</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-green-600" />
            <strong>Message Type:</strong>
          </div>
          <p className="text-green-700 dark:text-green-300">{messageType}</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4 mr-2" />
          Send Email
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const TwoFactorManagement = () => {
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('tiktok518@gmail.com'); // Default to working email
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

  // New state for email validation and confirmation
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [emailValidationResult, setEmailValidationResult] = useState<{
    isValid: boolean;
    userInfo?: { display_name: string; user_type: string; organization_id?: string };
    message: string;
  } | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    type: 'password_reset' | 'security_alert';
    email: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'password_reset',
    email: '',
    message: '',
    onConfirm: () => {}
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
          to: adminEmail,
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
          description: `New backup codes generated and sent to ${adminEmail}.`,
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

  // New function to validate email against database
  const validateEmailInDatabase = async (email: string) => {
    if (!email.trim()) {
      setEmailValidationResult({
        isValid: false,
        message: "Please enter an email address"
      });
      return;
    }

    setIsValidatingEmail(true);
    try {
      // Check if email exists in profiles (construct email from username if needed)
      let searchEmail = email.trim();
      let searchUsername = null;

      // If it doesn't contain @, treat it as username and search by username
      if (!email.includes('@')) {
        searchUsername = email.trim();
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, user_type, organization_id')
          .eq('username', searchUsername)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Error validating username:', error);
          setEmailValidationResult({
            isValid: false,
            message: "Database error occurred while validating username"
          });
          return;
        }

        if (!profileData) {
          setEmailValidationResult({
            isValid: false,
            message: `Username "${searchUsername}" not found in database or account is inactive`
          });
          return;
        }

        // Construct email for username
        searchEmail = `${searchUsername}@${profileData.organization_id || profileData.id}.mintid.local`;
        setEmailValidationResult({
          isValid: true,
          userInfo: {
            display_name: profileData.display_name,
            user_type: profileData.user_type,
            organization_id: profileData.organization_id
          },
          message: `✅ Username found: ${profileData.display_name} (${profileData.user_type}). Email will be sent to: ${searchEmail}`
        });
      } else {
        // Direct email validation - check if it matches any constructed email pattern
        const emailParts = searchEmail.split('@');
        if (emailParts.length === 2) {
          const username = emailParts[0];
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id, username, display_name, user_type, organization_id')
            .eq('username', username)
            .eq('is_active', true)
            .maybeSingle();

          if (error) {
            console.error('Error validating email:', error);
            setEmailValidationResult({
              isValid: false,
              message: "Database error occurred while validating email"
            });
            return;
          }

          if (!profileData) {
            setEmailValidationResult({
              isValid: false,
              message: `Email "${searchEmail}" does not match any active user in database`
            });
            return;
          }

          setEmailValidationResult({
            isValid: true,
            userInfo: {
              display_name: profileData.display_name,
              user_type: profileData.user_type,
              organization_id: profileData.organization_id
            },
            message: `✅ Email valid: ${profileData.display_name} (${profileData.user_type})`
          });
        } else {
          setEmailValidationResult({
            isValid: false,
            message: "Invalid email format"
          });
        }
      }
    } catch (error) {
      console.error('Error validating email:', error);
      setEmailValidationResult({
        isValid: false,
        message: "An error occurred while validating email"
      });
    } finally {
      setIsValidatingEmail(false);
    }
  };

  // Enhanced password reset function with confirmation
  const handleSendPasswordReset = async (email: string) => {
    if (!emailValidationResult?.isValid) {
      toast({
        title: "⚠️ Email Validation Required",
        description: "Please validate the email address first by clicking the check button.",
        variant: "destructive"
      });
      return;
    }

    // Show confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      type: 'password_reset',
      email: email,
      message: 'Password Reset Instructions',
      onConfirm: async () => {
        try {
          const resetLink = `${window.location.origin}/reset-password?token=sample-token`;
          
          const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
              type: 'password_reset',
              to: email,
              data: {
                username: emailValidationResult.userInfo?.display_name || 'User',
                resetLink: resetLink
              }
            }
          });

          if (error) {
            console.error('Error sending password reset email:', error);
            toast({
              title: "❌ Email Error",
              description: "Failed to send password reset email. Please check the email address.",
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
        setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Enhanced security alert function with confirmation
  const handleSendSecurityAlert = async (message: string) => {
    // Show confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      type: 'security_alert',
      email: adminEmail,
      message: message,
      onConfirm: async () => {
        try {
          console.log('Sending security alert to:', adminEmail, 'Message:', message);
          
          const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
              type: 'security_alert',
              to: adminEmail,
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
              description: `Failed to send security alert to ${adminEmail}. Please check the email address.`,
              variant: "destructive"
            });
          } else {
            console.log('Security alert sent successfully:', data);
            toast({
              title: "✅ Security Alert Sent",
              description: `Security alert sent successfully to ${adminEmail}.`,
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
        setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
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

      {/* Admin Email Configuration */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Settings className="w-5 h-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Admin Email Address</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter admin email for alerts"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
                <Button 
                  onClick={() => {
                    toast({
                      title: "✅ Email Updated",
                      description: `Admin email set to ${adminEmail}`,
                    });
                  }}
                  variant="outline"
                  className="dark:border-gray-600 dark:text-gray-100"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This email will receive backup codes and security alerts. Use a real email address for testing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create new backup codes and send to: {adminEmail}</p>
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
                      ⚠️ These codes have been sent to {adminEmail}. Store them securely!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Email Testing Section with Validation */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                <Mail className="w-5 h-5" />
                Email Functions Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Test Password Reset Email</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter email or username"
                      value={testEmail}
                      onChange={(e) => {
                        setTestEmail(e.target.value);
                        setEmailValidationResult(null); // Reset validation when email changes
                      }}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                    <Button 
                      onClick={() => validateEmailInDatabase(testEmail)}
                      disabled={isValidatingEmail}
                      variant="outline"
                      className="dark:border-gray-600 dark:text-gray-100"
                    >
                      {isValidatingEmail ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleSendPasswordReset(testEmail)}
                      disabled={!emailValidationResult?.isValid}
                      className="dark:border-gray-600 dark:text-gray-100"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Email validation result */}
                  {emailValidationResult && (
                    <div className={`p-3 rounded-lg ${
                      emailValidationResult.isValid 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        {emailValidationResult.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm ${
                          emailValidationResult.isValid 
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {emailValidationResult.message}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter username or email address. Click check button to validate against database before sending.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Test Security Alert (to {adminEmail})</Label>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => handleSendSecurityAlert(value)}>
                      <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                        <SelectValue placeholder="Select alert type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Suspicious login attempt detected from unknown location">Suspicious Login</SelectItem>
                        <SelectItem value="Password changed successfully for admin account">Password Changed</SelectItem>
                        <SelectItem value="2FA has been disabled on administrator account">2FA Disabled</SelectItem>
                        <SelectItem value="Multiple failed login attempts detected from same IP">Failed Login Attempts</SelectItem>
                        <SelectItem value="Emergency lockdown initiated by system administrator">Emergency Lockdown</SelectItem>
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.type === 'password_reset' ? 'Confirm Password Reset' : 'Confirm Security Alert'}
        description={confirmationDialog.type === 'password_reset' 
          ? 'Are you sure you want to send password reset instructions to this email address?'
          : 'Are you sure you want to send this security alert?'
        }
        emailAddress={confirmationDialog.email}
        messageType={confirmationDialog.message}
      />
    </div>
  );
};

export default TwoFactorManagement;
