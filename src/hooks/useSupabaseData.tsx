
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
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    setLoading(true);
    try {
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
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setOrganizations(data);
    }
  };

  const fetchDepartments = async () => {
    let query = supabase.from('departments').select('*');
    
    // Filter based on user role
    if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
      query = query.eq('organization_id', profile.organization_id);
    }
    
    const { data, error } = await query.order('name');
    
    if (!error && data) {
      setDepartments(data);
    }
  };

  const fetchProfiles = async () => {
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
    
    if (!error && data) {
      setProfiles(data);
    }
  };

  const fetchSchedules = async () => {
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
    
    if (!error && data) {
      setSchedules(data);
    }
  };

  const fetchSickNotices = async () => {
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
    
    if (!error && data) {
      setSickNotices(data);
    }
  };

  const fetchTimeLogs = async () => {
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
    
    if (!error && data) {
      setTimeLogs(data);
    }
  };

  const fetchQRCodes = async () => {
    let query = supabase.from('qr_codes').select('*');
    
    // Filter based on user role
    if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
      query = query.eq('organization_id', profile.organization_id);
    }
    
    const { data, error } = await query.order('name');
    
    if (!error && data) {
      setQRCodes(data);
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
    refetch: fetchData
  };
};
