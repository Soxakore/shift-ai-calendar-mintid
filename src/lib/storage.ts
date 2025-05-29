// Local storage utilities for data persistence
export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  type?: 'Day' | 'Night' | 'Overtime';
  description?: string;
  userId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'Active' | 'Inactive';
  language: string;
  password?: string; // In production, this should be hashed
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'super_admin' | 'org_admin' | 'manager' | 'employee' | 'admin' | 'user';
  organizationId?: string;
  departmentId?: string;
}

// Local Storage Keys
const STORAGE_KEYS = {
  SHIFTS: 'mintid_shifts',
  TASKS: 'mintid_tasks',
  USERS: 'mintid_users',
  AUTH_USER: 'mintid_auth_user',
  SETTINGS: 'mintid_settings'
};

// Shifts Management
export const shiftsStorage = {
  get: (): Shift[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    return data ? JSON.parse(data) : [];
  },
  
  set: (shifts: Shift[]) => {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  },
  
  add: (shift: Omit<Shift, 'id'>) => {
    const shifts = shiftsStorage.get();
    const newShift: Shift = {
      ...shift,
      id: Date.now().toString()
    };
    shifts.push(newShift);
    shiftsStorage.set(shifts);
    return newShift;
  },
  
  update: (id: string, updates: Partial<Shift>) => {
    const shifts = shiftsStorage.get();
    const index = shifts.findIndex(s => s.id === id);
    if (index !== -1) {
      shifts[index] = { ...shifts[index], ...updates };
      shiftsStorage.set(shifts);
      return shifts[index];
    }
    return null;
  },
  
  delete: (id: string) => {
    const shifts = shiftsStorage.get();
    const filtered = shifts.filter(s => s.id !== id);
    shiftsStorage.set(filtered);
  }
};

// Tasks Management
export const tasksStorage = {
  get: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },
  
  set: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },
  
  add: (task: Omit<Task, 'id' | 'createdAt'>) => {
    const tasks = tasksStorage.get();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    tasksStorage.set(tasks);
    return newTask;
  },
  
  update: (id: string, updates: Partial<Task>) => {
    const tasks = tasksStorage.get();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      tasksStorage.set(tasks);
      return tasks[index];
    }
    return null;
  },
  
  delete: (id: string) => {
    const tasks = tasksStorage.get();
    const filtered = tasks.filter(t => t.id !== id);
    tasksStorage.set(filtered);
  }
};

// Users Management
export const usersStorage = {
  get: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (data) {
      return JSON.parse(data);
    }
    
    // Initialize with default admin user if no users exist
    const defaultUsers: User[] = [
      {
        id: '1',
        name: 'Admin User',
        username: 'admin',
        email: 'admin@mintid.com',
        role: 'admin',
        status: 'Active',
        language: 'English',
        password: 'admin123' // In production, this should be hashed
      }
    ];
    usersStorage.set(defaultUsers);
    return defaultUsers;
  },
  
  set: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  
  add: (user: Omit<User, 'id'>) => {
    const users = usersStorage.get();
    const newUser: User = {
      ...user,
      id: Date.now().toString()
    };
    users.push(newUser);
    usersStorage.set(users);
    return newUser;
  },
  
  update: (id: string, updates: Partial<User>) => {
    const users = usersStorage.get();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      usersStorage.set(users);
      return users[index];
    }
    return null;
  },
  
  delete: (id: string) => {
    const users = usersStorage.get();
    const filtered = users.filter(u => u.id !== id);
    usersStorage.set(filtered);
  },
  
  findByCredentials: (username: string, password: string): User | null => {
    const users = usersStorage.get();
    return users.find(u => u.username === username && u.password === password) || null;
  }
};

// Authentication Management
export const authStorage = {
  get: (): AuthUser | null => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return data ? JSON.parse(data) : null;
  },
  
  set: (user: AuthUser) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  },
  
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },
  
  isAuthenticated: (): boolean => {
    return authStorage.get() !== null;
  },
  
  hasRole: (role: 'admin' | 'manager'): boolean => {
    const user = authStorage.get();
    return user ? (user.role === role || user.role === 'admin') : false;
  }
};

// Initialize storage with sample data if empty
export const initializeStorage = () => {
  // Initialize shifts with sample data
  if (shiftsStorage.get().length === 0) {
    const sampleShifts: Shift[] = [
      {
        id: '1',
        date: '2025-05-29',
        startTime: '08:00',
        endTime: '16:00',
        hours: 8,
        type: 'Day',
        description: 'Regular day shift'
      },
      {
        id: '2',
        date: '2025-05-30',
        startTime: '20:00',
        endTime: '06:00',
        hours: 10,
        type: 'Night',
        description: 'Night shift'
      }
    ];
    shiftsStorage.set(sampleShifts);
  }
  
  // Initialize tasks with sample data
  if (tasksStorage.get().length === 0) {
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Review weekly schedules',
        description: 'Check and approve all staff schedules for next week',
        dueDate: '2025-06-02',
        status: 'pending',
        priority: 'high',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Update employee records',
        description: 'Update contact information for new employees',
        dueDate: '2025-06-05',
        status: 'in-progress',
        priority: 'medium',
        createdAt: new Date().toISOString()
      }
    ];
    tasksStorage.set(sampleTasks);
  }
  
  // Initialize users (this will create default admin if none exist)
  usersStorage.get();
};

// Convenient wrapper functions for easier component integration
export const getShifts = () => shiftsStorage.get();
export const addShift = (shift: Omit<Shift, 'id'>) => shiftsStorage.add(shift);
export const updateShift = (id: string, updates: Partial<Shift>) => shiftsStorage.update(id, updates);
export const deleteShift = (id: string) => shiftsStorage.delete(id);

export const getTasks = () => tasksStorage.get();
export const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => tasksStorage.add(task);
export const updateTask = (id: string, updates: Partial<Task>) => tasksStorage.update(id, updates);
export const deleteTask = (id: string) => tasksStorage.delete(id);

export const getUsers = () => usersStorage.get();
export const addUser = (user: Omit<User, 'id'>) => usersStorage.add(user);
export const updateUser = (id: string, updates: Partial<User>) => usersStorage.update(id, updates);
export const deleteUser = (id: string) => usersStorage.delete(id);

export const getCurrentUser = () => authStorage.get();
export const setCurrentUser = (user: AuthUser) => authStorage.set(user);
export const clearCurrentUser = () => authStorage.clear();
export const isAuthenticated = () => authStorage.isAuthenticated();
export const hasRole = (role: 'admin' | 'manager') => authStorage.hasRole(role);
