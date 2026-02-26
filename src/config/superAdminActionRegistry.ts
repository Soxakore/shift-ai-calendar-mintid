import type {
  PlaceholderPolicy,
  SuperAdminActionContract,
  SuperAdminActionId,
  SuperAdminActionState,
} from '@/types/superAdminUI';

export const superAdminActionRegistry: Record<SuperAdminActionId, SuperAdminActionContract> = {
  'overview.refresh': {
    id: 'overview.refresh',
    label: 'Refresh overview metrics',
    description: 'Reloads current super admin KPI values.',
    defaultState: 'enabled',
  },
  'overview.manage-users': {
    id: 'overview.manage-users',
    label: 'Open users management',
    description: 'Navigates to the users management surface.',
    defaultState: 'enabled',
  },
  'overview.manage-organisations': {
    id: 'overview.manage-organisations',
    label: 'Open organisation management',
    description: 'Navigates to organisation management.',
    defaultState: 'enabled',
  },
  'overview.create-user': {
    id: 'overview.create-user',
    label: 'Create user',
    description: 'Starts super admin user creation flow.',
    defaultState: 'enabled',
  },
  'overview.role-assignments': {
    id: 'overview.role-assignments',
    label: 'Review role assignments',
    description: 'Opens role assignment workflow.',
    defaultState: 'enabled',
  },
  'overview.analytics-workspace': {
    id: 'overview.analytics-workspace',
    label: 'Open analytics workspace',
    description: 'Navigates to analytics reports and dashboards.',
    defaultState: 'enabled',
  },
  'overview.security-monitoring': {
    id: 'overview.security-monitoring',
    label: 'Open security monitoring',
    description: 'Navigates to security and policy monitoring.',
    defaultState: 'enabled',
  },
  'overview.audit-history': {
    id: 'overview.audit-history',
    label: 'Open audit history',
    description: 'Navigates to activity and audit history.',
    defaultState: 'enabled',
  },
  'users.search': {
    id: 'users.search',
    label: 'Search users',
    description: 'Filters user records by name, username, or role.',
    defaultState: 'enabled',
  },
  'users.create': {
    id: 'users.create',
    label: 'Create user',
    description: 'Opens create user form.',
    defaultState: 'enabled',
  },
  'users.delete': {
    id: 'users.delete',
    label: 'Delete user',
    description: 'Deletes selected user with confirmation.',
    defaultState: 'enabled',
    requiresConfirmation: true,
  },
  'users.edit': {
    id: 'users.edit',
    label: 'Edit user',
    description: 'Opens edit user dialog.',
    defaultState: 'enabled',
  },
  'organisations.search': {
    id: 'organisations.search',
    label: 'Search organisations',
    description: 'Filters organisations by name and alias.',
    defaultState: 'enabled',
  },
  'organisations.create': {
    id: 'organisations.create',
    label: 'Create organisation',
    description: 'Opens create organisation flow.',
    defaultState: 'enabled',
  },
  'organisations.delete': {
    id: 'organisations.delete',
    label: 'Delete organisation',
    description: 'Deletes selected organisation with confirmation.',
    defaultState: 'enabled',
    requiresConfirmation: true,
  },
  'organisations.test-delete': {
    id: 'organisations.test-delete',
    label: 'Run organisation deletion test',
    description: 'Runs a controlled deletion validation flow.',
    defaultState: 'enabled',
    requiresConfirmation: true,
  },
  'navigation.overview': {
    id: 'navigation.overview',
    label: 'Navigate to overview tab',
    description: 'Switches super admin tab to overview.',
    defaultState: 'enabled',
  },
  'navigation.users': {
    id: 'navigation.users',
    label: 'Navigate to users tab',
    description: 'Switches super admin tab to users.',
    defaultState: 'enabled',
  },
  'navigation.user-roles': {
    id: 'navigation.user-roles',
    label: 'Navigate to role management tab',
    description: 'Switches super admin tab to role management.',
    defaultState: 'enabled',
  },
  'navigation.organisations': {
    id: 'navigation.organisations',
    label: 'Navigate to organisations tab',
    description: 'Switches super admin tab to organisations.',
    defaultState: 'enabled',
  },
  'navigation.analytics': {
    id: 'navigation.analytics',
    label: 'Navigate to analytics tab',
    description: 'Switches super admin tab to analytics.',
    defaultState: 'enabled',
  },
  'navigation.security': {
    id: 'navigation.security',
    label: 'Navigate to security tab',
    description: 'Switches super admin tab to security.',
    defaultState: 'enabled',
  },
  'navigation.2fa': {
    id: 'navigation.2fa',
    label: 'Navigate to 2FA tab',
    description: 'Switches super admin tab to two-factor management.',
    defaultState: 'enabled',
  },
  'navigation.system': {
    id: 'navigation.system',
    label: 'Navigate to system tab',
    description: 'Switches super admin tab to system settings.',
    defaultState: 'enabled',
  },
  'navigation.debug': {
    id: 'navigation.debug',
    label: 'Navigate to debug tab',
    description: 'Switches super admin tab to debug utilities.',
    defaultState: 'enabled',
  },
  'auth.logout': {
    id: 'auth.logout',
    label: 'Log out',
    description: 'Ends current authenticated session.',
    defaultState: 'enabled',
  },
  'header.search': {
    id: 'header.search',
    label: 'Search super admin resources',
    description: 'Searches users, organisations, and audit records.',
    defaultState: 'enabled',
  },
  'header.notifications': {
    id: 'header.notifications',
    label: 'Open notifications',
    description: 'Opens super admin notifications panel.',
    defaultState: 'enabled',
  },
  'header.history': {
    id: 'header.history',
    label: 'Open history',
    description: 'Opens activity history.',
    defaultState: 'enabled',
  },
  'header.theme-toggle': {
    id: 'header.theme-toggle',
    label: 'Toggle theme',
    description: 'Switches visual theme.',
    defaultState: 'enabled',
  },
};

export const superAdminPlaceholderPolicies: PlaceholderPolicy[] = [
  {
    actionId: 'header.search',
    fieldLabel: 'Global search',
    helperText: 'Search users, organisations, and logs.',
    placeholderExample: 'Type a name, email, username, or organisation...',
    isRequired: false,
  },
  {
    actionId: 'users.search',
    fieldLabel: 'Search users',
    helperText: 'Filter by display name, username, or role.',
    placeholderExample: 'Example: amina, manager, @username',
    isRequired: false,
  },
  {
    actionId: 'organisations.search',
    fieldLabel: 'Search organisations',
    helperText: 'Filter by organisation name or alias.',
    placeholderExample: 'Example: MinaTid HQ',
    isRequired: false,
  },
];

export const getActionDataAttributes = (actionId: SuperAdminActionId) => ({
  'data-sa-action-id': actionId,
  'data-sa-action-state': superAdminActionRegistry[actionId].defaultState,
});

export const getActionState = (
  actionId: SuperAdminActionId,
  overrides?: Partial<Record<SuperAdminActionId, SuperAdminActionState>>,
): SuperAdminActionState => {
  if (overrides?.[actionId]) {
    return overrides[actionId]!;
  }
  return superAdminActionRegistry[actionId].defaultState;
};
