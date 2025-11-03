export interface AppSettings {
  branding: {
    appName: string;
    appSubtitle: string;
    abbreviation: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    destructive: string;
    destructiveForeground: string;
  };
  typography: {
    displayFont: string;
    bodyFont: string;
    fighterFont: string;
  };
  layout: {
    borderRadius: string;
  };
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  branding: {
    appName: 'LSBA Manager',
    appSubtitle: 'Los Santos Boxing Association - Complete Management System',
    abbreviation: 'LSBA',
  },
  colors: {
    primary: 'oklch(0.45 0.21 25)',
    secondary: 'oklch(0.80 0.15 85)',
    accent: 'oklch(0.85 0.18 90)',
    background: 'oklch(0.15 0 0)',
    foreground: 'oklch(0.98 0 0)',
    card: 'oklch(0.20 0 0)',
    cardForeground: 'oklch(0.98 0 0)',
    muted: 'oklch(0.35 0 0)',
    mutedForeground: 'oklch(0.85 0 0)',
    border: 'oklch(0.30 0 0)',
    destructive: 'oklch(0.55 0.22 25)',
    destructiveForeground: 'oklch(0.98 0 0)',
  },
  typography: {
    displayFont: 'Bebas Neue',
    bodyFont: 'Inter',
    fighterFont: 'Teko',
  },
  layout: {
    borderRadius: '0.5rem',
  },
};
