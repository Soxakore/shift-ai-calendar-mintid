import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UserPresence {
  user_id: string;
  username: string;
  display_name: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  current_activity?: 'working' | 'break' | 'meeting' | 'idle';
  location?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
}

export interface PresenceState {
  [key: string]: UserPresence[];
}

export const usePresence = (channelName: string, currentUser?: any) => {
  const [presenceState, setPresenceState] = useState<PresenceState>({});
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const updateOnlineUsers = useCallback((state: PresenceState) => {
    const users: UserPresence[] = [];
    Object.keys(state).forEach(key => {
      users.push(...state[key]);
    });
    setOnlineUsers(users);
  }, []);

  const startTracking = useCallback(async (userPresence: Partial<UserPresence>) => {
    if (!channel || !currentUser || isTracking) return;

    const presence: UserPresence = {
      user_id: currentUser.id,
      username: currentUser.username || currentUser.email,
      display_name: currentUser.display_name || currentUser.username,
      status: 'online',
      last_seen: new Date().toISOString(),
      device: getDeviceType(),
      ...userPresence
    };

    try {
      const status = await channel.track(presence);
      if (status === 'ok') {
        setIsTracking(true);
        console.log('Started tracking presence:', presence);
      }
    } catch (error) {
      console.error('Error starting presence tracking:', error);
    }
  }, [channel, currentUser, isTracking]);

  const stopTracking = useCallback(async () => {
    if (!channel || !isTracking) return;

    try {
      const status = await channel.untrack();
      if (status === 'ok') {
        setIsTracking(false);
        console.log('Stopped tracking presence');
      }
    } catch (error) {
      console.error('Error stopping presence tracking:', error);
    }
  }, [channel, isTracking]);

  const updateStatus = useCallback(async (updates: Partial<UserPresence>) => {
    if (!channel || !currentUser || !isTracking) return;

    const updatedPresence: UserPresence = {
      user_id: currentUser.id,
      username: currentUser.username || currentUser.email,
      display_name: currentUser.display_name || currentUser.username,
      status: 'online',
      last_seen: new Date().toISOString(),
      device: getDeviceType(),
      ...updates
    };

    try {
      await channel.track(updatedPresence);
      console.log('Updated presence:', updatedPresence);
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [channel, currentUser, isTracking]);

  useEffect(() => {
    if (!currentUser) return;

    const channelName_clean = channelName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const presenceChannel = supabase.channel(channelName_clean, {
      config: {
        presence: {
          key: currentUser.id
        }
      }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState() as PresenceState;
        setPresenceState(newState);
        updateOnlineUsers(newState);
        console.log('Presence sync:', newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to presence channel: ${channelName_clean}`);
          setChannel(presenceChannel);
        }
      });

    return () => {
      presenceChannel.unsubscribe();
      setChannel(null);
      setIsTracking(false);
    };
  }, [channelName, currentUser, updateOnlineUsers]);

  // Auto-track user activity
  useEffect(() => {
    if (!currentUser || !channel) return;

    const handleActivity = () => {
      updateStatus({ 
        status: 'online', 
        last_seen: new Date().toISOString() 
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateStatus({ status: 'away' });
      } else {
        updateStatus({ status: 'online' });
      }
    };

    const handleBeforeUnload = () => {
      stopTracking();
    };

    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [channel, currentUser, updateStatus, stopTracking]);

  return {
    presenceState,
    onlineUsers,
    isTracking,
    startTracking,
    stopTracking,
    updateStatus,
    totalOnlineUsers: onlineUsers.length
  };
};

// Utility function to detect device type
function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  
  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
}
