
import { lazy } from 'react';

// Lazy load dashboard components for better performance
export const LazySuperAdminDashboard = lazy(() => import('@/pages/SuperAdminDashboard'));
export const LazyOrgAdminDashboard = lazy(() => import('@/pages/OrgAdminDashboard'));
export const LazyManagerDashboard = lazy(() => import('@/pages/ManagerDashboard'));
export const LazyEmployeeDashboard = lazy(() => import('@/pages/EmployeeDashboard'));
export const LazyUnifiedLogin = lazy(() => import('@/pages/UnifiedLogin'));

// Lazy load admin components
export const LazyUsersManagement = lazy(() => import('@/components/admin/UsersManagement'));
export const LazyAISettings = lazy(() => import('@/components/admin/AISettings'));
export const LazySystemSettings = lazy(() => import('@/components/admin/SystemSettings'));
export const LazyOrganizationManagement = lazy(() => import('@/components/admin/OrganizationManagement'));
export const LazyAdminReportsManagement = lazy(() => import('@/components/admin/ReportsManagement'));

// Lazy load schedule and task components
export const LazyScheduleCalendar = lazy(() => import('@/components/ScheduleCalendar'));
export const LazyHoursWorkedChart = lazy(() => import('@/components/HoursWorkedChart'));
export const LazyTaskManagement = lazy(() => import('@/components/TaskManagement'));
export const LazyReportsManagement = lazy(() => import('@/components/ReportsManagement'));
