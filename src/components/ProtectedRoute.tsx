
import { ReactNode } from 'react';
import RoleBasedAuth from '@/components/auth/RoleBasedAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: string | string[];
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  // Convert requireRole to allowedRoles format for RoleBasedAuth
  const allowedRoles = requireRole 
    ? Array.isArray(requireRole) 
      ? requireRole as ('super_admin' | 'org_admin' | 'manager' | 'employee')[]
      : [requireRole as 'super_admin' | 'org_admin' | 'manager' | 'employee']
    : [];

  return (
    <RoleBasedAuth allowedRoles={allowedRoles}>
      {children}
    </RoleBasedAuth>
  );
};

export default ProtectedRoute;

export default ProtectedRoute;
