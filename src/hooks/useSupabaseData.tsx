import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Tables } from '@/integrations/supabase/types';

type Organisation = Tables<'organisations'>;
type Department = Tables<'departments'>;
type Profile = Tables<'profiles'>;

export interface ScheduleRecord {
  id: string;
  user_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  shift?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TimeLogRecord {
  id: string;
  user_id: string;
  date: string;
  clock_in?: string | null;
  clock_out?: string | null;
  method?: string | null;
  location?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NotificationRecord {
  id: string;
  user_id: number | null;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  is_read?: boolean | null;
  read?: boolean | null;
  sent_via?: string[] | null;
  created_at?: string | null;
}

const isSameDay = (left: Date, right: Date) => left.toDateString() === right.toDateString();

export const useSupabaseData = () => {
  const { profile } = useSupabaseAuth();

  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLogRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const getSuperAdminViewingOrg = () => {
    try {
      const storedContext = sessionStorage.getItem('superAdminViewingOrg');
      return storedContext ? JSON.parse(storedContext) : null;
    } catch (error) {
      console.error('Error parsing super admin context:', error);
      return null;
    }
  };

  const toScopedUserIds = (scopeProfiles?: Profile[]) =>
    (scopeProfiles || profiles)
      .map((entry) => entry.user_id)
      .filter((userId): userId is string => typeof userId === 'string' && userId.length > 0);

  const toScopedProfileIds = (scopeProfiles?: Profile[]) =>
    (scopeProfiles || profiles)
      .map((entry) => entry.id)
      .filter((id): id is number => typeof id === 'number' && Number.isFinite(id));

  const fetchOrganizations = async () => {
    if (!profile) return;

    try {
      let query = supabase.from('organisations').select('*');
      const superAdminContext = getSuperAdminViewingOrg();

      if (profile.user_type === 'super_admin' && superAdminContext?.id) {
        query = query.eq('id', superAdminContext.id);
      } else if (profile.user_type !== 'super_admin') {
        if (!profile.organisation_id) {
          setOrganisations([]);
          return;
        }
        query = query.eq('id', profile.organisation_id);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching organizations:', error);
        setOrganisations([]);
        return;
      }

      setOrganisations((data || []) as Organisation[]);
    } catch (error) {
      console.error('Exception fetching organizations:', error);
      setOrganisations([]);
    }
  };

  const fetchDepartments = async () => {
    if (!profile) return;

    try {
      let query = supabase.from('departments').select('*');
      const superAdminContext = getSuperAdminViewingOrg();

      if (profile.user_type === 'super_admin' && superAdminContext) {
        query = query.eq('organisation_id', superAdminContext.id);
      } else if (profile.user_type !== 'super_admin') {
        if (!profile.organisation_id) {
          setDepartments([]);
          return;
        }
        query = query.eq('organisation_id', profile.organisation_id);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
        return;
      }

      setDepartments((data || []) as Department[]);
    } catch (error) {
      console.error('Exception fetching departments:', error);
      setDepartments([]);
    }
  };

  const fetchProfiles = async (): Promise<Profile[]> => {
    if (!profile) return [];

    try {
      let query = supabase.from('profiles').select('*');
      const superAdminContext = getSuperAdminViewingOrg();

      if (profile.user_type === 'super_admin' && superAdminContext) {
        query = query.eq('organisation_id', superAdminContext.id);
      } else if (profile.user_type === 'org_admin') {
        if (!profile.organisation_id) {
          setProfiles([]);
          return [];
        }
        query = query.eq('organisation_id', profile.organisation_id);
      } else if (profile.user_type === 'manager') {
        if (!profile.department_id) {
          setProfiles([]);
          return [];
        }
        query = query.eq('department_id', profile.department_id);
      } else if (profile.user_type === 'employee') {
        if (!profile.id) {
          setProfiles([]);
          return [];
        }
        query = query.eq('id', profile.id);
      }

      const { data, error } = await query.order('display_name');

      if (error) {
        console.error('Error fetching profiles:', error);
        setProfiles([]);
        return [];
      }

      const scopedProfiles = (data || []) as Profile[];
      setProfiles(scopedProfiles);
      return scopedProfiles;
    } catch (error) {
      console.error('Exception fetching profiles:', error);
      setProfiles([]);
      return [];
    }
  };

  const fetchSchedules = async (scopeProfiles?: Profile[]) => {
    if (!profile) return;

    try {
      let query = supabase.from('schedules').select('*');
      const scopedUserIds = toScopedUserIds(scopeProfiles);
      const superAdminContext = getSuperAdminViewingOrg();

      if (profile.user_type === 'employee') {
        if (!profile.user_id) {
          setSchedules([]);
          return;
        }
        query = query.eq('user_id', profile.user_id);
      } else if (profile.user_type === 'manager') {
        if (!profile.department_id || scopedUserIds.length === 0) {
          setSchedules([]);
          return;
        }
        query = query.in('user_id', scopedUserIds);
      } else if (profile.user_type === 'org_admin') {
        if (!profile.organisation_id || scopedUserIds.length === 0) {
          setSchedules([]);
          return;
        }
        query = query.in('user_id', scopedUserIds);
      } else if (profile.user_type === 'super_admin' && superAdminContext) {
        if (scopedUserIds.length === 0) {
          setSchedules([]);
          return;
        }
        query = query.in('user_id', scopedUserIds);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        console.error('Error fetching schedules:', error);
        setSchedules([]);
        return;
      }

      setSchedules((data || []) as ScheduleRecord[]);
    } catch (error) {
      console.error('Exception fetching schedules:', error);
      setSchedules([]);
    }
  };

  const fetchTimeLogs = async (scopeProfiles?: Profile[]) => {
    if (!profile) return;

    try {
      let query = supabase.from('time_logs').select('*');
      const scopedUserIds = toScopedUserIds(scopeProfiles);
      const superAdminContext = getSuperAdminViewingOrg();

      if (profile.user_type === 'employee') {
        if (!profile.user_id) {
          setTimeLogs([]);
          return;
        }
        query = query.eq('user_id', profile.user_id);
      } else if (profile.user_type === 'manager') {
        if (!profile.department_id || scopedUserIds.length === 0) {
          setTimeLogs([]);
          return;
        }
        query = query.in('user_id', scopedUserIds);
      } else if (profile.user_type === 'org_admin') {
        if (!profile.organisation_id || scopedUserIds.length === 0) {
          setTimeLogs([]);
          return;
        }
        query = query.in('user_id', scopedUserIds);
      } else if (profile.user_type === 'super_admin' && superAdminContext) {
        if (scopedUserIds.length === 0) {
          setTimeLogs([]);
          return;
        }
        query = query.in('user_id', scopedUserIds);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        console.error('Error fetching time logs:', error);
        setTimeLogs([]);
        return;
      }

      setTimeLogs((data || []) as TimeLogRecord[]);
    } catch (error) {
      console.error('Exception fetching time logs:', error);
      setTimeLogs([]);
    }
  };

  const fetchNotifications = async (scopeProfiles?: Profile[]) => {
    if (!profile) return;

    try {
      let query = supabase.from('notifications').select('*');
      const scopedProfileIds = toScopedProfileIds(scopeProfiles);
      const superAdminContext = getSuperAdminViewingOrg();

      if (profile.user_type === 'employee') {
        if (typeof profile.id !== 'number') {
          setNotifications([]);
          return;
        }
        query = query.eq('user_id', profile.id);
      } else if (profile.user_type === 'manager') {
        if (!profile.department_id || scopedProfileIds.length === 0) {
          setNotifications([]);
          return;
        }
        query = query.in('user_id', scopedProfileIds);
      } else if (profile.user_type === 'org_admin') {
        if (!profile.organisation_id || scopedProfileIds.length === 0) {
          setNotifications([]);
          return;
        }
        query = query.in('user_id', scopedProfileIds);
      } else if (profile.user_type === 'super_admin' && superAdminContext) {
        if (scopedProfileIds.length === 0) {
          setNotifications([]);
          return;
        }
        query = query.in('user_id', scopedProfileIds);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        return;
      }

      const normalized = ((data || []) as Array<Record<string, unknown>>).map((row) => {
        const readValue =
          typeof row.read === 'boolean'
            ? row.read
            : typeof row.is_read === 'boolean'
              ? row.is_read
              : false;

        return {
          ...(row as NotificationRecord),
          user_id: typeof row.user_id === 'number' ? row.user_id : Number(row.user_id || 0) || null,
          is_read: typeof row.is_read === 'boolean' ? row.is_read : readValue,
          read: readValue,
        };
      });

      setNotifications(normalized);
    } catch (error) {
      console.error('Exception fetching notifications:', error);
      setNotifications([]);
    }
  };

  const fetchData = async () => {
    if (!profile) return;

    setLoading(true);

    try {
      await Promise.all([fetchOrganizations(), fetchDepartments()]);
      const scopedProfiles = await fetchProfiles();
      await Promise.all([
        fetchSchedules(scopedProfiles),
        fetchTimeLogs(scopedProfiles),
        fetchNotifications(scopedProfiles),
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!profile) return () => undefined;

    const channel = supabase
      .channel(`data-changes-${profile.user_id || profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'organisations' },
        () => fetchOrganizations()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'departments' },
        () => fetchDepartments()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          setTimeout(() => {
            fetchData();
          }, 250);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedules' },
        () => fetchSchedules()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_logs' },
        () => fetchTimeLogs()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    if (profile) {
      fetchData();
      const cleanup = setupRealtimeSubscriptions();
      return cleanup;
    }

    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return {
    organisations,
    departments,
    profiles,
    schedules,
    timeLogs,
    notifications,
    loading,
    refetch: fetchData,
    refetchOrganisations: fetchOrganizations,
    refetchProfiles: fetchProfiles,
    refetchDepartments: fetchDepartments,
    refetchSchedules: fetchSchedules,
    refetchTimeLogs: fetchTimeLogs,
    refetchNotifications: fetchNotifications,
    forceRefresh: () => {
      setTimeout(() => {
        fetchData();
      }, 300);
    },
    getTodayScheduleForUser: (userId: string) =>
      schedules.find((entry) => entry.user_id === userId && isSameDay(new Date(entry.date), new Date())),
  };
};
