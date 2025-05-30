
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  user_type: 'super_admin' | 'org_admin' | 'manager' | 'employee';
  organization_id?: string;
  department_id?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  createUser: (userData: {
    username: string;
    password: string;
    display_name: string;
    user_type: 'org_admin' | 'manager' | 'employee';
    organization_id?: string;
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
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        setProfile(null);
      } else if (data) {
        console.log('✅ Profile fetched successfully:', data);
        const profileData: Profile = {
          ...data,
          user_type: data.user_type as 'super_admin' | 'org_admin' | 'manager' | 'employee'
        };
        setProfile(profileData);
      } else {
        console.log('⚠️ No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('💥 Exception fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    console.log('Sign in attempt for:', username);
    setLoading(true);
    
    try {
      // Special handling for super admin
      if (username === 'tiktok') {
        console.log('Super admin login attempt');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'tiktok518@gmail.com',
          password: password,
        });

        if (error) {
          console.error('Super admin login error:', error);
          setLoading(false);
          return { success: false, error: 'Invalid super admin credentials' };
        }

        console.log('Super admin login successful');
        return { success: true };
      }

      // For regular users - construct email from username
      let email = username;
      if (!username.includes('@')) {
        // Look up the user profile to get their organization
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, organization_id')
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
        email = `${username}@${profileData.organization_id || profileData.id}.mintid.local`;
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
    organization_id?: string;
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
      const email = `${userData.username.trim()}@${userData.organization_id || 'system'}.mintid.local`;
      
      console.log('Creating auth user with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: userData.password,
        options: {
          data: {
            username: userData.username.trim(),
            display_name: userData.display_name.trim(),
            user_type: userData.user_type,
            organization_id: userData.organization_id,
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
