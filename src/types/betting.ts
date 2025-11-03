export interface FightOdds {
  fightId: string;
  fighter1Id: string;
  fighter2Id: string;
  fighter1Odds: number;
  fighter2Odds: number;
  fighter1ImpliedProbability: number;
  fighter2ImpliedProbability: number;
  totalPool: number;
  fighter1Bets: number;
  fighter2Bets: number;
  lastUpdated: string;
  oddsFormat: 'american' | 'decimal' | 'fractional';
}

export interface Bet {
  id: string;
  userId: string;
  userName: string;
  fightId: string;
  fightCardId: string;
  eventName: string;
  eventDate: string;
  fighterId: string;
  fighterName: string;
  opponentName: string;
  amount: number;
  odds: number;
  potentialPayout: number;
  placedDate: string;
  status: 'pending' | 'won' | 'lost' | 'cancelled' | 'refunded';
  settledDate?: string;
  actualPayout?: number;
}

export interface BettingPool {
  fightCardId: string;
  eventName: string;
  eventDate: string;
  minimumBet: number;
  fights: FightOdds[];
  totalBetsPlaced: number;
  totalPoolAmount: number;
  status: 'open' | 'locked' | 'settled';
  createdDate: string;
  lockedDate?: string;
  settledDate?: string;
}

export interface UserBettingProfile {
  userId: string;
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  activeBets: string[];
  bettingHistory: string[];
  winRate: number;
  profitLoss: number;
}

export type EventType = 'regular' | 'special' | 'tournament';

export interface BettingLimits {
  regular: {
    minimum: number;
  };
  special: {
    minimum: number;
  };
  tournament: {
    entryPerBoxer: number;
  };
}
