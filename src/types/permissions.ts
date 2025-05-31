// Role-based permission definitions
import { EnhancedUser } from './organization';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage_all';

export interface Permission {
  id: string;
  name: string;
  category: 'users' | 'departments' | 'reports' | 'settings' | 'organization' | 'schedule';
  actions: PermissionAction[];
  scope: 'own_department' | 'own_organization' | 'all_organizations';
}

// AuthUser interface for the authentication system
export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: 'super_admin' | 'org_admin' | 'manager' | 'employee';
  organizationId?: string;
  departmentId?: string;
}

// Permission sets for different roles
export const rolePermissions: Record<string, Permission[]> = {
  // Super Admin - You (access to everything)
  super_admin: [
    {
      id: 'manage_organizations',
      name: 'Manage Organizations',
      category: 'organization',
      actions: ['create', 'read', 'update', 'delete', 'manage_all'],
      scope: 'all_organizations'
    },
    {
      id: 'manage_all_users',
      name: 'Manage All Users',
      category: 'users',
      actions: ['create', 'read', 'update', 'delete', 'manage_all'],
      scope: 'all_organizations'
    },
    {
      id: 'manage_all_departments',
      name: 'Manage All Departments',
      category: 'departments',
      actions: ['create', 'read', 'update', 'delete', 'manage_all'],
      scope: 'all_organizations'
    },
    {
      id: 'view_all_reports',
      name: 'View All Reports',
      category: 'reports',
      actions: ['read', 'manage_all'],
      scope: 'all_organizations'
    },
    {
      id: 'manage_all_schedules',
      name: 'Manage All Schedules',
      category: 'schedule',
      actions: ['create', 'read', 'update', 'delete', 'manage_all'],
      scope: 'all_organizations'
    }
  ],

  org_admin: [
    {
      id: 'manage_org_users',
      name: 'Manage Organization Users',
      category: 'users',
      actions: ['create', 'read', 'update', 'delete'],
      scope: 'own_organization'
    },
    {
      id: 'manage_org_departments',
      name: 'Manage Organization Departments',
      category: 'departments',
      actions: ['create', 'read', 'update', 'delete'],
      scope: 'own_organization'
    },
    {
      id: 'view_org_reports',
      name: 'View Organization Reports',
      category: 'reports',
      actions: ['read'],
      scope: 'own_organization'
    },
    {
      id: 'manage_org_schedules',
      name: 'Manage Organization Schedules',
      category: 'schedule',
      actions: ['create', 'read', 'update', 'delete'],
      scope: 'own_organization'
    }
  ],

  manager: [
    {
      id: 'manage_dept_users',
      name: 'Manage Department Users',
      category: 'users',
      actions: ['create', 'read', 'update'],
      scope: 'own_department'
    },
    {
      id: 'view_dept_reports',
      name: 'View Department Reports', 
      category: 'reports',
      actions: ['read'],
      scope: 'own_department'
    },
    {
      id: 'manage_dept_schedules',
      name: 'Manage Department Schedules',
      category: 'schedule',
      actions: ['create', 'read', 'update', 'delete'],
      scope: 'own_department'
    }
  ],

  employee: [
    {
      id: 'view_own_data',
      name: 'View Own Data',
      category: 'users',
      actions: ['read'],
      scope: 'own_department'
    },
    {
      id: 'view_own_schedule',
      name: 'View Own Schedule',
      category: 'schedule',
      actions: ['read'],
      scope: 'own_department'
    }
  ]
};

// Helper function to get role from user - works with both AuthUser and EnhancedUser
const getUserRole = (user: AuthUser | EnhancedUser): string => {
  if ('role' in user) {
    return user.role;
  }
  // For EnhancedUser, use userType as role
  return user.userType;
};

// Helper function to convert EnhancedUser to have a role property
const addRoleToEnhancedUser = (user: EnhancedUser): EnhancedUser & { role: string } => {
  return { ...user, role: user.userType };
};

