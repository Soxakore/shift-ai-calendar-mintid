import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

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

// Admin client for operations requiring service role permissions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// For now, we'll use the anon key but add special handling for admin operations
// In production, you should add the service role key to your environment
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// Create admin client - will use service role key if available, otherwise anon key
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Check if we have proper admin access
export const hasAdminAccess = () => {
  // For development: Return true if we have a service role key OR if in development mode
  if (SUPABASE_SERVICE_ROLE_KEY) {
    return true;
  }
  
  // Fallback for development when service role key is not available
  const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development';
  if (isDevelopment) {
    console.warn('⚠️ Using development admin access fallback. For production, set VITE_SUPABASE_SERVICE_ROLE_KEY');
    return true;
  }
  
  return false;
};

interface UserMetadata {
  username?: string;
  display_name?: string;
  user_type?: string;
  organisation_id?: string;
  department_id?: string;
  phone_number?: string;
  created_by?: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface CreateUserData {
  email: string;
  password: string;
  user_metadata: UserMetadata;
  email_confirm?: boolean;
}

interface AdminOperationResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Admin user operations with fallback strategies
export const adminUserOperations = {
  
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    console.log('🗑️ Attempting admin user deletion for:', userId);
    
    try {
      if (hasAdminAccess()) {
        // Use admin API if service role key is available
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (error) {
          console.error('❌ Admin API deletion failed:', error.message);
          return { success: false, error: error.message };
        }
        
        console.log('✅ User deleted via admin API');
        return { success: true };
      } else {
        // Fallback: Delete profile record using user_id field (UUID)
        console.log('⚠️ No service role key - using profile deletion fallback');
        console.log('🔍 Attempting to delete profile with user_id:', userId);
        
        // First try deleting by user_id (UUID field that references auth.users.id)
        let deleteResult = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('user_id', userId);
        
        if (deleteResult.error) {
          console.log('⚠️ user_id deletion failed, trying id field:', deleteResult.error.message);
          
          // Fallback: Try deleting by id field (bigint) if userId is numeric
          if (/^\d+$/.test(userId)) {
            deleteResult = await supabaseAdmin
              .from('profiles')
              .delete()
              .eq('id', Number(userId));
          }
        }
        
        if (deleteResult.error) {
          console.error('❌ Profile deletion failed:', deleteResult.error.message);
          return { success: false, error: deleteResult.error.message };
        }
        
        console.log('✅ User profile deleted (auth user remains)');
        return { success: true };
      }
    } catch (error) {
      console.error('💥 Exception during user deletion:', error);
      return { success: false, error: 'Unexpected error during deletion' };
    }
  },

  async createUser(userData: CreateUserData): Promise<AdminOperationResult> {
    console.log('🚀 Attempting admin user creation');
    
    // Validate and clean UUID fields
    const safeOrgId = safeUUID(userData.user_metadata.organisation_id);
    const safeDeptId = safeUUID(userData.user_metadata.department_id);
    
    console.log('🔍 UUID validation:', {
      original_org: userData.user_metadata.organisation_id,
      safe_org: safeOrgId,
      original_dept: userData.user_metadata.department_id,
      safe_dept: safeDeptId
    });
    
    try {
      if (hasAdminAccess()) {
        // Use admin API if service role key is available
        const cleanUserData = {
          ...userData,
          user_metadata: {
            ...userData.user_metadata,
            organisation_id: safeOrgId,
            department_id: safeDeptId
          }
        };
        
        const { data, error } = await supabaseAdmin.auth.admin.createUser(cleanUserData);
        
        if (error) {
          console.error('❌ Admin API creation failed:', error.message);
          return { success: false, error: error.message };
        }
        
        console.log('✅ User created via admin API');
        return { success: true, data };
      } else {
        // Fallback: Use RPC function for user creation
        console.log('⚠️ No service role key - using RPC fallback for user creation');
        
        const { data, error } = await supabaseAdmin.rpc('create_user_with_username', {
          p_username: userData.user_metadata.username,
          p_password: userData.password,
          p_display_name: userData.user_metadata.display_name,
          p_user_type: userData.user_metadata.user_type,
          p_organisation_id: safeOrgId,
          p_department_id: safeDeptId,
          p_phone_number: userData.user_metadata.phone_number || null,
          p_created_by: userData.user_metadata.created_by || null
        });
        
        if (error) {
          console.error('❌ RPC user creation failed:', error.message);
          return { success: false, error: error.message };
        }
        
        if (!data?.success) {
          console.error('❌ RPC returned failure:', data?.error);
          return { success: false, error: data?.error || 'User creation failed' };
        }
        
        console.log('✅ User created via RPC fallback');
        return { success: true, data };
      }
    } catch (error) {
      console.error('💥 Exception during user creation:', error);
      return { success: false, error: 'Unexpected error during creation' };
    }
  },

  async updateUserPassword(userId: string, password: string): Promise<{ success: boolean; error?: string }> {
    console.log('🔑 Attempting password update for user:', userId);
    
    try {
      if (hasAdminAccess()) {
        // Use admin API if service role key is available
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: password
        });
        
        if (error) {
          console.error('❌ Admin API password update failed:', error.message);
          return { success: false, error: error.message };
        }
        
        console.log('✅ Password updated via admin API');
        return { success: true };
      } else {
        // Fallback: Use RPC function for password update
        console.log('⚠️ No service role key - using RPC fallback for password update');
        
        const { data, error } = await supabaseAdmin.rpc('change_user_password', {
          user_id: userId,
          new_password: password
        });
        
        if (error) {
          console.error('❌ RPC password update failed:', error.message);
          return { success: false, error: error.message };
        }
        
        console.log('✅ Password updated via RPC fallback');
        return { success: true };
      }
    } catch (error) {
      console.error('💥 Exception during password update:', error);
      return { success: false, error: 'Unexpected error during password update' };
    }
  }
};

export { safeUUID, isValidUUID };
