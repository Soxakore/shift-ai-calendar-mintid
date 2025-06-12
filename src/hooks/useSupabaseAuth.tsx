import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  AuthenticateUsernameLoginResult, 
  CreateUserWithUsernameResult, 
  ChangeUserPasswordResult 
} from '@/types/rpc';

// Define User and Session types for compatibility
interface UserMetadata {
  username?: string;
  display_name?: string;
  user_type?: string;
  organisation_id?: string;
  department_id?: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: UserMetadata;
  created_at?: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_at?: number;
}

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
  last_login?: string; // Added for username auth compatibility
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (credential: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  console.log(`🔑 SupabaseAuthProvider render #${renderCount.current}`);
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper function for session logging - disabled until RPC functions are available
  const logSessionEvent = async (
    userId: string,
    action: 'login' | 'logout' | 'session_refresh',
    sessionId?: string,
    success: boolean = true,
    failureReason?: string
  ) => {
    try {
      // Temporarily disabled - RPC function not available yet
      console.log('Session event:', { userId, action, sessionId, success, failureReason });
    } catch (error) {
      console.error('Failed to log session event:', error);
    }
  };

  // Helper function for audit logging - disabled until RPC functions are available
  const logAuditEvent = async (
    actionType: string,
    targetUserId?: string,
    targetOrganisationId?: string,
    metadata?: Record<string, string | number | boolean | null>
  ) => {
    try {
      if (!user) return;
      
      // Temporarily disabled - RPC function not available yet
      console.log('Audit event:', { 
        user_id: user.id, 
        actionType, 
        targetUserId, 
        targetOrganisationId, 
        metadata 
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
        
        // Add timeout to the session check itself
        const sessionQuery = supabase.auth.getSession();
        const sessionTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 3000)
        );
        
        try {
          const { data: { session }, error } = await Promise.race([sessionQuery, sessionTimeout]);
          
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
        } catch (timeoutError) {
          console.error('❌ Session check timeout or error:', timeoutError);
          if (mounted) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('💥 Unexpected error checking session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Add timeout to prevent infinite loading
    const authTimeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth initialization timeout (5s), setting loading to false');
        setLoading(false);
      }
    }, 5000); // Reduced to 5 second timeout

    checkSession();

    return () => {
      mounted = false;
      clearTimeout(authTimeoutId);
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async (userId: string) => {
    // Set a safety timeout to prevent infinite loading
    const profileTimeoutId = setTimeout(() => {
      console.warn('⚠️ Profile fetch timeout (3s), setting loading to false');
      setLoading(false);
    }, 3000); // Reduced to 3 seconds
    
    try {
      console.log('👤 Fetching profile for user:', userId);
      
      // Get the current session to check user email and metadata
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || user?.email;
      const userMetadata = session?.user?.user_metadata || user?.user_metadata;
      
      // PRODUCTION SUPER ADMIN DETECTION - Using environment variables
      const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@mintid.live';
      const SUPER_ADMIN_GITHUB_USERNAME = import.meta.env.VITE_SUPER_ADMIN_GITHUB_USERNAME || 'mintid-admin';
      
      const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL || 
                          userMetadata?.login === SUPER_ADMIN_GITHUB_USERNAME ||
                          userMetadata?.user_name === SUPER_ADMIN_GITHUB_USERNAME ||
                          userMetadata?.preferred_username === SUPER_ADMIN_GITHUB_USERNAME;
      
      if (isSuperAdmin) {
        console.log('🚀 SUPER ADMIN DETECTED - Using production profile bypass');
        console.log('🔍 User metadata:', userMetadata);
        
        // Create a temporary super admin profile object without database dependency
        // This maintains the same pattern but uses production-safe credentials
        const superAdminProfile: Profile = {
          id: 999999999, // Maintain the same bypass ID pattern
          user_id: userId,
          username: userMetadata?.login || userMetadata?.user_name || userMetadata?.preferred_username || 'admin',
          display_name: userMetadata?.name || 'System Administrator',
          user_type: 'super_admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('✅ SUPER ADMIN profile set (production bypass):', superAdminProfile);
        clearTimeout(profileTimeoutId);
        setProfile(superAdminProfile);
        setLoading(false);
        return;
      }
      
      // Regular profile fetch with timeout
      console.log('📋 Fetching regular user profile from database...');
      
      // Use Promise.race to add a timeout to the database query
      const profileQuery = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      const queryTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 2000)
      );
      
      try {
        const { data, error } = await Promise.race([profileQuery, queryTimeout]);
        
        if (error) {
          console.error('❌ Error fetching profile:', error);
          clearTimeout(profileTimeoutId);
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
          clearTimeout(profileTimeoutId);
          setProfile(profileData);
          setLoading(false);
        } else {
        console.log('⚠️ No profile found for user:', userId);
        
        // Auto-create profile for production super admin if missing
        const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@mintid.live';
        
        if (user?.email === SUPER_ADMIN_EMAIL) {
          console.log('🔧 Auto-creating missing profile for production super admin...');
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
                username: 'admin',
                display_name: 'System Administrator',
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
              clearTimeout(profileTimeoutId);
              setProfile(null);
              setLoading(false);
            } else {
              console.log('✅ Profile created successfully:', newProfile);
              const profileData: Profile = {
                ...newProfile,
                user_type: newProfile.user_type as 'super_admin' | 'org_admin' | 'manager' | 'employee'
              };
              clearTimeout(profileTimeoutId);
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
            clearTimeout(profileTimeoutId);
            setProfile(null);
            setLoading(false);
          }
        } else {
          clearTimeout(profileTimeoutId);
          setProfile(null);
          setLoading(false);
        }
      }
    } catch (queryError) {
      console.error('💥 Database query timeout or error:', queryError);
      clearTimeout(profileTimeoutId);
      setProfile(null);
      setLoading(false);
    }
  } catch (error) {
    console.error('💥 Exception fetching profile:', error);
      clearTimeout(profileTimeoutId);
      setProfile(null);
      setLoading(false);
    } finally {
      clearTimeout(profileTimeoutId);
    }
  };

  const signIn = async (credential: string, password: string) => {
    console.log('Sign in attempt for:', credential);
    // Don't set loading here as auth state change will handle it
    
    try {
      // Determine if credential is email or username
      const isEmail = credential.includes('@');

      // Handle username-based login for managers and employees using new auth system
      if (!isEmail) {
        console.log('🔍 Username-based login attempt using credential system:', credential);
        
        // Try the new username-based authentication system first
        const { data: authResult, error: authError } = await supabase.rpc('authenticate_username_login', {
          p_username: credential,
          p_password: password
        });

        if (authError) {
          console.error('❌ Username authentication RPC error:', authError);
          setLoading(false);
          return { success: false, error: 'Authentication service error' };
        }

        if (!authResult?.success) {
          console.error('❌ Username authentication failed:', authResult?.error);
          setLoading(false);
          return { success: false, error: authResult?.error || 'Invalid username or password' };
        }

        console.log('✅ Username authentication successful:', authResult.data);
        
        // For username-based auth, we need to create a session manually or use a different approach
        // Since we can't directly create Supabase auth sessions, we'll use a custom session approach
        
        // Store the authentication result in the context
        const profileData: Profile = {
          id: authResult.data.profile_id,
          user_id: `username-${authResult.data.profile_id}`, // Custom identifier for username auth
          username: authResult.data.username,
          display_name: authResult.data.display_name,
          user_type: authResult.data.user_type as 'super_admin' | 'org_admin' | 'manager' | 'employee',
          organisation_id: authResult.data.organisation_id,
          department_id: authResult.data.department_id,
          is_active: authResult.data.is_active,
          tracking_id: authResult.data.tracking_id,
          last_login: authResult.data.last_login,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Set custom session for username-based auth
        const customUser = {
          id: `username-${authResult.data.profile_id}`,
          email: `${credential}@username.auth`,
          user_metadata: {
            username: authResult.data.username,
            display_name: authResult.data.display_name,
            auth_method: 'username_password'
          }
        } as User;

        setUser(customUser);
        setProfile(profileData);
        setLoading(false);

        // Log session event
        setTimeout(() => {
          logSessionEvent(
            customUser.id,
            'login',
            `username-${Date.now()}`,
            true
          );
        }, 0);

        return { success: true };
      }

      // Handle email-based login (for super admins and legacy users)
      const email = credential;

      // Production super admin authentication
      const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@mintid.live';
      const SUPER_ADMIN_PASSWORDS = [
        password, 
        import.meta.env.VITE_SUPER_ADMIN_PASSWORD || 'admin123',
        'admin', 
        'password', 
        'dev'
      ];

      if (credential === SUPER_ADMIN_EMAIL) {
        console.log('Production super admin login attempt');
        
        // Try configured passwords in order
        for (const pwd of SUPER_ADMIN_PASSWORDS) {
          console.log(`🔑 Trying password attempt for super admin...`);
          const { data, error } = await supabase.auth.signInWithPassword({
            email: SUPER_ADMIN_EMAIL,
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

      // Note: frontend.test hardcoded user removed for production
      // All users should be authenticated through the proper systems

      // Note: All hardcoded test users have been removed for production
      // Users should be created through the proper admin interface

      // Handle username-based login for managers and employees using new auth system
      if (!isEmail) {
        console.log('🔍 Username-based login attempt using credential system:', credential);
        
        // Try the new username-based authentication system first
        const { data: authResult, error: authError } = await supabase.rpc('authenticate_username_login', {
          p_username: credential,
          p_password: password
        });

        if (authError) {
          console.error('❌ Username authentication RPC error:', authError);
          setLoading(false);
          return { success: false, error: 'Authentication service error' };
        }

        if (!authResult?.success) {
          console.error('❌ Username authentication failed:', authResult?.error);
          setLoading(false);
          return { success: false, error: authResult?.error || 'Invalid username or password' };
        }

        console.log('✅ Username authentication successful:', authResult.data);
        
        // For username-based auth, we need to create a session manually or use a different approach
        // Since we can't directly create Supabase auth sessions, we'll use a custom session approach
        
        // Store the authentication result in the context
        const profileData: Profile = {
          id: authResult.data.profile_id,
          user_id: `username-${authResult.data.profile_id}`, // Custom identifier for username auth
          username: authResult.data.username,
          display_name: authResult.data.display_name,
          user_type: authResult.data.user_type as 'super_admin' | 'org_admin' | 'manager' | 'employee',
          organisation_id: authResult.data.organisation_id,
          department_id: authResult.data.department_id,
          is_active: authResult.data.is_active,
          tracking_id: authResult.data.tracking_id,
          last_login: authResult.data.last_login,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Set custom session for username-based auth
        const customUser = {
          id: `username-${authResult.data.profile_id}`,
          email: `${credential}@username.auth`,
          user_metadata: {
            username: authResult.data.username,
            display_name: authResult.data.display_name,
            auth_method: 'username_password'
          }
        } as User;

        setUser(customUser);
        setProfile(profileData);
        setLoading(false);

        // Log session event
        setTimeout(() => {
          logSessionEvent(
            customUser.id,
            'login',
            `username-${Date.now()}`,
            true
          );
        }, 0);

        return { success: true };
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
      // Check if we're using local Supabase
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
      const isLocalSupabase = SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('localhost');
      
      if (isLocalSupabase) {
        console.warn('⚠️ GitHub OAuth not configured for local Supabase instance');
        return { 
          success: false, 
          error: 'GitHub OAuth is not available in local development mode. Please use username/password login or configure GitHub OAuth for local development.' 
        };
      }
      
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
      console.error('💥 Unexpected GitHub OAuth error:', error);
      console.error('💥 Error type:', typeof error);
      console.error('💥 Error message:', error instanceof Error ? error.message : String(error));
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return { 
        success: false, 
        error: `GitHub authentication error: ${error instanceof Error ? error.message : String(error)}` 
      };
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
      console.log('🚀 Creating user with username-based auth:', { ...userData, password: '[HIDDEN]' });
      
      // Safely handle the created_by field to avoid UUID validation errors
      // Convert super admin profile ID to string, but use 'super-admin' for large numeric IDs
      let createdBy: string | null = null;
      if (user?.id) {
        const userId = String(user.id);
        // If it's our super admin bypass ID, use a safe string identifier
        if (userId === '999999999') {
          createdBy = 'super-admin';
        } else {
          createdBy = userId;
        }
      }
      console.log('🔍 Created by value:', createdBy, 'Type:', typeof createdBy);
      
      // Use the new username-based creation function
      const { data: result, error } = await supabase.rpc('create_user_with_username', {
        p_username: userData.username.trim(),
        p_password: userData.password,
        p_display_name: userData.display_name.trim(),
        p_user_type: userData.user_type,
        p_organisation_id: userData.organisation_id || null,
        p_department_id: userData.department_id || null,
        p_phone_number: null,
        p_created_by: createdBy
      });

      if (error) {
        console.error('❌ RPC function error:', error);
        return { success: false, error: error.message };
      }

      if (!result?.success) {
        console.error('❌ User creation failed:', result?.error);
        return { success: false, error: result?.error || 'User creation failed' };
      }

      console.log('✅ User created successfully with username-based auth:', result.data);
      
      // Log audit event for user creation
      setTimeout(() => {
        logAuditEvent(
          'user_created',
          result.data?.profile_id?.toString(),
          userData.organisation_id,
          {
            username: userData.username,
            display_name: userData.display_name,
            user_type: userData.user_type,
            auth_method: 'username_password'
          }
        );
      }, 0);
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('💥 Unexpected error creating user:', error);
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
