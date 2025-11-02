export interface Bout {
  id: string;
  fighter1: string;
  fighter2: string;
  fighter1Id?: string;
  fighter2Id?: string;
  fighter1Rank?: number;
  fighter2Rank?: number;
  fighter1Image?: string;
  fighter2Image?: string;
  fighter1Record?: {
    wins: string;
    losses: string;
    knockouts: string;
  };
  fighter2Record?: {
    wins: string;
    losses: string;
    knockouts: string;
  };
  winner?: 'fighter1' | 'fighter2';
  knockout?: boolean;
  title?: string;
  type: 'main' | 'co-main' | 'undercard' | 'preliminary';
}

export interface FightCard {
  id?: string;
  eventDate: string;
  location: string;
  mainEvent: Bout;
  coMainEvent?: Bout;
  otherBouts: Bout[];
  sponsors: string;
  backgroundImage?: string;
  customLogo?: string;
  status: 'upcoming' | 'completed';
  createdDate?: string;
}
