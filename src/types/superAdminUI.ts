export type SuperAdminActionState = 'enabled' | 'disabled' | 'loading' | 'hidden';

export type SectionDensity = 'comfortable' | 'compact';

export type SuperAdminActionId =
  | 'overview.refresh'
  | 'overview.manage-users'
  | 'overview.manage-organisations'
  | 'overview.create-user'
  | 'overview.role-assignments'
  | 'overview.analytics-workspace'
  | 'overview.security-monitoring'
  | 'overview.audit-history'
  | 'users.search'
  | 'users.create'
  | 'users.delete'
  | 'users.edit'
  | 'organisations.search'
  | 'organisations.create'
  | 'organisations.delete'
  | 'organisations.test-delete'
  | 'navigation.overview'
  | 'navigation.users'
  | 'navigation.user-roles'
  | 'navigation.organisations'
  | 'navigation.analytics'
  | 'navigation.security'
  | 'navigation.2fa'
  | 'navigation.system'
  | 'navigation.debug'
  | 'auth.logout'
  | 'header.search'
  | 'header.notifications'
  | 'header.history'
  | 'header.theme-toggle';

export interface PlaceholderPolicy {
  actionId: SuperAdminActionId;
  fieldLabel: string;
  helperText: string;
  placeholderExample: string;
  isRequired: boolean;
}

export interface SuperAdminActionContract {
  id: SuperAdminActionId;
  label: string;
  description: string;
  defaultState: SuperAdminActionState;
  requiresConfirmation?: boolean;
}
