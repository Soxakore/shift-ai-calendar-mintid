export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_optimization_metrics: {
        Row: {
          ai_conflicts_detected: number | null
          ai_conflicts_resolved: number | null
          ai_schedule_changes: number | null
          ai_suggestions_accepted: number | null
          ai_suggestions_made: number | null
          cost_savings_percentage: number | null
          created_at: string | null
          early_departures: number | null
          id: string
          labor_cost_actual: number | null
          labor_cost_optimized: number | null
          late_arrivals: number | null
          metric_date: string
          model_confidence: number | null
          month_start_date: string | null
          no_show_incidents: number | null
          org_id: string | null
          overstaffed_hours: number | null
          overtime_hours: number | null
          prediction_accuracy: number | null
          shift_swap_requests: number | null
          total_scheduled_hours: number | null
          total_worked_hours: number | null
          tracking_id: string | null
          understaffed_hours: number | null
          week_start_date: string | null
        }
        Insert: {
          ai_conflicts_detected?: number | null
          ai_conflicts_resolved?: number | null
          ai_schedule_changes?: number | null
          ai_suggestions_accepted?: number | null
          ai_suggestions_made?: number | null
          cost_savings_percentage?: number | null
          created_at?: string | null
          early_departures?: number | null
          id?: string
          labor_cost_actual?: number | null
          labor_cost_optimized?: number | null
          late_arrivals?: number | null
          metric_date: string
          model_confidence?: number | null
          month_start_date?: string | null
          no_show_incidents?: number | null
          org_id?: string | null
          overstaffed_hours?: number | null
          overtime_hours?: number | null
          prediction_accuracy?: number | null
          shift_swap_requests?: number | null
          total_scheduled_hours?: number | null
          total_worked_hours?: number | null
          tracking_id?: string | null
          understaffed_hours?: number | null
          week_start_date?: string | null
        }
        Update: {
          ai_conflicts_detected?: number | null
          ai_conflicts_resolved?: number | null
          ai_schedule_changes?: number | null
          ai_suggestions_accepted?: number | null
          ai_suggestions_made?: number | null
          cost_savings_percentage?: number | null
          created_at?: string | null
          early_departures?: number | null
          id?: string
          labor_cost_actual?: number | null
          labor_cost_optimized?: number | null
          late_arrivals?: number | null
          metric_date?: string
          model_confidence?: number | null
          month_start_date?: string | null
          no_show_incidents?: number | null
          org_id?: string | null
          overstaffed_hours?: number | null
          overtime_hours?: number | null
          prediction_accuracy?: number | null
          shift_swap_requests?: number | null
          total_scheduled_hours?: number | null
          total_worked_hours?: number | null
          tracking_id?: string | null
          understaffed_hours?: number | null
          week_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_optimization_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          diff_json: Json | null
          id: string
          row_id: string
          table_name: string
          timestamp: string | null
          tracking_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          diff_json?: Json | null
          id?: string
          row_id: string
          table_name: string
          timestamp?: string | null
          tracking_id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          diff_json?: Json | null
          id?: string
          row_id?: string
          table_name?: string
          timestamp?: string | null
          tracking_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organisation_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organisation_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organisation_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings_json: Json
          tracking_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings_json?: Json
          tracking_id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings_json?: Json
          tracking_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          created_by: string | null
          department_id: string | null
          display_name: string | null
          id: number
          is_active: boolean | null
          last_login: string | null
          organisation_id: string | null
          password_changed_at: string | null
          phone_number: string | null
          qr_code_enabled: boolean | null
          qr_code_expires_at: string | null
          tracking_id: string | null
          updated_at: string | null
          user_id: string | null
          user_type: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          display_name?: string | null
          id?: never
          is_active?: boolean | null
          last_login?: string | null
          organisation_id?: string | null
          password_changed_at?: string | null
          phone_number?: string | null
          qr_code_enabled?: boolean | null
          qr_code_expires_at?: string | null
          tracking_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          display_name?: string | null
          id?: never
          is_active?: boolean | null
          last_login?: string | null
          organisation_id?: string | null
          password_changed_at?: string | null
          phone_number?: string | null
          qr_code_enabled?: boolean | null
          qr_code_expires_at?: string | null
          tracking_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string
          username?: string | null
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          action: string
          created_at: string | null
          failure_reason: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          session_id: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shifts: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          note: string | null
          start_time: string
          status: Database["public"]["Enums"]["shift_status"]
          tracking_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          note?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["shift_status"]
          tracking_id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          note?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["shift_status"]
          tracking_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swap_requests: {
        Row: {
          created_at: string | null
          from_shift_id: string
          id: string
          message: string | null
          requesting_user_id: string
          state: Database["public"]["Enums"]["swap_state"]
          target_user_id: string
          to_shift_id: string
          tracking_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_shift_id: string
          id?: string
          message?: string | null
          requesting_user_id: string
          state?: Database["public"]["Enums"]["swap_state"]
          target_user_id: string
          to_shift_id: string
          tracking_id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_shift_id?: string
          id?: string
          message?: string | null
          requesting_user_id?: string
          state?: Database["public"]["Enums"]["swap_state"]
          target_user_id?: string
          to_shift_id?: string
          tracking_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swap_requests_from_shift_id_fkey"
            columns: ["from_shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requests_requesting_user_id_fkey"
            columns: ["requesting_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requests_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requests_to_shift_id_fkey"
            columns: ["to_shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active_swap: boolean
          auth_user_id: string | null
          created_at: string | null
          department: string
          email: string | null
          id: string
          org_id: string
          plan: string
          role: Database["public"]["Enums"]["user_role"]
          tracking_id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          active_swap?: boolean
          auth_user_id?: string | null
          created_at?: string | null
          department: string
          email?: string | null
          id?: string
          org_id: string
          plan: string
          role?: Database["public"]["Enums"]["user_role"]
          tracking_id?: string
          updated_at?: string | null
          username: string
        }
        Update: {
          active_swap?: boolean
          auth_user_id?: string | null
          created_at?: string | null
          department?: string
          email?: string | null
          id?: string
          org_id?: string
          plan?: string
          role?: Database["public"]["Enums"]["user_role"]
          tracking_id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ai_analyze_workload_balance: {
        Args: { target_org_id: string; analysis_weeks?: number }
        Returns: Json
      }
      ai_create_smart_shift: {
        Args: {
          target_user_id: string
          target_date: string
          duration_hours?: number
          preferred_start_time?: string
        }
        Returns: Json
      }
      ai_detect_smart_conflicts: {
        Args: { target_org_id: string; start_date: string; end_date: string }
        Returns: Json
      }
      ai_generate_schedule_recommendations: {
        Args: {
          target_org_id: string
          target_date: string
          hours_needed?: number
        }
        Returns: Json
      }
      ensure_super_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_calendar_events: {
        Args: {
          target_org_id: string
          start_date: string
          end_date: string
          user_filter?: string
        }
        Returns: Json
      }
      get_org_optimization_summary: {
        Args: { target_org_id: string; summary_days?: number }
        Returns: Json
      }
      get_user_upcoming_shifts: {
        Args: { target_user_id: string; days_ahead?: number }
        Returns: Json
      }
      reset_super_admin_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      shift_status: "draft" | "confirmed" | "sick" | "leave"
      swap_state: "pending" | "approved" | "rejected" | "cancelled"
      user_role: "super_admin" | "manager" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      shift_status: ["draft", "confirmed", "sick", "leave"],
      swap_state: ["pending", "approved", "rejected", "cancelled"],
      user_role: ["super_admin", "manager", "employee"],
    },
  },
} as const