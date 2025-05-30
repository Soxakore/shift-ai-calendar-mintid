
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Tables } from '@/integrations/supabase/types';

type Organization = Tables<'organizations'>;
type Department = Tables<'departments'>;
type Profile = Tables<'profiles'>;
type Schedule = Tables<'schedules'>;
type SickNotice = Tables<'sick_notices'>;
type TimeLog = Tables<'time_logs'>;
type QRCode = Tables<'qr_codes'>;

export const useSupabaseData = () => {
  const { profile } = useSupabaseAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sickNotices, setSickNotices] = useState<SickNotice[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchData();
      setupRealtimeSubscriptions();
    }
  }, [profile]);

  const setupRealtimeSubscriptions = () => {
    console.log('Setting up real-time subscriptions...');
    
    const channel = supabase
      .channel('data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizations'
        },
        (payload) => {
          console.log('Organization change detected:', payload);
          fetchOrganizations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change detected:', payload);
          fetchProfiles();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'departments'
        },
        (payload) => {
          console.log('Department change detected:', payload);
          fetchDepartments();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      supabase.removeChannel(channel);
    };
  };

  const fetchData = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      console.log('Fetching all data for profile:', profile);
      await Promise.all([
        fetchOrganizations(),
        fetchDepartments(),
        fetchProfiles(),
        fetchSchedules(),
        fetchSickNotices(),
        fetchTimeLogs(),
        fetchQRCodes()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      console.log('Fetching organizations...');
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching organizations:', error);
      } else {
        console.log('Organizations fetched:', data);
        setOrganizations(data || []);
      }
    } catch (error) {
      console.error('Exception fetching organizations:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      let query = supabase.from('departments').select('*');
      
      // Filter based on user role
      if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
        query = query.eq('organization_id', profile.organization_id);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        console.error('Error fetching departments:', error);
      } else {
        console.log('Departments fetched:', data);
        setDepartments(data || []);
      }
    } catch (error) {
      console.error('Exception fetching departments:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      let query = supabase.from('profiles').select('*');
      
      // Filter based on user role
      if (profile?.user_type === 'org_admin' && profile?.organization_id) {
        query = query.eq('organization_id', profile.organization_id);
      } else if (profile?.user_type === 'manager' && profile?.department_id) {
        query = query.eq('department_id', profile.department_id);
      } else if (profile?.user_type === 'employee') {
        query = query.eq('id', profile.id);
      }
      
      const { data, error } = await query.order('display_name');
      
      if (error) {
        console.error('Error fetching profiles:', error);
      } else {
        console.log('Profiles fetched:', data);
        setProfiles(data || []);
      }
    } catch (error) {
      console.error('Exception fetching profiles:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      let query = supabase.from('schedules').select('*');
      
      // Filter based on user role and organization
      if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
        query = query.eq('organization_id', profile.organization_id);
      }
      
      if (profile?.user_type === 'manager' && profile?.department_id) {
        query = query.eq('department_id', profile.department_id);
      } else if (profile?.user_type === 'employee') {
        query = query.eq('user_id', profile.id);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching schedules:', error);
      } else {
        setSchedules(data || []);
      }
    } catch (error) {
      console.error('Exception fetching schedules:', error);
    }
  };

  const fetchSickNotices = async () => {
    try {
      let query = supabase.from('sick_notices').select('*');
      
      // Filter based on user role
      if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
        query = query.eq('organization_id', profile.organization_id);
      }
      
      if (profile?.user_type === 'manager' && profile?.department_id) {
        query = query.eq('department_id', profile.department_id);
      } else if (profile?.user_type === 'employee') {
        query = query.eq('user_id', profile.id);
      }
      
      const { data, error } = await query.order('submitted_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching sick notices:', error);
      } else {
        setSickNotices(data || []);
      }
    } catch (error) {
      console.error('Exception fetching sick notices:', error);
    }
  };

  const fetchTimeLogs = async () => {
    try {
      let query = supabase.from('time_logs').select('*');
      
      // Filter based on user role
      if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
        query = query.eq('organization_id', profile.organization_id);
      }
      
      if (profile?.user_type === 'manager' && profile?.department_id) {
        query = query.eq('department_id', profile.department_id);
      } else if (profile?.user_type === 'employee') {
        query = query.eq('user_id', profile.id);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching time logs:', error);
      } else {
        setTimeLogs(data || []);
      }
    } catch (error) {
      console.error('Exception fetching time logs:', error);
    }
  };

  const fetchQRCodes = async () => {
    try {
      let query = supabase.from('qr_codes').select('*');
      
      // Filter based on user role
      if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
        query = query.eq('organization_id', profile.organization_id);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        console.error('Error fetching QR codes:', error);
      } else {
        setQRCodes(data || []);
      }
    } catch (error) {
      console.error('Exception fetching QR codes:', error);
    }
  };

  return {
    organizations,
    departments,
    profiles,
    schedules,
    sickNotices,
    timeLogs,
    qrCodes,
    loading,
    refetch: fetchData,
    refetchOrganizations: fetchOrganizations,
    refetchProfiles: fetchProfiles,
    refetchDepartments: fetchDepartments
  };
};
