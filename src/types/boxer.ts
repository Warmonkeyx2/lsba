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
  registeredDate: string;
  profileImage?: string;
  fightHistory: FightHistory[];
}

export interface FightHistory {
  id: string;
  opponent: string;
  date: string;
  result: 'win' | 'loss' | 'knockout';
  eventName?: string;
  notes?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  registeredDate: string;
  boxersSponsored: string[];
}