// Permission checking utility - works with both AuthUser and EnhancedUser
export const checkPermission = (
  user: AuthUser | EnhancedUser,
  requiredPermission: string,
  action: PermissionAction,
  targetUser?: AuthUser | EnhancedUser
): boolean => {
  const userRole = getUserRole(user);
  const userPermissions = rolePermissions[userRole] || [];
  
  for (const permission of userPermissions) {
    if (permission.id === requiredPermission && permission.actions.includes(action)) {
      switch (permission.scope) {
        case 'all_organizations':
          return true;
        case 'own_organization':
          return !targetUser || user.organizationId === targetUser.organizationId;
        case 'own_department':
          return !targetUser || (
            user.organizationId === targetUser.organizationId &&
            user.departmentId === targetUser.departmentId
          );
        default:
          return false;
      }
    }
  }
  return false;
};

// UI visibility rules - works with both AuthUser and EnhancedUser
export const getUIPermissions = (user: AuthUser | EnhancedUser) => {
  const userRole = getUserRole(user);
  const permissions = rolePermissions[userRole] || [];
  
  return {
    // Navigation items
    canViewOrganizations: userRole === 'super_admin',
    canViewAllUsers: userRole === 'super_admin',
    canViewOrgUsers: ['super_admin', 'org_admin'].includes(userRole),
    canViewDeptUsers: ['super_admin', 'org_admin', 'manager'].includes(userRole),
    canViewReports: permissions.some(p => p.category === 'reports'),
    canViewSettings: ['super_admin', 'org_admin'].includes(userRole),
    
    // User management
    canCreateUsers: permissions.some(p => p.id.includes('users') && p.actions.includes('create')),
    canEditUsers: permissions.some(p => p.id.includes('users') && p.actions.includes('update')),
    canDeleteUsers: permissions.some(p => p.id.includes('users') && p.actions.includes('delete')),
    
    // Schedule management
    canViewSchedules: permissions.some(p => p.category === 'schedule'),
    canCreateSchedules: permissions.some(p => p.category === 'schedule' && p.actions.includes('create')),
    canEditSchedules: permissions.some(p => p.category === 'schedule' && p.actions.includes('update')),
    canDeleteSchedules: permissions.some(p => p.category === 'schedule' && p.actions.includes('delete')),
    canManageAllSchedules: permissions.some(p => p.id === 'manage_all_schedules'),
    
    // Organization management
    canManageOrganizations: userRole === 'super_admin',
    canAccessSystemSettings: userRole === 'super_admin',
    
    // Data scope
    dataScope: userRole === 'super_admin' ? 'all' :
               userRole === 'org_admin' ? 'organization' : 
               userRole === 'manager' ? 'department' : 'self'
  };
};

// Schedule-specific permission helpers
export const checkSchedulePermission = (
  user: AuthUser | EnhancedUser,
  action: PermissionAction,
  targetUser?: AuthUser | EnhancedUser
): boolean => {
  const userRole = getUserRole(user);
  
  // Super admin can do everything
  if (userRole === 'super_admin') {
    return true;
  }
  
  // Check for specific schedule permissions
  const schedulePermissions = [
    'manage_all_schedules',
    'manage_org_schedules', 
    'manage_dept_schedules',
    'view_own_schedule'
  ];
  
  for (const permission of schedulePermissions) {
    if (checkPermission(user, permission, action, targetUser)) {
      return true;
    }
  }
  
  return false;
};

// Helper to get schedule access level for a user
export const getScheduleAccessLevel = (user: AuthUser | EnhancedUser): 'all' | 'organization' | 'department' | 'own' | 'none' => {
  const userRole = getUserRole(user);
  
  switch (userRole) {
    case 'super_admin':
      return 'all';
    case 'org_admin':
      return 'organization';
    case 'manager':
      return 'department';
    case 'employee':
      return 'own';
    default:
      return 'none';
  }
};
