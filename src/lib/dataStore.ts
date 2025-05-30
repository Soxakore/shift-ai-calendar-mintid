// Centralized data store for real-time updates across the application
import { EnhancedUser, Organization, Department, Role } from '@/types/organization';

export interface ScheduleEntry {
  id: string;
  userId: string;
  organizationId: string;
  departmentId: string;
  date: string;
  startTime: string;
  endTime: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'scheduled' | 'checked-in' | 'checked-out' | 'absent' | 'sick';
}

export interface SickNotice {
  id: string;
  userId: string;
  organizationId: string;
  departmentId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  organizationId: string;
  departmentId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  method: 'qr' | 'manual' | 'schedule';
  location?: string;
}

export interface QRCode {
  id: string;
  organizationId: string;
  departmentId?: string;
  code: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt: string;
}

class DataStore {
  private users: EnhancedUser[] = [];
  private organizations: Organization[] = [];
  private departments: Department[] = [];
  private roles: Role[] = [];
  private schedules: ScheduleEntry[] = [];
  private sickNotices: SickNotice[] = [];
  private timeLogs: TimeLog[] = [];
  private qrCodes: QRCode[] = [];
  private listeners: { [key: string]: Function[] } = {};

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // Load from localStorage or use demo data
    const savedData = localStorage.getItem('mintid_app_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.users = data.users || [];
      this.organizations = data.organizations || [];
      this.departments = data.departments || [];
      this.roles = data.roles || [];
      this.schedules = data.schedules || [];
      this.sickNotices = data.sickNotices || [];
      this.timeLogs = data.timeLogs || [];
      this.qrCodes = data.qrCodes || [];
    } else {
      this.initializeDemoData();
    }
  }

  private saveData() {
    const data = {
      users: this.users,
      organizations: this.organizations,
      departments: this.departments,
      roles: this.roles,
      schedules: this.schedules,
      sickNotices: this.sickNotices,
      timeLogs: this.timeLogs,
      qrCodes: this.qrCodes
    };
    localStorage.setItem('mintid_app_data', JSON.stringify(data));
    this.notifyListeners('data_updated');
  }

  private initializeDemoData() {
    // Initialize with demo data and generate sample schedules, QR codes, etc.
    this.generateSampleSchedules();
    this.generateSampleQRCodes();
    this.saveData();
  }

  private generateSampleSchedules() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.schedules = [
      {
        id: '1',
        userId: '1',
        organizationId: '1',
        departmentId: '1',
        date: today.toISOString().split('T')[0],
        startTime: '06:00',
        endTime: '14:00',
        shift: 'morning',
        status: 'checked-in'
      },
      {
        id: '2',
        userId: '2',
        organizationId: '1',
        departmentId: '1',
        date: today.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '22:00',
        shift: 'afternoon',
        status: 'scheduled'
      }
    ];
  }

  private generateSampleQRCodes() {
    this.qrCodes = [
      {
        id: '1',
        organizationId: '1',
        departmentId: '1',
        code: 'QR_MC_KITCHEN_001',
        name: 'Kitchen Entrance',
        location: 'Kitchen Department - Main Entrance',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        organizationId: '1',
        departmentId: '2',
        code: 'QR_MC_COUNTER_001',
        name: 'Front Counter',
        location: 'Front Counter - Staff Area',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Event listener system for real-time updates
  subscribe(event: string, callback: Function): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    };
  }

  unsubscribe(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private notifyListeners(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // User management methods
  addUser(user: Omit<EnhancedUser, 'id' | 'createdAt'>): EnhancedUser {
    const newUser: EnhancedUser = {
      ...user,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.saveData();
    this.notifyListeners('user_added', newUser);
    return newUser;
  }

  updateUser(userId: string, updates: Partial<EnhancedUser>): boolean {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      this.saveData();
      this.notifyListeners('user_updated', this.users[userIndex]);
      return true;
    }
    return false;
  }

  promoteUser(userId: string, newUserType: EnhancedUser['userType'], newRoleId: string): boolean {
    return this.updateUser(userId, { userType: newUserType, roleId: newRoleId });
  }

  // Department management
  addDepartment(department: Omit<Department, 'id' | 'createdAt'>): Department {
    const newDepartment: Department = {
      ...department,
      id: `dept_${Date.now()}`,
      createdAt: new Date()
    };
    this.departments.push(newDepartment);
    this.saveData();
    this.notifyListeners('department_added', newDepartment);
    return newDepartment;
  }

  // Schedule management
  addScheduleFromImage(scheduleData: Omit<ScheduleEntry, 'id'>[]): ScheduleEntry[] {
    const newSchedules = scheduleData.map(schedule => ({
      ...schedule,
      id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    this.schedules.push(...newSchedules);
    this.saveData();
    this.notifyListeners('schedules_added', newSchedules);
    return newSchedules;
  }

  // Sick notice management
  submitSickNotice(notice: Omit<SickNotice, 'id' | 'submittedAt' | 'status'>): SickNotice {
    const newNotice: SickNotice = {
      ...notice,
      id: `sick_${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    this.sickNotices.push(newNotice);
    this.saveData();
    this.notifyListeners('sick_notice_submitted', newNotice);
    return newNotice;
  }

  approveSickNotice(noticeId: string, reviewedBy: string): boolean {
    const notice = this.sickNotices.find(n => n.id === noticeId);
    if (notice) {
      notice.status = 'approved';
      notice.reviewedBy = reviewedBy;
      notice.reviewedAt = new Date().toISOString();
      this.saveData();
      this.notifyListeners('sick_notice_approved', notice);
      return true;
    }
    return false;
  }

  // QR Code time logging
  scanQRCode(qrCode: string, userId: string): TimeLog | null {
    const qr = this.qrCodes.find(q => q.code === qrCode && q.isActive);
    if (!qr) return null;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    let existingLog = this.timeLogs.find(log => 
      log.userId === userId && 
      log.date === today && 
      log.organizationId === qr.organizationId
    );

    if (!existingLog) {
      // Clock in
      existingLog = {
        id: `timelog_${Date.now()}`,
        userId,
        organizationId: qr.organizationId,
        departmentId: qr.departmentId || '',
        date: today,
        clockIn: now,
        method: 'qr',
        location: qr.location
      };
      this.timeLogs.push(existingLog);
    } else if (!existingLog.clockOut) {
      // Clock out
      existingLog.clockOut = now;
    }

    this.saveData();
    this.notifyListeners('time_logged', existingLog);
    return existingLog;
  }

  // Getter methods
  getUsers(organizationId?: string, departmentId?: string): EnhancedUser[] {
    let filteredUsers = this.users;
    if (organizationId) {
      filteredUsers = filteredUsers.filter(u => u.organizationId === organizationId);
    }
    if (departmentId) {
      filteredUsers = filteredUsers.filter(u => u.departmentId === departmentId);
    }
    return filteredUsers;
  }

  getDepartments(organizationId?: string): Department[] {
    return organizationId 
      ? this.departments.filter(d => d.organizationId === organizationId)
      : this.departments;
  }

  getSchedules(organizationId?: string, date?: string): ScheduleEntry[] {
    let filtered = this.schedules;
    if (organizationId) {
      filtered = filtered.filter(s => s.organizationId === organizationId);
    }
    if (date) {
      filtered = filtered.filter(s => s.date === date);
    }
    return filtered;
  }

  getSickNotices(organizationId?: string, status?: SickNotice['status']): SickNotice[] {
    let filtered = this.sickNotices;
    if (organizationId) {
      filtered = filtered.filter(n => n.organizationId === organizationId);
    }
    if (status) {
      filtered = filtered.filter(n => n.status === status);
    }
    return filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  getQRCodes(organizationId?: string): QRCode[] {
    return organizationId 
      ? this.qrCodes.filter(q => q.organizationId === organizationId)
      : this.qrCodes;
  }

  getTimeLogs(userId?: string, organizationId?: string, date?: string): TimeLog[] {
    let filtered = this.timeLogs;
    if (userId) {
      filtered = filtered.filter(log => log.userId === userId);
    }
    if (organizationId) {
      filtered = filtered.filter(log => log.organizationId === organizationId);
    }
    if (date) {
      filtered = filtered.filter(log => log.date === date);
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Get today's data for real-time dashboard
  getTodaysData(organizationId: string) {
    const today = new Date().toISOString().split('T')[0];
    const schedules = this.getSchedules(organizationId, today);
    const timeLogs = this.getTimeLogs(undefined, organizationId, today);
    const users = this.getUsers(organizationId);
    
    return {
      schedules,
      timeLogs,
      users,
      totalEmployees: users.length,
      activeToday: timeLogs.filter(log => log.clockIn).length,
      onTime: timeLogs.filter(log => log.clockIn && log.clockOut).length
    };
  }
}

export const dataStore = new DataStore();
export default dataStore;
