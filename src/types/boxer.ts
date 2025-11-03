export interface Boxer {
  id: string;
  stateId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  sponsor: string;
  wins: number;
  losses: number;
  knockouts: number;
  rankingPoints: number;
  registeredDate: string;
  profileImage?: string;
  fightHistory: FightHistory[];
  timezone?: 'NA' | 'EU' | 'AU';
  licenseStatus: 'active' | 'expired' | 'suspended';
  lastPaymentDate: string;
  licenseFee: number;
}

export interface FightHistory {
  id: string;
  opponent: string;
  date: string;
  result: 'win' | 'loss' | 'knockout' | 'pending';
  eventName?: string;
  notes?: string;
  fightCardId?: string;
  pointsChange?: number;
}

export interface SponsorContact {
  id: string;
  name: string;
  phoneNumber: string;
  role?: string;
}

export interface Sponsor {
  id: string;
  stateId: string;
  name: string;
  contactPerson: string;
  phoneNumber: string;
  registeredDate: string;
  boxersSponsored: string[];
  logoUrl?: string;
  additionalContacts: SponsorContact[];
}

export interface RankingSettings {
  baseWinPoints: number;
  baseLossPoints: number;
  koBonus: number;
  rankDifferenceMultiplier: number;
  upsetBonusMultiplier: number;
}
