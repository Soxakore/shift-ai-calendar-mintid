// Role-based permission definitions
export interface Permission {
  id: string;
  name: string;
  category: 'users' | 'departments' | 'reports' | 'settings' | 'organization';
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage_all')[];
  scope: 'own_department' | 'own_organization' | 'all_organizations';
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
    }
  ],

  // Organization Admin - Can manage their entire organization
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
    }
  ],

  // Department Manager - Can only manage their department
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

  // Employee - Can only view their own data
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
export const demoUsersWithRoles: EnhancedUser[] = [
  // Super Admin (You)
  {
    id: 'super_1',
    organizationId: 'system',
    departmentId: 'admin',
    roleId: 'super_admin',
    username: 'super.admin',
    displayName: 'System Administrator (You)',
    email: 'admin@workflow.com',
    password: 'admin123',
    isActive: true,
    createdBy: 'system',
    userType: 'super_admin'
  },

  // McDonald's Organization Admin
  {
    id: 'mc_admin',
    organizationId: '1', // McDonald's
    departmentId: '3',   // Management
    roleId: 'org_admin',
    username: 'mc.admin',
    displayName: 'McDonald\'s Admin',
    email: 'admin@mcdonalds.com',
    password: 'mcadmin123',
    isActive: true,
    createdBy: 'super_1',
    userType: 'org_admin'
  },

  // McDonald's Kitchen Manager (Department Manager)
  {
    id: 'mc_kitchen_mgr',
    organizationId: '1', // McDonald's
    departmentId: '1',   // Kitchen
    roleId: 'manager',
    username: 'kitchen.manager',
    displayName: 'John - Kitchen Manager',
    email: 'john@mcdonalds.com',
    password: 'manager123',
    isActive: true,
    createdBy: 'mc_admin',
    userType: 'manager'
  },

  // McDonald's Kitchen Employee
  {
    id: 'mc_cook1',
    organizationId: '1', // McDonald's
    departmentId: '1',   // Kitchen
    roleId: 'employee',
    username: 'mary.cook',
    displayName: 'Mary - Cook',
    password: 'worker123',
    isActive: true,
    createdBy: 'mc_kitchen_mgr', // Created by kitchen manager
    userType: 'employee'
  },

  // Starbucks Manager (Different organization)
  {
    id: 'sb_manager',
    organizationId: '2', // Starbucks
    departmentId: '4',   // Baristas
    roleId: 'manager', 
    username: 'starbucks.manager',
    displayName: 'Sarah - Store Manager',
    password: 'sbmanager123',
    isActive: true,
    createdBy: 'super_1',
    userType: 'manager'
  }
];

// Permission checking utility
export const checkPermission = (
  user: EnhancedUser,
  requiredPermission: string,
  action: string,
  targetUser?: EnhancedUser
): boolean => {
  const userPermissions = rolePermissions[user.userType] || [];
  
  for (const permission of userPermissions) {
    if (permission.id === requiredPermission && permission.actions.includes(action as any)) {
      // Check scope
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

// UI visibility rules
export const getUIPermissions = (user: EnhancedUser) => {
  const permissions = rolePermissions[user.userType] || [];
  
  return {
    // Navigation items
    canViewOrganizations: user.userType === 'super_admin',
    canViewAllUsers: user.userType === 'super_admin',
    canViewOrgUsers: ['super_admin', 'org_admin'].includes(user.userType),
    canViewDeptUsers: ['super_admin', 'org_admin', 'manager'].includes(user.userType),
    canViewReports: permissions.some(p => p.category === 'reports'),
    canViewSettings: ['super_admin', 'org_admin'].includes(user.userType),
    
    // User management
    canCreateUsers: permissions.some(p => p.id.includes('users') && p.actions.includes('create')),
    canEditUsers: permissions.some(p => p.id.includes('users') && p.actions.includes('update')),
    canDeleteUsers: permissions.some(p => p.id.includes('users') && p.actions.includes('delete')),
    
    // Data scope
    dataScope: user.userType === 'super_admin' ? 'all' :
               user.userType === 'org_admin' ? 'organization' : 
               user.userType === 'manager' ? 'department' : 'self'
  };
};
