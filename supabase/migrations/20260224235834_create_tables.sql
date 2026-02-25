-- Tables (without views - they depend on tables existing first)
CREATE TABLE public.attendance_registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    replacement_group character varying(10) NOT NULL,
    compensation_level character varying(10) NOT NULL,
    description text,
    notes text,
    status character varying(20) DEFAULT 'pending'::character varying,
    submitted_by uuid NOT NULL,
    submitted_at timestamp with time zone DEFAULT now(),
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_staff_on_other_unit boolean DEFAULT false,
    selected_employee_id uuid,
    selected_position character varying(50),
    department_id uuid,
    time_calculation_type character varying(20) DEFAULT 'manual'::character varying,
    overtime_hours numeric(5,2),
    compensation_hours numeric(5,2),
    total_hours numeric(5,2),
    additional_comments text,
    requires_manager_approval boolean DEFAULT false,
    end_date date,
    manager_comment text,
    CONSTRAINT attendance_registrations_compensation_hours_check CHECK ((compensation_hours >= (0)::numeric)),
    CONSTRAINT attendance_registrations_overtime_hours_check CHECK ((overtime_hours >= (0)::numeric)),
    CONSTRAINT attendance_registrations_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'pending_manager_approval'::character varying, 'approved'::character varying, 'rejected'::character varying, 'manager_approved'::character varying, 'final_approved'::character varying])::text[]))),
    CONSTRAINT attendance_registrations_time_calculation_type_check CHECK (((time_calculation_type)::text = ANY ((ARRAY['manual'::character varying, 'calculated'::character varying])::text[]))),
    CONSTRAINT attendance_registrations_time_check CHECK (((((end_date IS NULL) OR (end_date = date)) AND (start_time < end_time)) OR ((end_date = (date + '1 day'::interval)) AND (start_time > end_time)))),
    CONSTRAINT attendance_registrations_total_hours_check CHECK ((total_hours >= (0)::numeric))
);
ALTER TABLE public.attendance_registrations OWNER TO postgres;

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    organisation_id uuid,
    description text,
    tracking_id text DEFAULT (gen_random_uuid())::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);
ALTER TABLE public.departments OWNER TO postgres;

CREATE TABLE public.organisations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    settings_json jsonb DEFAULT '{}'::jsonb,
    tracking_id text DEFAULT (gen_random_uuid())::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);
ALTER TABLE public.organisations OWNER TO postgres;

CREATE TABLE public.profiles (
    id integer NOT NULL,
    user_id uuid,
    username text,
    display_name text,
    user_type text,
    organisation_id uuid,
    department_id uuid,
    created_by text,
    last_login timestamp with time zone,
    password_changed_at timestamp with time zone,
    phone_number text,
    is_active boolean DEFAULT true,
    qr_code_enabled boolean DEFAULT false,
    qr_code_expires_at timestamp with time zone,
    tracking_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    alias text,
    can_swap_shifts boolean DEFAULT false,
    plan text,
    avatar_url text
);
ALTER TABLE public.profiles OWNER TO postgres;

CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action text NOT NULL,
    actor_id uuid,
    table_name text NOT NULL,
    row_id text NOT NULL,
    diff_json jsonb,
    tracking_id text,
    "timestamp" timestamp with time zone DEFAULT now(),
    organisation_id uuid
);
ALTER TABLE public.audit_log OWNER TO postgres;

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_type text NOT NULL,
    ip_address text,
    location_data jsonb,
    metadata jsonb,
    target_organization_id text,
    target_user_id text,
    user_agent text,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.audit_logs OWNER TO postgres;

CREATE TABLE public.employee_role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    allowed_roles text[] DEFAULT '{}'::text[],
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.employee_role_permissions OWNER TO postgres;

CREATE TABLE public.filter_combinations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    filters jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.filter_combinations OWNER TO postgres;

