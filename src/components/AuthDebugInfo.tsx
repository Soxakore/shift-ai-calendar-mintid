// Debug Auth Component - Temporary debugging tool
import React from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export const AuthDebugInfo = () => {
  const { user, profile, session, loading } = useSupabaseAuth();
  
  if (process.env.NODE_ENV !== 'development') return null;

  const isSuperAdmin = user?.email === 'tiktok518@gmail.com';
  
  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: '#000',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>🔍 Auth Debug Info</h4>
      <div>Loading: {loading ? '✅' : '❌'}</div>
      <div>User: {user ? '✅' : '❌'} {user?.email}</div>
      <div>User ID: {user?.id || 'N/A'}</div>
      <div>Profile: {profile ? '✅' : '❌'} {profile?.username}</div>
      <div>User Type: {profile?.user_type || 'N/A'}</div>
      <div>Organisation ID: {profile?.organisation_id || 'N/A'}</div>
      <div>Active: {profile?.is_active ? '✅' : '❌'}</div>
      <div>Session: {session ? '✅' : '❌'}</div>
      {isSuperAdmin && <div style={{color: '#00ff00'}}>🚀 SUPER ADMIN BYPASS ACTIVE</div>}
      {user && !profile && !isSuperAdmin && <div style={{color: '#ff6b6b'}}>⚠️ User exists but no profile!</div>}
    </div>
  );
};
