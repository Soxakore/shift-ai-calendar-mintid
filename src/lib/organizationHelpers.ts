// Helper functions for working with organization data

export interface OrganizationSettings {
  alias?: string | null;
  description?: string | null;
  [key: string]: any;
}

/**
 * Extract alias from organization settings_json
 */
export function getOrganizationAlias(org: { settings_json?: any }): string | null {
  if (!org.settings_json) return null;
  
  try {
    const settings = typeof org.settings_json === 'string' 
      ? JSON.parse(org.settings_json) 
      : org.settings_json;
    
    return settings?.alias || null;
  } catch (error) {
    console.warn('Failed to parse organization settings_json:', error);
    return null;
  }
}

/**
 * Extract description from organization settings_json
 */
export function getOrganizationDescription(org: { settings_json?: any }): string | null {
  if (!org.settings_json) return null;
  
  try {
    const settings = typeof org.settings_json === 'string' 
      ? JSON.parse(org.settings_json) 
      : org.settings_json;
    
    return settings?.description || null;
  } catch (error) {
    console.warn('Failed to parse organization settings_json:', error);
    return null;
  }
}

/**
 * Get organization display name (uses alias if available, otherwise name)
 */
export function getOrganizationDisplayName(org: { name: string; settings_json?: any }): string {
  const alias = getOrganizationAlias(org);
  return alias || org.name;
}

/**
 * Create settings_json object with alias and description
 */
export function createOrganizationSettings(alias?: string, description?: string): OrganizationSettings {
  return {
    alias: alias?.trim() || null,
    description: description?.trim() || null
  };
}
