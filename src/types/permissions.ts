// Simplified AppSettings interface - role and permission system removed
export interface AppSettings {
  appTitle: string;
  appSubtitle: string;
  organizationName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appTitle: 'LSBA Manager',
  appSubtitle: 'Los Santos Boxing Association - Complete Management System',
  organizationName: 'Los Santos Boxing Association',
};
