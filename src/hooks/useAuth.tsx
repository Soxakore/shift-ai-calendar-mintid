import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, authStorage } from '@/lib/storage';

interface WorkerAccount {
  username: string;
  password: string;
  name: string;
  email: string;
  id: string;
  role: string;
  organizationId?: string;
  departmentId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  workerLogin: (username: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: 'admin' | 'manager') => boolean;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user accounts for testing
const demoAccounts: WorkerAccount[] = [
  {
    id: '1',
    username: 'super.admin',
    password: 'admin123',
    name: 'Super Administrator',
    email: 'super@company.com',
    role: 'super_admin'
  },
  {
    id: '2',
    username: 'mc.admin',
    password: 'admin123',
    name: 'McDonald\'s Admin',
    email: 'admin@mcdonalds.com',
    role: 'org_admin',
    organizationId: 'mcdonalds'
  },
  {
    id: '3',
    username: 'kitchen.manager',
    password: 'manager123',
    name: 'Kitchen Manager',
    email: 'manager@mcdonalds.com',
    role: 'manager',
    organizationId: 'mcdonalds',
    departmentId: 'kitchen'
  },
  {
    id: '4',
    username: 'mary.cook',
    password: 'cook123',
    name: 'Mary Cook',
    email: 'mary@mcdonalds.com',
    role: 'employee',
    organizationId: 'mcdonalds',
    departmentId: 'kitchen'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = authStorage.get();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  // Standard email/password login (deprecated - for compatibility only)
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // For demo purposes, accept admin@demo.com / admin123
      if (email === 'admin@demo.com' && password === 'admin123') {
        const adminUser: AuthUser = {
          id: 'demo-admin',
          name: 'Demo Admin',
          username: 'admin',
          email: email,
          role: 'admin'
        };
        setUser(adminUser);
        authStorage.set(adminUser);
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

  // Admin login using simple credentials
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simple admin authentication
      if (email === 'admin@demo.com' && password === 'admin123') {
        const adminUser: AuthUser = {
          id: 'admin-1',
          name: 'System Administrator',
          username: 'admin',
          email: email,
          role: 'admin'
        };
        setUser(adminUser);
        authStorage.set(adminUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Worker login using demo accounts
  const workerLogin = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const account = demoAccounts.find(
        acc => acc.username === username && acc.password === password
      );

      if (account) {
        const authUser: AuthUser = {
          id: account.id,
          name: account.name,
          username: account.username,
          email: account.email,
          role: account.role as 'super_admin' | 'org_admin' | 'manager' | 'employee',
          organizationId: account.organizationId,
          departmentId: account.departmentId
        };
        
        setUser(authUser);
        authStorage.set(authUser);
        
        // Store account in localStorage for persistence
        const existingAccounts = JSON.parse(localStorage.getItem('workerAccounts') || '[]');
        const accountExists = existingAccounts.find((acc: WorkerAccount) => acc.id === account.id);
        if (!accountExists) {
          existingAccounts.push(account);
          localStorage.setItem('workerAccounts', JSON.stringify(existingAccounts));
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Worker login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Registration (for demo purposes)
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Create a simple registered user
      const newUser: AuthUser = {
        id: `user-${Date.now()}`,
        name: name,
        username: email.split('@')[0],
        email: email,
        role: 'employee'
      };
      
      setUser(newUser);
      authStorage.set(newUser);
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
      authStorage.clear();
      localStorage.removeItem('workerAccounts');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasRole = (role: 'admin' | 'manager'): boolean => {
    if (!user) return false;
    
    if (role === 'admin') {
      return ['admin', 'super_admin', 'org_admin'].includes(user.role);
    }
    
    if (role === 'manager') {
      return ['admin', 'super_admin', 'org_admin', 'manager'].includes(user.role);
    }
    
    return false;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        login, 
        adminLogin,
        workerLogin, 
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
