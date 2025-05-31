
import { lazy } from 'react';

// Lazy load dashboard components with consistent naming
export const LazyEmployeeDashboard = lazy(() => import('@/pages/EmployeeDashboard'));
export const LazyManagerDashboard = lazy(() => import('@/pages/ManagerDashboard'));
export const LazyOrgAdminDashboard = lazy(() => import('@/pages/OrgAdminDashboard'));
export const LazySuperAdminDashboard = lazy(() => import('@/pages/SuperAdminDashboard'));

// Lazy load admin components
export const LazyAISettings = lazy(() => import('@/components/admin/AISettings'));
export const LazyOrganizationManagement = lazy(() => import('@/components/admin/OrganizationManagement'));
export const LazySystemSettings = lazy(() => import('@/components/admin/SystemSettings'));
export const LazyUsersManagement = lazy(() => import('@/components/admin/UsersManagement'));
export const LazyAdminReportsManagement = lazy(() => import('@/components/admin/ReportsManagement'));

// Lazy load heavy components
export const LazyReportsManagement = lazy(() => import('@/components/ReportsManagement'));
export const LazyScheduleCalendar = lazy(() => import('@/components/ScheduleCalendar'));
export const LazyTaskManagement = lazy(() => import('@/components/TaskManagement'));
export const LazyHoursWorkedChart = lazy(() => import('@/components/HoursWorkedChart'));

// New Super Admin pages
export const LazySuperAdminUsersPage = lazy(() => import('@/pages/SuperAdminUsersPage'));
export const LazySuperAdminOrganizationsPage = lazy(() => import('@/pages/SuperAdminOrganizationsPage'));
export const LazyCreateUserPage = lazy(() => import('@/pages/CreateUserPage'));
