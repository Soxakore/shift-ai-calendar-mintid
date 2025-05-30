
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'super_admin' | 'org_admin' | 'manager' | 'employee';
  organizationId?: string;
  departmentId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts for testing
const demoAccounts = [
  {
    id: '1',
    email: 'employee@company.com',
    password: 'demo123',
    name: 'John Employee',
    username: 'john.employee',
    role: 'employee' as const,
    organizationId: 'company1',
    departmentId: 'kitchen'
  },
  {
    id: '2',
    email: 'manager@company.com',
    password: 'demo123',
    name: 'Sarah Manager',
    username: 'sarah.manager',
    role: 'manager' as const,
    organizationId: 'company1',
    departmentId: 'kitchen'
  },
  {
    id: '3',
    email: 'admin@company.com',
    password: 'demo123',
    name: 'Mike Admin',
    username: 'mike.admin',
    role: 'org_admin' as const,
    organizationId: 'company1'
  },
  {
    id: '4',
    email: 'super@company.com',
    password: 'demo123',
    name: 'Alice Super Admin',
    username: 'alice.super',
    role: 'super_admin' as const
  },
  {
    id: '5',
    email: 'demo@company.com',
    password: 'demo123',
    name: 'Demo User',
    username: 'demo.user',
    role: 'employee' as const,
    organizationId: 'company1'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('mintid_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('mintid_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Check demo accounts
      const account = demoAccounts.find(
        acc => acc.email === email && acc.password === password
      );

      if (account) {
        const authUser: AuthUser = {
          id: account.id,
          name: account.name,
          username: account.username,
          email: account.email,
          role: account.role,
          organizationId: account.organizationId,
          departmentId: account.departmentId
        };
        
        setUser(authUser);
        localStorage.setItem('mintid_user', JSON.stringify(authUser));
        return true;
      }

      // Check registered users
      const registeredUsers = JSON.parse(localStorage.getItem('mintid_registered_users') || '[]');
      const registeredUser = registeredUsers.find(
        (u: any) => u.email === email && u.password === password
      );

      if (registeredUser) {
        const authUser: AuthUser = {
          id: registeredUser.id,
          name: registeredUser.name,
          username: registeredUser.username,
          email: registeredUser.email,
          role: registeredUser.role || 'employee',
          organizationId: registeredUser.organizationId,
          departmentId: registeredUser.departmentId
        };
        
        setUser(authUser);
        localStorage.setItem('mintid_user', JSON.stringify(authUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('mintid_registered_users') || '[]');
      if (existingUsers.find((u: any) => u.email === email)) {
        return false;
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        name,
        username: email.split('@')[0],
        role: 'employee',
        organizationId: 'company1',
        createdAt: new Date().toISOString()
      };

      existingUsers.push(newUser);
      localStorage.setItem('mintid_registered_users', JSON.stringify(existingUsers));

      // Auto-login after registration
      const authUser: AuthUser = {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: 'employee',
        organizationId: newUser.organizationId
      };
      
      setUser(authUser);
      localStorage.setItem('mintid_user', JSON.stringify(authUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setUser(null);
      localStorage.removeItem('mintid_user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    
    // Super admin has access to everything
    if (user.role === 'super_admin') return true;
    
    // Check specific roles
    if (roles.includes('admin')) {
      return ['org_admin', 'super_admin'].includes(user.role);
    }
    
    if (roles.includes('manager')) {
      return ['org_admin', 'super_admin', 'manager'].includes(user.role);
    }
    
    return roles.includes(user.role);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        login, 
        register, 
        logout, 
        hasRole, 
        loading,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
