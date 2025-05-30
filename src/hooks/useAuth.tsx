import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';

// Legacy compatibility wrapper
export const useAuth = () => {
  const { user, profile, loading, signOut } = useSupabaseAuth();
  
  return {
    user: profile ? {
      id: profile.id,
      name: profile.display_name,
      username: profile.username,
      email: user?.email || '',
      role: profile.user_type,
      organizationId: profile.organization_id,
      departmentId: profile.department_id
    } : null,
    isAuthenticated: !!user && !!profile,
    login: () => Promise.resolve(false), // Deprecated - use signIn instead
    register: () => Promise.resolve(false), // Deprecated
    logout: signOut,
    hasRole: (role: string | string[]) => {
      if (!profile) return false;
      const roles = Array.isArray(role) ? role : [role];
      if (profile.user_type === 'super_admin') return true;
      return roles.includes(profile.user_type);
    },
    loading,
    setUser: () => {}, // Not needed with Supabase
  };
};

// Keep the existing AuthProvider for compatibility but use Supabase under the hood
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};
