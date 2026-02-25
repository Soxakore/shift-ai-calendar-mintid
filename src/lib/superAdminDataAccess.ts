// UUID validation utility
const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

// Safely convert value to UUID or null
const safeUUID = (value: unknown): string | null => {
  if (!value || value === '' || value === '0') return null;
  if (typeof value === 'string' && isValidUUID(value)) return value;
  if (typeof value === 'number') return null; // Never convert numbers to UUIDs
  return null;
};

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

interface RpcCreateUserResponse {
  success?: boolean;
  error?: string | null;
  data?: unknown;
  profile_id?: number;
  user_id?: string;
  username?: string;
  display_name?: string;
  user_type?: string;
  login_username?: string;
  auth_email?: string;
  message?: string;
}

const normalizeCreateUserRpcResult = (payload: unknown): RpcCreateUserResponse | null => {
  if (Array.isArray(payload)) {
    const [first] = payload;
    if (first && typeof first === 'object') {
      return first as RpcCreateUserResponse;
    }
    return null;
  }

  if (payload && typeof payload === 'object') {
    return payload as RpcCreateUserResponse;
  }

  return null;
};

const getRpcErrorMessage = (
  normalized: RpcCreateUserResponse | null,
  fallback: string
): string => {
  if (!normalized) return fallback;
  if (typeof normalized.error === 'string' && normalized.error.trim()) {
    return normalized.error;
  }
  return fallback;
};

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
        console.log('🔄 Organization creation failed due to RLS policy restrictions');
        console.error('❌ Cannot create organization - insufficient permissions:', error);
        return { data: null, error };
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
        console.log('🔄 Organization fetch failed due to RLS policy restrictions');
        console.error('❌ Cannot fetch organizations - insufficient permissions:', error);
        return [];
      }
      
      console.error('❌ Could not fetch organizations:', error);
      return [];
    }

    console.log('✅ Organizations fetched successfully:', data?.length || 0);
    console.log('🔍 Organization ID types debug:', data?.slice(0, 3).map(org => ({
      id: org.id,
      id_type: typeof org.id,
      id_length: org.id?.length,
      is_uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(org.id)),
      is_numeric: /^\d+$/.test(String(org.id)),
      name: org.name
    })));
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
        console.log('🔄 Profiles fetch failed due to RLS policy restrictions');
        console.error('❌ Cannot fetch profiles - insufficient permissions:', error);
        return [];
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
  
  // Validate and clean UUID fields before sending to edge function
  const safeOrgId = safeUUID(userData.organisation_id);
  const safeDeptId = safeUUID(userData.department_id);
  
  console.log('🔍 UUID validation:', {
    original_org: userData.organisation_id,
    safe_org: safeOrgId,
    original_dept: userData.department_id,
    safe_dept: safeDeptId
  });
  
  // FIXED: Don't convert invalid UUIDs to empty strings - use null instead
  const cleanUserData = {
    ...userData,
    organisation_id: safeOrgId,  // Let it be null if invalid UUID
    department_id: safeDeptId     // Let it be null if invalid UUID
  };
  
  try {
    // Use RPC fallback strategy:
    // prefer create_user_with_credentials (restored DB compatibility),
    // then fallback to create_user_with_username.
    console.log('🔄 Using RPC function for user creation (fallback strategy)');

    const rpcPayload = {
      p_username: userData.username,
      p_password: userData.password,
      p_display_name: userData.display_name,
      p_user_type: userData.user_type,
      p_organisation_id: safeOrgId,
      p_department_id: safeDeptId,
      p_phone_number: userData.phone_number || null,
      p_created_by: null // CreateUserData does not include actor id
    };

    let rpcName: 'create_user_with_credentials' | 'create_user_with_username' = 'create_user_with_credentials';
    let { data, error } = await supabase.rpc(rpcName, rpcPayload);

    if (error?.message?.includes('Could not find the function public.create_user_with_credentials')) {
      console.warn('⚠️ create_user_with_credentials not found, falling back to create_user_with_username');
      rpcName = 'create_user_with_username';
      ({ data, error } = await supabase.rpc(rpcName, rpcPayload));
    }

    if (error) {
      console.error(`❌ RPC ${rpcName} user creation failed:`, error);
      return { data: null, error };
    }

    const normalized = normalizeCreateUserRpcResult(data);
    if (!normalized?.success) {
      const errorMessage = getRpcErrorMessage(normalized, 'User creation failed');
      console.error(`❌ RPC ${rpcName} returned failure:`, errorMessage, normalized);
      return { data: null, error: { message: errorMessage } };
    }

    const normalizedData =
      normalized.data && typeof normalized.data === 'object'
        ? normalized.data
        : {
            profile_id: normalized.profile_id,
            user_id: normalized.user_id,
            username: normalized.login_username || normalized.username || userData.username,
            display_name: normalized.display_name || userData.display_name,
            user_type: normalized.user_type || userData.user_type,
            auth_email: normalized.auth_email,
            message: normalized.message
          };

    console.log(`✅ User created successfully via RPC (${rpcName}):`, normalizedData);
    return { data: normalizedData as Profile, error: null };
    
  } catch (exception) {
    console.error('💥 Exception during user creation:', exception);
    return { data: null, error: { message: exception.message } };
  }
};
