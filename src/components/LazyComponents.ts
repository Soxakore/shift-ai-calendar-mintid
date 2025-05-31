
import { lazy } from 'react';

// Lazy load dashboard components for better performance
export const LazySuperAdminDashboard = lazy(() => import('@/pages/SuperAdminDashboard'));
export const LazyOrgAdminDashboard = lazy(() => import('@/pages/OrgAdminDashboard'));
export const LazyManagerDashboard = lazy(() => import('@/pages/ManagerDashboard'));
export const LazyEmployeeDashboard = lazy(() => import('@/pages/EmployeeDashboard'));
export const LazyUnifiedLogin = lazy(() => import('@/pages/UnifiedLogin'));
