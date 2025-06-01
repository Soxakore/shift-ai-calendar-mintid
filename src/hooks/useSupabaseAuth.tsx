
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface SupabaseAuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔐 SupabaseAuthProvider rendering...');

  useEffect(() => {
    console.log('🔐 Setting up auth listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Fetching user profile...');
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('❌ Error fetching profile:', error);
              setProfile(null);
            } else {
              console.log('✅ Profile loaded:', profileData);
              setProfile(profileData);
            }
          } catch (error) {
            console.error('❌ Exception fetching profile:', error);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔐 Initial session check:', session?.user?.id, error);
      if (error) {
        console.error('❌ Error getting session:', error);
        setLoading(false);
      }
      // onAuthStateChange will handle the session update
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription...');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    console.log('🔐 Attempting to sign in with username:', username);
    try {
      // First, try to find the user by username to get their email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) {
        console.error('❌ Error finding user profile:', profileError);
        return { success: false, error: 'User not found' };
      }

      // Get the email from auth.users using the profile id
      const { data: { user: authUser }, error: userError } = await supabase.auth.admin.getUserById(profiles.id);
      
      if (userError || !authUser?.email) {
        console.error('❌ Error getting user email:', userError);
        return { success: false, error: 'Unable to retrieve user email' };
      }

      // Now sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authUser.email,
        password: password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Sign in successful:', data.user?.id);
      return { success: true };
    } catch (error) {
      console.error('❌ Sign in exception:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    console.log('🔐 Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
      } else {
        console.log('✅ Signed out successfully');
      }
    } catch (error) {
      console.error('❌ Exception during sign out:', error);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signOut,
    signIn,
  };

  console.log('🔐 Auth provider state:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    loading 
  });

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
