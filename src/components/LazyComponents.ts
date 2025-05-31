import { lazy } from 'react';

// Existing components
export const LoginPage = lazy(() => import('@/pages/Login'));
export const EmployeeDashboard = lazy(() => import('@/pages/EmployeeDashboard'));
export const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
export const SuperAdminDashboard = lazy(() => import('@/pages/SuperAdminDashboard'));
export const OrgAdminDashboard = lazy(() => import('@/pages/OrgAdminDashboard'));
export const OrganizationManagement = lazy(() => import('@/components/admin/OrganizationManagement'));
export const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
export const SEODashboard = lazy(() => import('@/components/SEODashboard'));

// New Super Admin components
export const SuperAdminOrganizationsPage = lazy(() => import('@/pages/SuperAdminOrganizationsPage'));
export const SuperAdminUsersPage = lazy(() => import('@/pages/SuperAdminUsersPage'));
export const CreateManagerPage = lazy(() => import('@/pages/CreateManagerPage'));

// Legacy exports for backward compatibility
export const LazyUsersManagement = lazy(() => import('@/components/admin/UsersManagement'));
export const LazyAISettings = lazy(() => import('@/components/admin/AISettings'));
export const LazySystemSettings = lazy(() => import('@/components/admin/SystemSettings'));
export const LazyOrganizationManagement = lazy(() => import('@/components/admin/OrganizationManagement'));
export const LazyAdminReportsManagement = lazy(() => import('@/components/admin/ReportsManagement'));
export const LazyScheduleCalendar = lazy(() => import('@/components/ScheduleCalendar'));
export const LazyHoursWorkedChart = lazy(() => import('@/components/HoursWorkedChart'));
export const LazyTaskManagement = lazy(() => import('@/components/TaskManagement'));
export const LazyReportsManagement = lazy(() => import('@/components/ReportsManagement'));
export const LazySuperAdminDashboard = lazy(() => import('@/pages/SuperAdminDashboard'));
export const LazyOrgAdminDashboard = lazy(() => import('@/pages/OrgAdminDashboard'));
export const LazyManagerDashboard = lazy(() => import('@/pages/ManagerDashboard'));
export const LazyEmployeeDashboard = lazy(() => import('@/pages/EmployeeDashboard'));
