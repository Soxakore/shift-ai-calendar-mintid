
// Enhanced data types for organizational hierarchy
export interface Organization {
  id: string;
  name: string; // "McDonald's", "Starbucks", etc.
  slug: string; // "mcdonalds", "starbucks"
  logo?: string;
  settings: {
    maxUsers: number;
    features: string[];
    theme?: string;
  };
  createdAt: Date;
  adminEmail: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string; // "Kitchen", "Front Counter", "Management"
  description?: string;
  color?: string;
  createdAt: Date;
}

export interface Role {
  id: string;
  organizationId: string;
  departmentId: string;
  name: string; // "Manager", "Supervisor", "Employee"
  permissions: Permission[];
  level: number; // 1=Employee, 2=Supervisor, 3=Manager, 4=Admin
  createdAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  category: 'tasks' | 'users' | 'reports' | 'settings' | 'schedule';
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
}

export interface EnhancedUser {
  id: string;
  organizationId: string; // Tenant isolation key
  departmentId: string;
  roleId: string;
  username: string;
  displayName: string;
  email?: string;
  password: string; // Hashed
  isActive: boolean;
  createdBy: string; // Admin who created this user
  createdAt: string; // Add this missing property
  lastLogin?: Date;
  profileImage?: string;
  phoneNumber?: string;
  hireDate?: Date;
  metadata?: Record<string, any>;
  userType: 'super_admin' | 'org_admin' | 'manager' | 'employee';
}

export interface AuthContextEnhanced {
  // Current authentication
  user: EnhancedUser | null;
  isAuthenticated: boolean;
  userType: 'super_admin' | 'org_admin' | 'manager' | 'employee';
  
  // Organization context
  currentOrganization: Organization | null;
  currentDepartment: Department | null;
  currentRole: Role | null;
  permissions: Permission[];
  
  // Methods
  login: (username: string, password: string, orgSlug?: string) => Promise<boolean>;
  logout: () => void;
  switchOrganization: (orgSlug: string) => Promise<boolean>;
  hasPermission: (permission: string, action: string) => boolean;
}

// Demo data for development
export const demoOrganizations: Organization[] = [
  {
    id: '1',
    name: "McDonald's",
    slug: 'mcdonalds',
    settings: { maxUsers: 100, features: ['scheduling', 'reports', 'tasks'] },
    createdAt: new Date(),
    adminEmail: 'admin@mcdonalds.com',
    isActive: true,
  },
  {
    id: '2', 
    name: 'Starbucks',
    slug: 'starbucks',
    settings: { maxUsers: 50, features: ['scheduling', 'reports'] },
    createdAt: new Date(),
    adminEmail: 'admin@starbucks.com',
    isActive: true,
  }
];

export const demoDepartments: Department[] = [
  { id: '1', organizationId: '1', name: 'Kitchen', description: 'Food preparation area', color: '#ff6b35', createdAt: new Date() },
  { id: '2', organizationId: '1', name: 'Front Counter', description: 'Customer service', color: '#f7931e', createdAt: new Date() },
  { id: '3', organizationId: '1', name: 'Management', description: 'Store management', color: '#27ae60', createdAt: new Date() },
  { id: '4', organizationId: '2', name: 'Baristas', description: 'Coffee preparation', color: '#00704a', createdAt: new Date() },
  { id: '5', organizationId: '2', name: 'Shift Supervisors', description: 'Floor supervision', color: '#d4af37', createdAt: new Date() },
];

export const demoRoles: Role[] = [
  {
    id: '1',
    organizationId: '1',
    departmentId: '1',
    name: 'Kitchen Manager',
    permissions: [],
    level: 3,
    createdAt: new Date(),
  },
  {
    id: '2',
    organizationId: '1', 
    departmentId: '1',
    name: 'Cook',
    permissions: [],
    level: 1,
    createdAt: new Date(),
  },
  {
    id: '3',
    organizationId: '1',
    departmentId: '2', 
    name: 'Cashier',
    permissions: [],
    level: 1,
    createdAt: new Date(),
  },
];

export const demoUsersEnhanced: EnhancedUser[] = [
  {
    id: '1',
    organizationId: '1', // McDonald's
    departmentId: '1',   // Kitchen
    roleId: '1',         // Kitchen Manager
    username: 'john.manager',
    displayName: 'John Smith',
    email: 'john@mcdonalds-demo.com',
    password: 'manager123',
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    lastLogin: new Date(),
    userType: 'manager',
  },
  {
    id: '2',
    organizationId: '1', // McDonald's
    departmentId: '1',   // Kitchen 
    roleId: '2',         // Cook
    username: 'mary.cook',
    displayName: 'Mary Johnson',
    password: 'worker123',
    isActive: true,
    createdBy: 'john.manager',
    createdAt: new Date().toISOString(),
    userType: 'employee',
  },
  {
    id: '3',
    organizationId: '2', // Starbucks
    departmentId: '4',   // Baristas
    roleId: '4',         // Barista
    username: 'sarah.barista',
    displayName: 'Sarah Wilson',
    password: 'coffee123',
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    userType: 'employee',
  },
];
