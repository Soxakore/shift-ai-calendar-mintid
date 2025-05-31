import { lazy } from 'react';

// Existing components
export const LoginPage = lazy(() => import('@/pages/LoginPage'));
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
