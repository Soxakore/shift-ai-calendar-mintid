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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else if (data) {
        console.log('Profile fetched:', data);
        const profileData: Profile = {
          ...data,
          user_type: data.user_type as 'super_admin' | 'org_admin' | 'manager' | 'employee'
        };
        setProfile(profileData);
      } else {
        console.log('No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting sign in for username:', username);
      
      // Special case for super admin - direct email authentication
      if (username === 'tiktok') {
        console.log('Super admin login attempt with direct email');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'tiktok518@gmail.com',
          password: password,
        });

        if (error) {
          console.error('Super admin login failed:', error);
          return { success: false, error: error.message };
        }

        console.log('Super admin login successful');
        return { success: true };
      }

      // For regular users, find profile first, then get email from metadata
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle();

      if (profileError) {
        console.error('Profile lookup error:', profileError);
        return { success: false, error: 'Database error occurred' };
      }

      if (!profileData) {
        console.log('No profile found for username:', username);
        return { success: false, error: 'Invalid username or account is inactive' };
      }

      // Try to sign in with constructed email
      const email = `${username}@${profileData.id}.mintid.local`;
      console.log('Attempting login with constructed email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { success: false, error: 'Invalid credentials' };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
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

      // Generate a unique email for the user based on username and organization
      const email = `${userData.username.trim()}@${userData.organization_id || 'system'}.mintid.local`;
      
      console.log('Creating auth user with email:', email);
      
      // Use the public API to create user instead of admin API
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
