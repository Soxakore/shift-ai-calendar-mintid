
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemStatus {
  isEmergencyMode: boolean;
  systemHealth: {
    database: 'online' | 'offline' | 'degraded';
    auth: 'online' | 'offline' | 'degraded';
    storage: 'online' | 'offline' | 'degraded';
    realtime: 'online' | 'offline' | 'degraded';
    api: 'online' | 'offline' | 'degraded';
  };
  activeUsers: number;
  totalOrganizations: number;
  securityScore: number;
  recentLogins: number;
  failedLogins: number;
}

interface SystemStatusContextType {
  systemStatus: SystemStatus;
  updateSystemStatus: (updates: Partial<SystemStatus>) => void;
  triggerEmergencyLockdown: () => void;
  initiateRecovery: () => void;
  refreshStats: () => void;
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined);

export const SystemStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isEmergencyMode: false,
    systemHealth: {
      database: 'online',
      auth: 'online',
      storage: 'online',
      realtime: 'online',
      api: 'online'
    },
    activeUsers: 0,
    totalOrganizations: 0,
    securityScore: 98,
    recentLogins: 0,
    failedLogins: 0
  });

  const refreshStats = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, is_active')
        .eq('is_active', true);

      const { data: organizations } = await supabase
        .from('organizations')
        .select('id');

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: recentSessions } = await supabase
        .from('session_logs')
        .select('action, success')
        .gte('created_at', yesterday.toISOString());

      const successfulLogins = recentSessions?.filter(log => 
        log.action === 'login' && log.success
      ).length || 0;
      
      const failedLogins = recentSessions?.filter(log => 
        log.action === 'login' && !log.success
      ).length || 0;

      let securityScore = 98;
      if (failedLogins > 10) securityScore -= 5;
      if (failedLogins > 20) securityScore -= 10;

      setSystemStatus(prev => ({
        ...prev,
        activeUsers: profiles?.length || 0,
        totalOrganizations: organizations?.length || 0,
        recentLogins: successfulLogins,
        failedLogins: failedLogins,
        securityScore: Math.max(securityScore, 60)
      }));
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const updateSystemStatus = (updates: Partial<SystemStatus>) => {
    setSystemStatus(prev => ({ ...prev, ...updates }));
  };

  const triggerEmergencyLockdown = () => {
    setSystemStatus(prev => ({ ...prev, isEmergencyMode: true }));
    toast({
      title: "🚨 Emergency Lockdown Activated",
      description: "System has been locked down for security",
      variant: "destructive"
    });
  };

  const initiateRecovery = () => {
    setSystemStatus(prev => ({
      ...prev,
      isEmergencyMode: false,
      systemHealth: {
        database: 'online',
        auth: 'online',
        storage: 'online',
        realtime: 'online',
        api: 'online'
      }
    }));
    toast({
      title: "✅ Emergency Recovery Complete",
      description: "All systems have been restored to normal operation",
    });
  };

  // Set up real-time updates
  useEffect(() => {
    refreshStats();

    const channel = supabase
      .channel('system-status-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, refreshStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, refreshStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_logs' }, refreshStats)
      .subscribe();

    const interval = setInterval(refreshStats, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return (
    <SystemStatusContext.Provider 
      value={{ 
        systemStatus, 
        updateSystemStatus, 
        triggerEmergencyLockdown, 
        initiateRecovery,
        refreshStats 
      }}
    >
      {children}
    </SystemStatusContext.Provider>
  );
};

export const useSystemStatus = (): SystemStatusContextType => {
  const context = useContext(SystemStatusContext);
  if (context === undefined) {
    throw new Error('useSystemStatus must be used within a SystemStatusProvider');
  }
  return context;
};
