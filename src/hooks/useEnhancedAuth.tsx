
import { useEffect, useCallback } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useAuditLogger } from './useAuditLogger';

export const useEnhancedAuth = () => {
  const { user, session, signIn, signOut, ...authProps } = useSupabaseAuth();
  const { logSessionEvent, logAuditEvent } = useAuditLogger();

  // Enhanced sign in with audit logging
  const enhancedSignIn = useCallback(async (username: string, password: string) => {
    const result = await signIn(username, password);
    
    if (result.success && session) {
      // Log successful login
      await logSessionEvent({
        action: 'login',
        sessionId: session.access_token.slice(-16),
        success: true
      });
      
      // Log audit event
      await logAuditEvent({
        actionType: 'login',
        metadata: { username }
      });
    } else if (!result.success) {
      // Log failed login attempt
      await logSessionEvent({
        action: 'login',
        success: false,
        failureReason: result.error || 'Login failed'
      });
    }
    
    return result;
  }, [signIn, session, logSessionEvent, logAuditEvent]);

  // Enhanced sign out with audit logging
  const enhancedSignOut = useCallback(async () => {
    if (user && session) {
      // Log logout before signing out
      await logSessionEvent({
        action: 'logout',
        sessionId: session.access_token.slice(-16),
        success: true
      });
      
      await logAuditEvent({
        actionType: 'logout'
      });
    }
    
    await signOut();
  }, [user, session, signOut, logSessionEvent, logAuditEvent]);

  // Listen for session changes and log them
  useEffect(() => {
    if (session && user) {
      // Log session refresh events periodically
      const interval = setInterval(async () => {
        await logSessionEvent({
          action: 'session_refresh',
          sessionId: session.access_token.slice(-16),
          success: true
        });
      }, 30 * 60 * 1000); // Every 30 minutes

      return () => clearInterval(interval);
    }
  }, [session, user, logSessionEvent]);

  return {
    ...authProps,
    user,
    session,
    signIn: enhancedSignIn,
    signOut: enhancedSignOut,
    logAuditEvent,
    logSessionEvent
  };
};
