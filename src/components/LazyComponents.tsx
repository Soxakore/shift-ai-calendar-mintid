import React, { lazy, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';

// Enhanced lazy loading wrapper component
interface LazyWrapperProps {
  children: React.ReactNode;
  componentName: string;
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({ children, componentName }) => (
  <ErrorBoundary 
    level="component" 
    identifier={`lazy-${componentName}`}
    onError={(error) => {
      console.error(`Failed to load ${componentName}:`, error);
    }}
  >
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Lazy load dashboard components for better performance
const SuperAdminDashboardComponent = lazy(() => import('../pages/SuperAdminDashboard'));
export const LazySuperAdminDashboard: React.FC<unknown> = (props) => (
  <LazyWrapper componentName="SuperAdminDashboard">
    <SuperAdminDashboardComponent {...(props as Record<string, unknown>)} />
  </LazyWrapper>
);

const OrgAdminDashboardComponent = lazy(() => import('../pages/OrgAdminDashboard'));
export const LazyOrgAdminDashboard: React.FC<unknown> = (props) => (
  <LazyWrapper componentName="OrgAdminDashboard">
    <OrgAdminDashboardComponent {...(props as Record<string, unknown>)} />
  </LazyWrapper>
);

const ManagerDashboardComponent = lazy(() => import('../pages/ManagerDashboard'));
export const LazyManagerDashboard: React.FC<unknown> = (props) => (
  <LazyWrapper componentName="ManagerDashboard">
    <ManagerDashboardComponent {...(props as Record<string, unknown>)} />
  </LazyWrapper>
);

const EmployeeDashboardComponent = lazy(() => import('../pages/EmployeeDashboard'));
export const LazyEmployeeDashboard: React.FC<unknown> = (props) => (
  <LazyWrapper componentName="EmployeeDashboard">
    <EmployeeDashboardComponent {...(props as Record<string, unknown>)} />
  </LazyWrapper>
);

// Other lazy components with enhanced error handling
const ScheduleCalendarComponent = lazy(() => import('./EnhancedScheduleCalendar'));
export const LazyScheduleCalendar: React.FC<unknown> = (props) => (
  <LazyWrapper componentName="ScheduleCalendar">
    <ScheduleCalendarComponent {...(props as Record<string, unknown>)} />
  </LazyWrapper>
);

const HoursWorkedChartComponent = lazy(() => import('./HoursWorkedChart'));
export const LazyHoursWorkedChart: React.FC<unknown> = (props) => (
  <LazyWrapper componentName="HoursWorkedChart">
    <HoursWorkedChartComponent {...(props as Record<string, unknown>)} />
  </LazyWrapper>
);

const TaskManagementComponent = lazy(() => import('./TaskManagement'));
export const LazyTaskManagement: React.FC<unknown> = (props) => (
  <LazyWrapper componentName="TaskManagement">
    <TaskManagementComponent {...(props as Record<string, unknown>)} />
  </LazyWrapper>
);

const ReportsManagementComponent = lazy(() => import('./ReportsManagement'));
export const LazyReportsManagement: React.FC<unknown> = (props) => (
  <LazyWrapper componentName="ReportsManagement">
    <ReportsManagementComponent {...(props as Record<string, unknown>)} />
  </LazyWrapper>
);
