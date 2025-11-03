export type Permission = 
  | 'view_dashboard'
  | 'view_fighters'
  | 'register_fighters'
  | 'edit_fighters'
  | 'delete_fighters'
  | 'view_sponsors'
  | 'register_sponsors'
  | 'edit_sponsors'
  | 'view_fight_cards'
  | 'create_fight_cards'
  | 'edit_fight_cards'
  | 'declare_results'
  | 'view_rankings'
  | 'edit_ranking_settings'
  | 'view_licenses'
  | 'manage_licenses'
  | 'view_tournaments'
  | 'manage_tournaments'
  | 'view_betting'
  | 'place_bets'
  | 'manage_betting_pools'
  | 'settle_bets'
  | 'view_betting_reports'
  | 'manage_roles'
  | 'manage_permissions'
  | 'manage_app_settings'
  | 'season_reset'
  | 'clear_all_data';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
  createdDate: string;
  isSystemRole: boolean;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedDate: string;
  assignedBy: string;
}

export interface AppSettings {
  appTitle: string;
  appSubtitle: string;
  organizationName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export const PERMISSION_CATEGORIES = {
  dashboard: {
    name: 'Dashboard',
    description: 'Overview and statistics viewing',
    permissions: ['view_dashboard'] as Permission[],
  },
  fighters: {
    name: 'Fighter Management',
    description: 'Managing fighter profiles and registrations',
    permissions: [
      'view_fighters',
      'register_fighters',
      'edit_fighters',
      'delete_fighters',
    ] as Permission[],
  },
  sponsors: {
    name: 'Sponsor Management',
    description: 'Managing sponsor profiles and relationships',
    permissions: ['view_sponsors', 'register_sponsors', 'edit_sponsors'] as Permission[],
  },
  events: {
    name: 'Event Management',
    description: 'Creating and managing fight cards and events',
    permissions: [
      'view_fight_cards',
      'create_fight_cards',
      'edit_fight_cards',
      'declare_results',
    ] as Permission[],
  },
  rankings: {
    name: 'Rankings & Licenses',
    description: 'Viewing rankings and managing fighter licenses',
    permissions: [
      'view_rankings',
      'edit_ranking_settings',
      'view_licenses',
      'manage_licenses',
    ] as Permission[],
  },
  tournaments: {
    name: 'Tournament Management',
    description: 'Creating and managing tournament brackets',
    permissions: ['view_tournaments', 'manage_tournaments'] as Permission[],
  },
  betting: {
    name: 'Betting System',
    description: 'Complete betting management and operations',
    permissions: [
      'view_betting',
      'place_bets',
      'manage_betting_pools',
      'settle_bets',
      'view_betting_reports',
    ] as Permission[],
  },
  administration: {
    name: 'System Administration',
    description: 'Advanced system settings and data management',
    permissions: [
      'manage_roles',
      'manage_permissions',
      'manage_app_settings',
      'season_reset',
      'clear_all_data',
    ] as Permission[],
  },
};

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  view_dashboard: 'Access to the main dashboard with statistics and overview',
  view_fighters: 'View fighter directory and profiles',
  register_fighters: 'Register new fighters in the system',
  edit_fighters: 'Modify existing fighter profiles and information',
  delete_fighters: 'Remove fighters from the system permanently',
  view_sponsors: 'View sponsor directory and profiles',
  register_sponsors: 'Register new sponsors in the system',
  edit_sponsors: 'Modify existing sponsor profiles and information',
  view_fight_cards: 'View scheduled and past fight cards',
  create_fight_cards: 'Create new fight cards and events',
  edit_fight_cards: 'Modify existing fight card details',
  declare_results: 'Declare winners and update fight results',
  view_rankings: 'View fighter rankings and leaderboards',
  edit_ranking_settings: 'Modify the ranking calculation settings',
  view_licenses: 'View fighter license status and history',
  manage_licenses: 'Update fighter license status and process payments',
  view_tournaments: 'View tournament brackets and progress',
  manage_tournaments: 'Create and manage tournament brackets',
  view_betting: 'View betting pools and odds',
  place_bets: 'Place bets on fights',
  manage_betting_pools: 'Create and manage betting pools',
  settle_bets: 'Settle bets and distribute payouts',
  view_betting_reports: 'View detailed betting statistics and reports',
  manage_roles: 'Create, edit, and delete user roles',
  manage_permissions: 'Assign permissions to roles',
  manage_app_settings: 'Customize application name, branding, and settings',
  season_reset: 'Reset season data including rankings and fight history',
  clear_all_data: 'Clear all data from the system (dangerous operation)',
};

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all system features and settings',
    permissions: Object.keys(PERMISSION_DESCRIPTIONS) as Permission[],
    color: 'oklch(0.45 0.21 25)',
    createdDate: new Date().toISOString(),
    isSystemRole: true,
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage fighters, sponsors, and events',
    permissions: [
      'view_dashboard',
      'view_fighters',
      'register_fighters',
      'edit_fighters',
      'view_sponsors',
      'register_sponsors',
      'edit_sponsors',
      'view_fight_cards',
      'create_fight_cards',
      'edit_fight_cards',
      'declare_results',
      'view_rankings',
      'view_licenses',
      'manage_licenses',
      'view_tournaments',
      'manage_tournaments',
    ],
    color: 'oklch(0.80 0.15 85)',
    createdDate: new Date().toISOString(),
    isSystemRole: true,
  },
  {
    id: 'betting-manager',
    name: 'Betting Manager',
    description: 'Full access to betting system operations',
    permissions: [
      'view_dashboard',
      'view_fighters',
      'view_fight_cards',
      'view_rankings',
      'view_betting',
      'place_bets',
      'manage_betting_pools',
      'settle_bets',
      'view_betting_reports',
    ],
    color: 'oklch(0.85 0.18 90)',
    createdDate: new Date().toISOString(),
    isSystemRole: true,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'View-only access to public information',
    permissions: [
      'view_dashboard',
      'view_fighters',
      'view_sponsors',
      'view_fight_cards',
      'view_rankings',
      'view_licenses',
      'view_tournaments',
    ],
    color: 'oklch(0.55 0.15 200)',
    createdDate: new Date().toISOString(),
    isSystemRole: true,
  },
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appTitle: 'LSBA Manager',
  appSubtitle: 'Los Santos Boxing Association - Complete Management System',
  organizationName: 'Los Santos Boxing Association',
};
