export interface TournamentMatch {
  id: string;
  round: number;
  matchNumber: number;
  fighter1Id?: string;
  fighter2Id?: string;
  fighter1Seed?: number;
  fighter2Seed?: number;
  winnerId?: string;
  status: 'pending' | 'completed';
  nextMatchId?: string;
}

export interface Tournament {
  id: string;
  name: string;
  createdDate: string;
  status: 'draft' | 'active' | 'completed';
  totalRounds: number;
  matches: TournamentMatch[];
  participants: string[];
  seedingMethod: 'ranked' | 'random';
  champion?: string;
}