CREATE TABLE public.leave_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid,
    shift_id uuid,
    type text,
    status text DEFAULT 'pending'::text,
    reason text,
    requested_at timestamp with time zone DEFAULT now(),
    resolved_at timestamp with time zone,
    department_id uuid,
    start_date date,
    end_date date,
    manager_id uuid,
    manager_response text,
    CONSTRAINT leave_requests_type_check CHECK ((type = ANY (ARRAY['vacation'::text, 'sick'::text, 'other'::text])))
);
ALTER TABLE public.leave_requests OWNER TO postgres;

CREATE TABLE public.leave_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.leave_types OWNER TO postgres;

CREATE TABLE public.notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date NOT NULL,
    note text NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.notes OWNER TO postgres;

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.notifications OWNER TO postgres;

CREATE TABLE public.plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#3b82f6'::text,
    is_active boolean DEFAULT true,
    created_by uuid,
    organization_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.plans OWNER TO postgres;

CREATE TABLE public.role_aliases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#3b82f6'::text NOT NULL,
    is_active boolean DEFAULT true,
    created_by uuid,
    organization_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.role_aliases OWNER TO postgres;

CREATE TABLE public.schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organisation_id uuid,
    department_id uuid,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    shift text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    sick_note text,
    status_updated_by uuid,
    status_updated_at timestamp with time zone,
    employee_id uuid,
    can_swap boolean DEFAULT true
);
ALTER TABLE public.schedules OWNER TO postgres;

CREATE TABLE public.session_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text,
    action text,
    success boolean,
    failure_reason text,
    user_agent text,
    ip_address text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.session_logs OWNER TO postgres;

CREATE TABLE public.shifts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text,
    note text,
    tracking_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    department_id uuid NOT NULL,
    date character varying
);
ALTER TABLE public.shifts OWNER TO postgres;

CREATE TABLE public.sick_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid,
    user_id uuid,
    date date NOT NULL,
    status text NOT NULL,
    note text,
    registered_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.sick_history OWNER TO postgres;

CREATE TABLE public.swap_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    requester_id uuid,
    target_employee_id uuid,
    original_schedule_id uuid,
    target_schedule_id uuid,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text,
    alias_filter text,
    manager_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT swap_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);
ALTER TABLE public.swap_requests OWNER TO postgres;

CREATE TABLE public.swap_requests_backup (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_shift_id uuid,
    to_shift_id uuid,
    requesting_user_id uuid,
    target_user_id uuid,
    state text,
    message text,
    tracking_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    department_id uuid,
    plan text,
    manager_id uuid,
    override_reason text,
    resolved_at timestamp with time zone,
    manager_response text
);
ALTER TABLE public.swap_requests_backup OWNER TO postgres;

CREATE TABLE public.time_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid,
    department_id uuid,
    date date NOT NULL,
    clock_in timestamp with time zone,
    clock_out timestamp with time zone,
    method text,
    location text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.time_logs OWNER TO postgres;

CREATE TABLE public.user_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    salt text NOT NULL,
    profile_id integer,
    is_active boolean DEFAULT true,
    failed_attempts integer DEFAULT 0,
    locked_until timestamp with time zone,
    created_by text,
    last_login timestamp with time zone,
    updated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.user_credentials OWNER TO postgres;

CREATE TABLE public.user_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    language character varying(2) DEFAULT 'en'::character varying,
    theme character varying(20) DEFAULT 'light'::character varying,
    notifications_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_preferences_language_check CHECK (((language)::text = ANY ((ARRAY['en'::character varying, 'sv'::character varying])::text[])))
);
ALTER TABLE public.user_preferences OWNER TO postgres;

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email text,
    role text NOT NULL,
    org_id uuid,
    department text,
    plan text,
    active_swap boolean DEFAULT false,
    auth_user_id uuid,
    tracking_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);
ALTER TABLE public.users OWNER TO postgres;

-- Sequence for profiles
CREATE SEQUENCE IF NOT EXISTS public.profiles_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.profiles_id_seq OWNER TO postgres;
ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;
ALTER TABLE ONLY public.profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);
SELECT setval('public.profiles_id_seq', 193, true);;
