// Temporary type definitions to bypass TypeScript errors
// These types help with development until Supabase types are regenerated

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc(name: 'authenticate_username_login', params: {
      p_username: string;
      p_password: string;
    }): Promise<{ data: any; error: any }>;
    
    rpc(name: 'create_user_with_username', params: {
      p_username: string;
      p_password: string;
      p_display_name: string;
      p_user_type: string;
      p_organisation_id?: string | null;
      p_department_id?: string | null;
      p_phone_number?: string | null;
      p_created_by?: string | null;
    }): Promise<{ data: any; error: any }>;

    rpc(name: 'create_user_with_credentials', params: {
      p_username: string;
      p_password: string;
      p_display_name: string;
      p_user_type: string;
      p_organisation_id?: string | null;
      p_department_id?: string | null;
      p_phone_number?: string | null;
      p_created_by?: string | null;
    }): Promise<{ data: any; error: any }>;

    rpc(name: 'create_user_secure', params: {
      p_username: string;
      p_password: string;
      p_display_name: string;
      p_user_type: string;
      p_organisation_id?: string | null;
      p_department_id?: string | null;
      p_phone_number?: string | null;
      p_created_by?: string | null;
    }): Promise<{ data: any; error: any }>;

    rpc(name: 'create_organisation_secure', params: {
      p_name: string;
      p_alias?: string | null;
      p_description?: string | null;
      p_created_by?: string | null;
    }): Promise<{ data: any; error: any }>;

    rpc(name: 'create_department_secure', params: {
      p_name: string;
      p_organisation_id: string;
      p_description?: string | null;
      p_created_by?: string | null;
    }): Promise<{ data: any; error: any }>;

    rpc(name: 'ensure_authenticated_profile', params?: Record<string, never>): Promise<{ data: any; error: any }>;

    rpc(name: 'get_pending_users', params?: Record<string, never>): Promise<{ data: any; error: any }>;

    rpc(name: 'assign_user_role', params: {
      target_user_id: string;
      new_role: string;
      organisation_id?: string | null;
    }): Promise<{ data: any; error: any }>;
    
    rpc(name: 'change_user_password', params: {
      p_username: string;
      p_current_password: string;
      p_new_password: string;
    }): Promise<{ data: any; error: any }>;
  }
}
