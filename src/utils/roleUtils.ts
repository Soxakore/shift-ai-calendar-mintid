/**
 * Utility functions for role-based functionality
 */

export const getRoleBasedDashboard = (userType: string): string => {
  switch (userType) {
    case 'super_admin':
      return '/super-admin';
    case 'org_admin':
      return '/admin/organization';
    case 'manager':
      return '/manager/dashboard';
    case 'employee':
      return '/employee/dashboard';
    default:
      return '/employee/dashboard';
  }
};

export const isAuthorizedForRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};
