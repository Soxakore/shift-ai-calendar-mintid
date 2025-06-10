import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: number; // Changed from string to number (bigint)
  user_id: string; // Added user_id field
  username: string;
  display_name: string;
  user_type: 'super_admin' | 'org_admin' | 'manager' | 'employee';
  organisation_id?: string;
  department_id?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tracking_id?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGitHub: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  createUser: (userData: {
    username: string;
    password: string;
    display_name: string;
    user_type: 'org_admin' | 'manager' | 'employee';
    organisation_id?: string;
    department_id?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper function for audit logging
  const logSessionEvent = async (
    userId: string,
    action: 'login' | 'logout' | 'session_refresh',
    sessionId?: string,
    success: boolean = true,
    failureReason?: string
  ) => {
    try {
      await supabase.rpc('log_session_event', {
        p_user_id: userId,
        p_session_id: sessionId,
        p_action: action,
        p_ip_address: null, // Client-side can't get real IP
        p_user_agent: navigator.userAgent,
        p_location_data: null,
        p_success: success,
        p_failure_reason: failureReason
      });
    } catch (error) {
      console.error('Failed to log session event:', error);
    }
  };

  // Helper function for audit logging
  const logAuditEvent = async (
    actionType: string,
    targetUserId?: string,
    targetOrganisationId?: string,
    metadata?: Record<string, string | number | boolean | null>
  ) => {
    try {
      if (!user) return;
      
      await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_action_type: actionType,
        p_target_user_id: targetUserId || null,
        p_target_organisation_id: targetOrganisationId || null,
        p_ip_address: null, // Client-side can't get real IP
        p_user_agent: navigator.userAgent,
        p_location_data: null,
        p_metadata: metadata ? JSON.stringify(metadata) : null
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 Setting up auth state listener...');
    
    let mounted = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Log session events
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            logSessionEvent(
              session.user.id,
              'login',
              session.access_token.slice(-16),
              true
            );
          }, 0);
        } else if (event === 'SIGNED_OUT' && user) {
          setTimeout(() => {
            logSessionEvent(
              user.id,
              'logout',
              session?.access_token?.slice(-16),
              true
            );
          }, 0);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setTimeout(() => {
            logSessionEvent(
              session.user.id,
              'session_refresh',
              session.access_token.slice(-16),
              true
            );
          }, 0);
        }
        
        if (session?.user) {
          // Use setTimeout to prevent auth deadlock
          setTimeout(() => {
            if (mounted) {
              fetchUserProfile(session.user.id);
            }
          }, 0);
        } else {
          setProfile(null);
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Then check for existing session with timeout
    const checkSession = async () => {
      try {
        console.log('🔍 Checking initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check error:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        console.log('✅ Initial session check:', session?.user?.email || 'No session');
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Unexpected error checking session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth initialization timeout, setting loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    checkSession();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching profile for user:', userId);
      
      // Set a safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Profile fetch timeout, setting loading to false');
        setLoading(false);
      }, 5000);
      
      // Get the current session to check user email and metadata
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || user?.email;
      const userMetadata = session?.user?.user_metadata || user?.user_metadata;
      
      // SUPER ADMIN BYPASS - Check for multiple super admin criteria
      const isSuperAdmin = userEmail === 'tiktok518@gmail.com' || 
                          userMetadata?.login === 'soxakore' ||
                          userMetadata?.user_name === 'soxakore' ||
                          userMetadata?.preferred_username === 'soxakore';
      
      if (isSuperAdmin) {
        console.log('🚀 SUPER ADMIN DETECTED - Bypassing profile requirements entirely');
        console.log('🔍 User metadata:', userMetadata);
        
        // Create a temporary super admin profile object without database dependency
        const superAdminProfile: Profile = {
          id: 0, // Temporary ID
          user_id: userId,
          username: userMetadata?.login || userMetadata?.user_name || userMetadata?.preferred_username || 'super-admin',
          display_name: userMetadata?.name || 'Super Admin',
          user_type: 'super_admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('✅ SUPER ADMIN profile set (bypassing database):', superAdminProfile);
        clearTimeout(timeoutId);
        setProfile(superAdminProfile);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId) // Changed from 'id' to 'user_id'
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        clearTimeout(timeoutId);
        setProfile(null);
        setLoading(false);
      } else if (data) {
        console.log('✅ Profile fetched successfully:', data);
        
        // Check if tracking_id is missing and generate one
        if (!data.tracking_id) {
          console.log('🔧 Profile missing tracking ID, generating one...');
          const newTrackingId = crypto.randomUUID();
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ tracking_id: newTrackingId })
            .eq('id', data.id);
          
          if (updateError) {
            console.error('❌ Error updating tracking ID:', updateError);
          } else {
            console.log('✅ Tracking ID updated successfully:', newTrackingId);
            data.tracking_id = newTrackingId;
          }
        }
        
        const profileData: Profile = {
          ...data,
          user_type: data.user_type as 'super_admin' | 'org_admin' | 'manager' | 'employee'
        };
        clearTimeout(timeoutId);
        setProfile(profileData);
        setLoading(false);
      } else {
        console.log('⚠️ No profile found for user:', userId);
        
        // Auto-create profile for tiktok518 super admin if missing
        if (user?.email === 'tiktok518@gmail.com') {
          console.log('🔧 Auto-creating missing profile for tiktok518...');
          console.log('🔧 Current user data:', { id: userId, email: user.email });
          try {
            // First, get the first available organisation or create without one
            console.log('🔍 Looking for available organisations...');
            const { data: orgs, error: orgError } = await supabase
              .from('organisations')
              .select('id, name')
              .limit(1);
            
            if (orgError) {
              console.error('❌ Error fetching organisations:', orgError);
            }
            
            const orgId = orgs && orgs.length > 0 ? orgs[0].id : null;
            console.log('🏢 Using organisation:', orgId ? `${orgs[0].name} (${orgId})` : 'None');
            
            // Generate tracking ID for the super admin user
            const trackingId = crypto.randomUUID();
            console.log('🔧 Generated tracking ID:', trackingId);
            
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                user_id: userId, // Changed from 'id' to 'user_id'
                username: 'tiktok518',
                display_name: 'TikTok518 Super Admin',
                user_type: 'super_admin',
                organisation_id: orgId,
                tracking_id: trackingId,
                is_active: true
              })
              .select()
              .single();

            if (createError) {
              console.error('❌ Error creating profile:', createError);
              console.error('❌ Error details:', JSON.stringify(createError, null, 2));
              clearTimeout(timeoutId);
              setProfile(null);
              setLoading(false);
            } else {
              console.log('✅ Profile created successfully:', newProfile);
              const profileData: Profile = {
                ...newProfile,
                user_type: newProfile.user_type as 'super_admin' | 'org_admin' | 'manager' | 'employee'
              };
              clearTimeout(timeoutId);
              setProfile(profileData);
              setLoading(false);
              
              // Show success toast
              toast({
                title: "✅ Profile Created",
                description: "Super admin profile has been automatically created",
              });
            }
          } catch (createException) {
            console.error('💥 Exception creating profile:', createException);
            clearTimeout(timeoutId);
            setProfile(null);
            setLoading(false);
          }
        } else {
          clearTimeout(timeoutId);
          setProfile(null);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('💥 Exception fetching profile:', error);
      clearTimeout(timeoutId);
      setProfile(null);
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    console.log('Sign in attempt for:', username);
    // Don't set loading here as auth state change will handle it
    
    try {
      // Special handling for super admin with multiple password attempts
      if (username === 'tiktok518') {
        console.log('Super admin login attempt');
        
        // List of possible passwords to try
        const possiblePasswords = [password, '123456', 'admin', 'password', 'dev'];
        
        for (const pwd of possiblePasswords) {
          console.log(`🔑 Trying password attempt for super admin...`);
          const { data, error } = await supabase.auth.signInWithPassword({
            email: 'tiktok518@gmail.com',
            password: pwd,
          });

          if (!error && data.user) {
            console.log('✅ Super admin login successful');
            await logSessionEvent(
              data.user.id,
              'login',
              data.session?.access_token?.slice(-16),
              true
            );
            return { success: true };
          }
        }
        
        // If all passwords failed
        console.error('❌ All super admin password attempts failed');
        await logSessionEvent(
          'unknown',
          'login',
          undefined,
          false,
          'Invalid super admin credentials'
        );
        return { success: false, error: 'Invalid super admin credentials. Please check password or reset via Supabase dashboard.' };
      }

      // Special handling for test manager
      if (username === 'manager.test') {
        console.log('Test manager login attempt');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'manager.test@gmail.com',
          password: password,
        });

        if (error) {
          console.error('Test manager login error:', error);
          return { success: false, error: 'Invalid manager credentials' };
        }

        console.log('Test manager login successful');
        return { success: true };
      }

      // Special handling for test employee
      if (username === 'employee.test') {
        console.log('Test employee login attempt');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'employee.test@gmail.com',
          password: password,
        });

        if (error) {
          console.error('Test employee login error:', error);
          return { success: false, error: 'Invalid employee credentials' };
        }

        console.log('Test employee login successful');
        return { success: true };
      }

      // Special handling for new employee created by manager
      if (username === 'newemployee') {
        console.log('New employee login attempt');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'newemployee@c0baf5e7-8c8c-4f2f-9c4d-1d5b2e8f3a7b.mintid.local',
          password: password,
        });

        if (error) {
          console.error('New employee login error:', error);
          setLoading(false);
          return { success: false, error: 'Invalid employee credentials' };
        }

        console.log('New employee login successful');
        return { success: true };
      }

      // Special handling for organization admin
      if (username === 'org.admin') {
        console.log('Organization admin login attempt');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'org.admin@gmail.com',
          password: password,
        });

        if (error) {
          console.error('Organization admin login error:', error);
          setLoading(false);
          return { success: false, error: 'Invalid organization admin credentials' };
        }

        console.log('Organization admin login successful');
        return { success: true };
      }

      // For regular users - construct email from username
      let email = username;
      if (!username.includes('@')) {
        // Look up the user profile to get their organisation
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, organisation_id')
          .eq('username', username)
          .eq('is_active', true)
          .maybeSingle();

        if (profileError) {
          console.error('Profile lookup error:', profileError);
          setLoading(false);
          return { success: false, error: 'Database error occurred' };
        }

        if (!profileData) {
          console.log('No active profile found for username:', username);
          setLoading(false);
          return { success: false, error: 'Invalid username or account is inactive' };
        }

        // Construct email
        email = `${username}@${profileData.organisation_id || profileData.id}.mintid.local`;
        console.log('Constructed email for login:', email);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        setLoading(false);
        return { success: false, error: 'Invalid credentials' };
      }

      console.log('Login successful');
      return { success: true };
    } catch (error) {
      console.error('Unexpected login error:', error);
      setLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signInWithGitHub = async () => {
    console.log('GitHub OAuth login attempt');
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user user:email'
        }
      });

      if (error) {
        console.error('GitHub OAuth error:', error);
        return { success: false, error: error.message || 'GitHub authentication failed' };
      }

      console.log('✅ GitHub OAuth initiated successfully');
      return { success: true };
    } catch (error) {
      console.error('Unexpected GitHub OAuth error:', error);
      return { success: false, error: 'An unexpected error occurred during GitHub authentication' };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('Signing out...');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    username: string;
    password: string;
    display_name: string;
    user_type: 'org_admin' | 'manager' | 'employee';
    organisation_id?: string;
    department_id?: string;
  }) => {
    try {
      console.log('Creating user:', { ...userData, password: '[HIDDEN]' });
      
      // Check if username already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', userData.username.trim())
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking username:', checkError);
        return { success: false, error: 'Error checking username availability' };
      }
      
      if (existingProfile) {
        return { success: false, error: 'Username already exists' };
      }

      // Generate email for the user
      const email = `${userData.username.trim()}@${userData.organisation_id || 'system'}.mintid.local`;
      
      console.log('Creating auth user with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: userData.password,
        options: {
          data: {
            username: userData.username.trim(),
            display_name: userData.display_name.trim(),
            user_type: userData.user_type,
            organisation_id: userData.organisation_id,
            department_id: userData.department_id,
            created_by: user?.id
          }
        }
      });

      if (error) {
        console.error('User creation error:', error);
        return { success: false, error: error.message };
      }

      console.log('User created successfully:', data.user?.id);
      
      // Log audit event for user creation
      if (data.user?.id) {
        setTimeout(() => {
          logAuditEvent(
            'user_created',
            data.user?.id,
            userData.organisation_id,
            {
              username: userData.username,
              display_name: userData.display_name,
              user_type: userData.user_type
            }
          );
        }, 0);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile, 
        session, 
        loading, 
        signIn,
        signInWithGitHub, 
        signOut, 
        createUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
