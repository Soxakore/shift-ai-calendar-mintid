
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
  metadata?: Record<string, string | number | boolean | null>;
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


