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
  id: number | string;
  user_id?: string;
  username: string;
  display_name: string;
  email?: string;
  user_type: string;
  organisation_id?: string;
  department_id?: string;
  is_active: boolean;
  tracking_id: string | null;
  phone_number: string | null;
  created_at: string;
}

interface ScopedUserDirectoryRow {
  id: number | null;
  user_id: string | null;
  username: string | null;
  display_name: string | null;
  email: string | null;
  user_type: string | null;
  organisation_id: string | null;
  department_id: string | null;
  is_active: boolean | null;
  tracking_id: string | null;
  phone_number: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CreateOrgData {
  name: string;
  alias?: string;
  description?: string;
}

interface CreateDepartmentData {
  name: string;
  organisation_id: string;
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

interface SecureRpcResponse<T = unknown> {
  success?: boolean;
  error?: string | null;
  data?: T;
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

const normalizeSecureRpcResult = <T = unknown>(payload: unknown): SecureRpcResponse<T> | null => {
  if (!payload || typeof payload !== 'object') return null;
  return payload as SecureRpcResponse<T>;
};

const resolveActorId = async (providedActorId?: string | null) => {
  if (providedActorId) return providedActorId;
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
};

export interface SuperAdminDataAccess {
  fetchOrganizations: () => Promise<Organization[]>;
  fetchProfiles: () => Promise<Profile[]>;
  createOrganization: (orgData: CreateOrgData) => Promise<{ data: Organization | null; error: { message: string } | null }>;
  createUser: (userData: CreateUserData) => Promise<{ data: Profile | null; error: { message: string } | null }>;
}

// Create organization with super admin privileges
export const createOrganizationAsAdmin = async (orgData: CreateOrgData, actorId?: string | null) => {
  console.log('🚀 Super admin creating organization:', orgData);
  
  try {
    const resolvedActorId = await resolveActorId(actorId);
    const securePayload = {
      p_name: orgData.name.trim(),
      p_alias: orgData.alias?.trim() || null,
      p_description: orgData.description?.trim() || null,
      p_created_by: resolvedActorId
    };

    let { data: secureResult, error: secureError } = await supabase.rpc('create_organisation_secure', securePayload);

    if (!secureError) {
      const normalized = normalizeSecureRpcResult<Organization>(secureResult);
      if (normalized?.success && normalized.data) {
        console.log('✅ Organization created via secure RPC:', normalized.data);
        return { data: normalized.data, error: null };
      }

      const message = normalized?.error || 'Secure organization creation failed';
      console.error('❌ Secure RPC returned failure:', message, secureResult);
      return { data: null, error: { message } };
    }

    if (!secureError.message?.includes('Could not find the function public.create_organisation_secure')) {
      console.error('❌ Secure organization RPC failed:', secureError);
      return { data: null, error: secureError };
    }

    console.warn('⚠️ create_organisation_secure not found, falling back to direct insert');

    // Fallback for environments where secure RPC is not deployed yet.
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

export const createDepartmentAsAdmin = async (
  deptData: CreateDepartmentData,
  actorId?: string | null
) => {
  console.log('🚀 Admin creating department:', deptData);

  try {
    const resolvedActorId = await resolveActorId(actorId);
    const securePayload = {
      p_name: deptData.name.trim(),
      p_organisation_id: deptData.organisation_id,
      p_description: deptData.description?.trim() || null,
      p_created_by: resolvedActorId
    };

    const { data: secureResult, error: secureError } = await supabase.rpc('create_department_secure', securePayload);

    if (!secureError) {
      const normalized = normalizeSecureRpcResult(secureResult);
      if (normalized?.success && normalized.data) {
        console.log('✅ Department created via secure RPC:', normalized.data);
        return { data: normalized.data as { id: string; name: string; organisation_id: string }, error: null };
      }

      const message = normalized?.error || 'Secure department creation failed';
      console.error('❌ Secure department RPC returned failure:', message, secureResult);
      return { data: null, error: { message } };
    }

    if (!secureError.message?.includes('Could not find the function public.create_department_secure')) {
      console.error('❌ Secure department RPC failed:', secureError);
      return { data: null, error: secureError };
    }

    console.warn('⚠️ create_department_secure not found, falling back to direct insert');

    const { data, error } = await supabase
      .from('departments')
      .insert([{
        name: deptData.name.trim(),
        description: deptData.description?.trim() || null,
        organisation_id: deptData.organisation_id
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Fallback department creation failed:', error);
      return { data: null, error };
    }

    console.log('✅ Department created via fallback insert:', data);
    return { data, error: null };
  } catch (exception) {
    console.error('💥 Exception during department creation:', exception);
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
    const { data: scopedData, error: scopedError } = await supabase.rpc('get_scoped_user_directory');

    if (!scopedError) {
      const normalized = ((scopedData as ScopedUserDirectoryRow[] | null) || []).map((row, index) => {
        const userId = row.user_id || `missing-user-${index}`;
        const fallbackUsername = row.email ? row.email.split('@')[0] : `user_${String(userId).slice(0, 8)}`;
        const username = row.username || fallbackUsername || 'user';
        const displayName = row.display_name || username || 'User';

        return {
          id: row.id ?? `auth:${userId}`,
          user_id: row.user_id || undefined,
          username,
          display_name: displayName,
          email: row.email || undefined,
          user_type: row.user_type || 'employee',
          organisation_id: row.organisation_id || '',
          department_id: row.department_id || '',
          is_active: row.is_active ?? true,
          tracking_id: row.tracking_id || null,
          phone_number: row.phone_number || null,
          created_at: row.created_at || new Date().toISOString()
        } as Profile;
      });

      console.log('✅ Profiles fetched successfully via scoped RPC:', normalized.length);
      return normalized;
    }

    if (!scopedError.message?.includes('Could not find the function public.get_scoped_user_directory')) {
      console.error('❌ Scoped profile RPC fetch failed:', scopedError);
    } else {
      console.warn('⚠️ get_scoped_user_directory not found, falling back to direct profiles query');
    }

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

    const normalizedFallback = (data || []).map(profile => ({
      ...profile,
      id: profile.id,
      user_id: profile.user_id || undefined,
      username: profile.username || 'user',
      display_name: profile.display_name || profile.username || 'User',
      email: undefined,
      user_type: profile.user_type || 'employee',
      organisation_id: profile.organisation_id || '',
      department_id: profile.department_id || '',
      is_active: profile.is_active ?? true,
      tracking_id: profile.tracking_id || null,
      phone_number: profile.phone_number || null,
      created_at: profile.created_at || new Date().toISOString()
    })) as Profile[];

    console.log('✅ Profiles fetched successfully:', normalizedFallback.length);
    return normalizedFallback;
    
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
  
  try {
    // Use secure RPC first. Fallback only when secure wrapper is unavailable.
    console.log('🔄 Using RPC function for user creation (fallback strategy)');

    const { data: authData } = await supabase.auth.getUser();
    const actorUserId = authData?.user?.id || null;

    const rpcPayload = {
      p_username: userData.username,
      p_password: userData.password,
      p_display_name: userData.display_name,
      p_user_type: userData.user_type,
      p_organisation_id: safeOrgId,
      p_department_id: safeDeptId,
      p_phone_number: userData.phone_number || null,
      p_created_by: actorUserId
    };

    let rpcName: 'create_user_secure' | 'create_user_with_credentials' | 'create_user_with_username' = 'create_user_secure';
    let { data, error } = await supabase.rpc(rpcName, rpcPayload);

    if (error?.message?.includes('Could not find the function public.create_user_secure')) {
      console.warn('⚠️ create_user_secure not found, falling back to legacy RPCs');
      rpcName = 'create_user_with_credentials';
      ({ data, error } = await supabase.rpc(rpcName, rpcPayload));

      if (error?.message?.includes('Could not find the function public.create_user_with_credentials')) {
        console.warn('⚠️ create_user_with_credentials not found, falling back to create_user_with_username');
        rpcName = 'create_user_with_username';
        ({ data, error } = await supabase.rpc(rpcName, rpcPayload));
      }
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
