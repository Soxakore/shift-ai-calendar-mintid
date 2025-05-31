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

  // Check if super admin is viewing a specific organization
  const getSuperAdminViewingOrg = () => {
    try {
      const storedContext = sessionStorage.getItem('superAdminViewingOrg');
      return storedContext ? JSON.parse(storedContext) : null;
    } catch (error) {
      console.error('Error parsing super admin context:', error);
      return null;
    }
  };

  useEffect(() => {
    if (profile) {
      console.log('🔄 Profile available, fetching data for:', profile.user_type);
      fetchData();
      const cleanup = setupRealtimeSubscriptions();
      return cleanup;
    } else {
      console.log('⏳ Waiting for profile...');
      // Set a timeout to prevent infinite loading if profile never loads
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Profile timeout, setting loading to false');
        setLoading(false);
      }, 15000);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const setupRealtimeSubscriptions = () => {
    console.log('🔔 Setting up real-time subscriptions...');
    
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
          console.log('🏢 Organization change detected:', payload);
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
          console.log('👤 Profile change detected:', payload);
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
          console.log('🏬 Department change detected:', payload);
          fetchDepartments();
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });

    return () => {
      console.log('🧹 Cleaning up real-time subscriptions...');
      supabase.removeChannel(channel);
    };
  };

  const fetchData = async () => {
    if (!profile) {
      console.log('❌ No profile available for data fetching');
      return;
    }

    console.log('📊 Starting data fetch for profile:', profile.user_type);
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
      console.log('✅ All data fetched successfully');
    } catch (error) {
      console.error('💥 Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      console.log('🏢 Fetching organizations...');
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching organizations:', error);
        return;
      }
      
      console.log(`✅ Organizations fetched: ${data?.length || 0} items`);
      setOrganizations(data || []);
    } catch (error) {
      console.error('💥 Exception fetching organizations:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      let query = supabase.from('departments').select('*');
      
      // Check if super admin is viewing a specific org
      const superAdminContext = getSuperAdminViewingOrg();
      
      if (profile?.user_type === 'super_admin' && superAdminContext) {
        // Super admin viewing specific organization
        query = query.eq('organization_id', superAdminContext.id);
      } else if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
        // Regular user - filter by their organization
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
      
      // Check if super admin is viewing a specific org
      const superAdminContext = getSuperAdminViewingOrg();
      
      if (profile?.user_type === 'super_admin' && superAdminContext) {
        // Super admin viewing specific organization
        query = query.eq('organization_id', superAdminContext.id);
      } else if (profile?.user_type === 'org_admin' && profile?.organization_id) {
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
      
      const superAdminContext = getSuperAdminViewingOrg();
      
      if (profile?.user_type === 'super_admin' && superAdminContext) {
        query = query.eq('organization_id', superAdminContext.id);
      } else if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
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
      
      const superAdminContext = getSuperAdminViewingOrg();
      
      if (profile?.user_type === 'super_admin' && superAdminContext) {
        query = query.eq('organization_id', superAdminContext.id);
      } else if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
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
      
      const superAdminContext = getSuperAdminViewingOrg();
      
      if (profile?.user_type === 'super_admin' && superAdminContext) {
        query = query.eq('organization_id', superAdminContext.id);
      } else if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
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
      
      const superAdminContext = getSuperAdminViewingOrg();
      
      if (profile?.user_type === 'super_admin' && superAdminContext) {
        query = query.eq('organization_id', superAdminContext.id);
      } else if (profile?.user_type !== 'super_admin' && profile?.organization_id) {
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
