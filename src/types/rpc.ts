// Custom RPC function types for username-based authentication
// These functions were added manually to the database

export interface AuthenticateUsernameLoginParams {
  p_username: string;
  p_password: string;
}

export interface AuthenticateUsernameLoginResult {
  success: boolean;
  error?: string;
  data?: {
    profile_id: number;
    username: string;
    display_name: string;
    user_type: string;
    organisation_id?: string;
    department_id?: string;
    is_active: boolean;
    tracking_id?: string;
    last_login?: string;
  };
}

export interface CreateUserWithUsernameParams {
  p_username: string;
  p_password: string;
  p_display_name: string;
  p_user_type: string;
  p_organisation_id?: string | null;
  p_department_id?: string | null;
  p_phone_number?: string | null;
  p_created_by?: string | null;
}

export interface CreateUserWithUsernameResult {
  success: boolean;
  error?: string;
  data?: {
    profile_id: number;
    username: string;
    display_name: string;
    user_type: string;
  };
}

export interface ChangeUserPasswordParams {
  p_username: string;
  p_current_password: string;
  p_new_password: string;
}

export interface ChangeUserPasswordResult {
  success: boolean;
  error?: string;
  message?: string;
}
