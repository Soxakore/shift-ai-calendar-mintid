import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Tables } from '@/integrations/supabase/types';

type Organisation = Tables<'organisations'>;
type Department = Tables<'departments'>;
type Profile = Tables<'profiles'>;

export const useSupabaseData = () => {
  const { profile } = useSupabaseAuth();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
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
          table: 'organisations'
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
          // Add a slight delay to ensure database consistency
          setTimeout(() => {
            fetchProfiles();
          }, 250);
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
        fetchProfiles()
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
        .from('organisations')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching organizations:', error);
        return;
      }
      
      console.log(`✅ Organizations fetched: ${data?.length || 0} items`);
      setOrganisations(data || []);
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
        query = query.eq('organisation_id', superAdminContext.id);
      } else if (profile?.user_type !== 'super_admin' && profile?.organisation_id) {
        // Regular user - filter by their organization
        query = query.eq('organisation_id', profile.organisation_id);
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
        query = query.eq('organisation_id', superAdminContext.id);
      } else if (profile?.user_type === 'org_admin' && profile?.organisation_id) {
        query = query.eq('organisation_id', profile.organisation_id);
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

  return {
    organisations,
    departments,
    profiles,
    loading,
    refetch: fetchData,
    refetchOrganisations: fetchOrganizations,
    refetchProfiles: fetchProfiles,
    refetchDepartments: fetchDepartments,
    // Force refresh all data - useful after user creation
    forceRefresh: () => {
      console.log('🔄 Force refreshing all data...');
      setTimeout(() => {
        fetchData();
      }, 300);
    }
  };
};
