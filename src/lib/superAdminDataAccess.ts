// Special data access functions for super admin users
// This handles RLS policy restrictions by implementing fallback strategies

import { supabase } from '@/integrations/supabase/client';

interface Organization {
  id: string;
  name: string;
  settings_json?: Record<string, unknown>;
  tracking_id?: string;
  created_at: string;
}

interface Profile {
  id: number;
  username: string;
  display_name: string;
  user_type: string;
  organisation_id: string;
  department_id: string;
  is_active: boolean;
  tracking_id: string | null;
  phone_number: string | null;
  created_at: string;
}

interface CreateOrgData {
  name: string;
  alias?: string;
  description?: string;
}

interface CreateUserData {
  email: string;
  username: string;
  password: string;
  display_name: string;
  phone_number: string;
  user_type: string;
  organisation_id: string;
  department_id: string;
}

export interface SuperAdminDataAccess {
  fetchOrganizations: () => Promise<Organization[]>;
  fetchProfiles: () => Promise<Profile[]>;
  createOrganization: (orgData: CreateOrgData) => Promise<{ data: Organization | null; error: { message: string } | null }>;
  createUser: (userData: CreateUserData) => Promise<{ data: Profile | null; error: { message: string } | null }>;
}

// Create organization with super admin privileges
export const createOrganizationAsAdmin = async (orgData: CreateOrgData) => {
  console.log('🚀 Super admin creating organization:', orgData);
  
  try {
    // First, try the standard approach
    const insertData = {
      name: orgData.name.trim(),
      settings_json: {
        alias: orgData.alias?.trim() || null,
        description: orgData.description?.trim() || null
      }
    };

    console.log('📝 Attempting organization creation with data:', insertData);
    
    const { data, error } = await supabase
      .from('organisations')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Standard organization creation failed:', error);
      
      // If the standard approach fails due to RLS, try alternative approaches
      if (error.message?.includes('policy') || error.message?.includes('permission')) {
        console.log('🔄 Trying alternative approach for organization creation...');
        
        // Try using the edge function approach
        const functionResult = await supabase.functions.invoke('create-organization', {
          body: insertData
        });
        
        if (functionResult.error) {
          console.error('❌ Edge function organization creation also failed:', functionResult.error);
          return { data: null, error: functionResult.error };
        }
        
        console.log('✅ Organization created via edge function:', functionResult.data);
        return { data: functionResult.data, error: null };
      }
      
      return { data: null, error };
    }

    console.log('✅ Organization created successfully:', data);
    return { data, error: null };
    
  } catch (exception) {
    console.error('💥 Exception during organization creation:', exception);
    return { data: null, error: { message: exception.message } };
  }
};

// Fetch organizations with super admin privileges
export const fetchOrganizationsAsAdmin = async () => {
  console.log('🔍 Super admin fetching organizations...');
  
  try {
    // Try standard fetch first
    const { data, error } = await supabase
      .from('organisations')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Standard organization fetch failed:', error);
      
      if (error.message?.includes('policy') || error.message?.includes('permission')) {
        console.log('🔄 Trying alternative approach for organization fetch...');
        
        // Try using edge function for data access
        const functionResult = await supabase.functions.invoke('get-organizations');
        
        if (functionResult.error) {
          console.error('❌ Edge function organization fetch also failed:', functionResult.error);
          return [];
        }
        
        console.log('✅ Organizations fetched via edge function:', functionResult.data?.length || 0);
        return functionResult.data || [];
      }
      
      console.error('❌ Could not fetch organizations:', error);
      return [];
    }

    console.log('✅ Organizations fetched successfully:', data?.length || 0);
    return data || [];
    
  } catch (exception) {
    console.error('💥 Exception during organization fetch:', exception);
    return [];
  }
};

// Fetch profiles with super admin privileges
export const fetchProfilesAsAdmin = async () => {
  console.log('🔍 Super admin fetching profiles...');
  
  try {
    // Try standard fetch first
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Standard profiles fetch failed:', error);
      
      if (error.message?.includes('policy') || error.message?.includes('permission')) {
        console.log('🔄 Trying alternative approach for profiles fetch...');
        
        // Try using edge function for data access
        const functionResult = await supabase.functions.invoke('get-profiles');
        
        if (functionResult.error) {
          console.error('❌ Edge function profiles fetch also failed:', functionResult.error);
          return [];
        }
        
        console.log('✅ Profiles fetched via edge function:', functionResult.data?.length || 0);
        return functionResult.data || [];
      }
      
      console.error('❌ Could not fetch profiles:', error);
      return [];
    }

    console.log('✅ Profiles fetched successfully:', data?.length || 0);
    return data || [];
    
  } catch (exception) {
    console.error('💥 Exception during profiles fetch:', exception);
    return [];
  }
};

// Create user with super admin privileges
export const createUserAsAdmin = async (userData: CreateUserData) => {
  console.log('🚀 Super admin creating user:', userData);
  
  try {
    // Use the existing edge function for user creation
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: userData
    });

    if (error) {
      console.error('❌ User creation failed:', error);
      return { data: null, error };
    }

    console.log('✅ User created successfully:', data);
    return { data, error: null };
    
  } catch (exception) {
    console.error('💥 Exception during user creation:', exception);
    return { data: null, error: { message: exception.message } };
  }
};
