
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

interface LocationData {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

interface AuditEventParams {
  actionType: string;
  targetUserId?: string;
  targetOrganizationId?: string;
  metadata?: Record<string, any>;
}

interface SessionEventParams {
  action: 'login' | 'logout' | 'session_refresh';
  sessionId?: string;
  success?: boolean;
  failureReason?: string;
}

export const useAuditLogger = () => {
  const { user } = useSupabaseAuth();

  const getClientInfo = useCallback(() => {
    return {
      ipAddress: null, // Client-side can't get real IP, will be null
      userAgent: navigator.userAgent,
      locationData: null // Will be enhanced server-side if needed
    };
  }, []);

  const logAuditEvent = useCallback(async ({
    actionType,
    targetUserId,
    targetOrganizationId,
    metadata
  }: AuditEventParams) => {
    if (!user) return null;

    try {
      const clientInfo = getClientInfo();
      
      const { data, error } = await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_action_type: actionType,
        p_target_user_id: targetUserId || null,
        p_target_organization_id: targetOrganizationId || null,
        p_ip_address: clientInfo.ipAddress,
        p_user_agent: clientInfo.userAgent,
        p_location_data: clientInfo.locationData,
        p_metadata: metadata ? JSON.stringify(metadata) : null
      });

      if (error) {
        console.error('Failed to log audit event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception logging audit event:', error);
      return null;
    }
  }, [user, getClientInfo]);

  const logSessionEvent = useCallback(async ({
    action,
    sessionId,
    success = true,
    failureReason
  }: SessionEventParams) => {
    if (!user && action !== 'login') return null;

    try {
      const clientInfo = getClientInfo();
      
      const { data, error } = await supabase.rpc('log_session_event', {
        p_user_id: user?.id || null,
        p_session_id: sessionId || null,
        p_action: action,
        p_ip_address: clientInfo.ipAddress,
        p_user_agent: clientInfo.userAgent,
        p_location_data: clientInfo.locationData,
        p_success: success,
        p_failure_reason: failureReason || null
      });

      if (error) {
        console.error('Failed to log session event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception logging session event:', error);
      return null;
    }
  }, [user, getClientInfo]);

  return {
    logAuditEvent,
    logSessionEvent
  };
};
