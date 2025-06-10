
// Role-based permission definitions
import { EnhancedUser } from './organisation';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage_all';

export interface Permission {
  id: string;
  name: string;
  category: 'users' | 'departments' | 'reports' | 'settings' | 'organisation';
  actions: PermissionAction[];
  scope: 'own_department' | 'own_organisation' | 'all_organisations';
}

// AuthUser interface for the authentication system
export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: 'super_admin' | 'org_admin' | 'manager' | 'employee';
  organisationId?: string;
  departmentId?: string;
}

// Permission sets for different roles
export const rolePermissions: Record<string, Permission[]> = {
  // Super Admin - You (access to everything)
  super_admin: [
    {
      id: 'manage_organisations',
      name: 'Manage Organisations',
      category: 'organisation',
      actions: ['create', 'read', 'update', 'delete', 'manage_all'],
      scope: 'all_organisations'
    },
    {
      id: 'manage_all_users',
      name: 'Manage All Users',
      category: 'users',
      actions: ['create', 'read', 'update', 'delete', 'manage_all'],
      scope: 'all_organisations'
    },
    {
      id: 'manage_all_departments',
      name: 'Manage All Departments',
      category: 'departments',
      actions: ['create', 'read', 'update', 'delete', 'manage_all'],
      scope: 'all_organisations'
    },
    {
      id: 'view_all_reports',
      name: 'View All Reports',
      category: 'reports',
      actions: ['read', 'manage_all'],
      scope: 'all_organisations'
    }
  ],

  org_admin: [
    {
      id: 'manage_org_users',
      name: 'Manage Organization Users',
      category: 'users',
      actions: ['create', 'read', 'update', 'delete'],
      scope: 'own_organisation'
    },
    {
      id: 'manage_org_departments',
      name: 'Manage Organization Departments',
      category: 'departments',
      actions: ['create', 'read', 'update', 'delete'],
      scope: 'own_organisation'
    },
    {
      id: 'view_org_reports',
      name: 'View Organization Reports',
      category: 'reports',
      actions: ['read'],
      scope: 'own_organisation'
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
    }
  ],

  employee: [
    {
      id: 'view_own_data',
      name: 'View Own Data',
      category: 'users',
      actions: ['read'],
      scope: 'own_department'
    }
  ]
};

// Enhanced demo users with specific roles
export const demoUsersWithRoles: (EnhancedUser & { role: 'super_admin' | 'org_admin' | 'manager' | 'employee' })[] = [
  // Super Admin (You)
  {
    id: 'super_1',
    organisationId: 'system',
    departmentId: 'admin',
    roleId: 'super_admin',
    role: 'super_admin',
    username: 'super.admin',
    displayName: 'System Administrator (You)',
    email: 'admin@workflow.com',
    password: 'admin123',
    isActive: true,
    createdBy: 'system',
    userType: 'super_admin',
    createdAt: new Date().toISOString()
  },

  {
    id: 'mc_admin',
    organisationId: '1',
    departmentId: '3',
    roleId: 'org_admin',
    role: 'org_admin',
    username: 'mc.admin',
    displayName: 'McDonald\'s Admin',
    email: 'admin@mcdonalds.com',
    password: 'mcadmin123',
    isActive: true,
    createdBy: 'super_1',
    userType: 'org_admin',
    createdAt: new Date().toISOString()
  },

  {
    id: 'mc_kitchen_mgr',
    organisationId: '1',
    departmentId: '1',
    roleId: 'manager',
    role: 'manager',
    username: 'kitchen.manager',
    displayName: 'John - Kitchen Manager',
    email: 'john@mcdonalds.com',
    password: 'manager123',
    isActive: true,
    createdBy: 'mc_admin',
    userType: 'manager',
    createdAt: new Date().toISOString()
  },

  {
    id: 'mc_cook1',
    organisationId: '1',
    departmentId: '1',
    roleId: 'employee',
    role: 'employee',
    username: 'mary.cook',
    displayName: 'Mary - Cook',
    password: 'worker123',
    isActive: true,
    createdBy: 'mc_kitchen_mgr',
    userType: 'employee',
    createdAt: new Date().toISOString()
  },

  {
    id: 'sb_manager',
    organisationId: '2',
    departmentId: '4',
    roleId: 'manager',
    role: 'manager',
    username: 'starbucks.manager',
    displayName: 'Sarah - Store Manager',
    password: 'sbmanager123',
    isActive: true,
    createdBy: 'super_1',
    userType: 'manager',
    createdAt: new Date().toISOString()
  }
];

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
        case 'all_organisations':
          return true;
        case 'own_organisation':
          return !targetUser || user.organisationId === targetUser.organisationId;
        case 'own_department':
          return !targetUser || (
            user.organisationId === targetUser.organisationId &&
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
    
    // Organization management
    canManageOrganizations: userRole === 'super_admin',
    canAccessSystemSettings: userRole === 'super_admin',
    
    // Data scope
    dataScope: userRole === 'super_admin' ? 'all' :
               userRole === 'org_admin' ? 'organisation' : 
               userRole === 'manager' ? 'department' : 'self'
  };
};
