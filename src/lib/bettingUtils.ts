import type { Boxer } from '@/types/boxer';
import type { FightOdds, Bet, BettingPool, EventType, PayoutSettings, PayoutBreakdown } from '@/types/betting';
import { getSortedBoxers } from './rankingUtils';

export const BETTING_LIMITS = {
  regular: { minimum: 2000 },
  special: { minimum: 5000 },
  tournament: { entryPerBoxer: 5000 },
};

export const DEFAULT_PAYOUT_SETTINGS: PayoutSettings = {
  lsbaFeePercentage: 10,
};

export const CASINO_NAME = '1068 Casino';

export function calculateFighterStrength(boxer: Boxer, allBoxers: Boxer[]): number {
  const sortedBoxers = getSortedBoxers(allBoxers);
  const rank = sortedBoxers.findIndex(b => b.id === boxer.id) + 1;
  const totalFighters = sortedBoxers.length;
  
  const totalFights = boxer.wins + boxer.losses;
  const winRate = totalFights > 0 ? boxer.wins / totalFights : 0.5;
  const koRate = totalFights > 0 ? boxer.knockouts / totalFights : 0;
  
  const rankScore = totalFighters > 0 ? (totalFighters - rank + 1) / totalFighters : 0.5;
  const pointsScore = Math.min(boxer.rankingPoints / 1000, 1);
  
  const experienceScore = Math.min(totalFights / 20, 1);
  
  const recentFormScore = calculateRecentForm(boxer);
  
  const strength = (
    rankScore * 0.30 +
    winRate * 0.25 +
    pointsScore * 0.20 +
    koRate * 0.10 +
    experienceScore * 0.10 +
    recentFormScore * 0.05
  );
  
  return Math.max(0.1, Math.min(0.9, strength));
}

function calculateRecentForm(boxer: Boxer): number {
  const recentFights = boxer.fightHistory
    .filter(f => f.result !== 'pending')
    .slice(0, 5);
  
  if (recentFights.length === 0) return 0.5;
  
  let formScore = 0;
  recentFights.forEach((fight, index) => {
    const weight = 1 - (index * 0.1);
    if (fight.result === 'win' || fight.result === 'knockout') {
      formScore += weight * (fight.result === 'knockout' ? 1.2 : 1.0);
    } else {
      formScore += weight * 0.3;
    }
  });
  
  return formScore / recentFights.length;
}

export function calculateImpliedProbability(
  fighter1: Boxer,
  fighter2: Boxer,
  allBoxers: Boxer[]
): { fighter1Probability: number; fighter2Probability: number } {
  const strength1 = calculateFighterStrength(fighter1, allBoxers);
  const strength2 = calculateFighterStrength(fighter2, allBoxers);
  
  const totalStrength = strength1 + strength2;
  
  const fighter1Probability = strength1 / totalStrength;
  const fighter2Probability = strength2 / totalStrength;
  
  return { fighter1Probability, fighter2Probability };
}

export function probabilityToAmericanOdds(probability: number): number {
  if (probability >= 0.5) {
    return Math.round(-1 * (probability / (1 - probability)) * 100);
  } else {
    return Math.round(((1 - probability) / probability) * 100);
  }
}

export function probabilityToDecimalOdds(probability: number): number {
  return parseFloat((1 / probability).toFixed(2));
}

export function probabilityToFractionalOdds(probability: number): string {
  const decimal = 1 / probability;
  const numerator = Math.round((decimal - 1) * 100);
  const denominator = 100;
  
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(numerator, denominator);
  
  return `${numerator / divisor}/${denominator / divisor}`;
}

export function americanOddsToProbability(odds: number): number {
  if (odds < 0) {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  } else {
    return 100 / (odds + 100);
  }
}

export function calculatePayout(betAmount: number, odds: number, oddsFormat: 'american' | 'decimal' | 'fractional' = 'american'): number {
  if (oddsFormat === 'american') {
    if (odds < 0) {
      return betAmount + (betAmount / Math.abs(odds)) * 100;
    } else {
      return betAmount + (betAmount * odds) / 100;
    }
  } else if (oddsFormat === 'decimal') {
    return betAmount * odds;
  }
  
  return betAmount * 2;
}

export function adjustOddsForPool(
  baseProbability: number,
  totalPoolFighter: number,
  totalPoolOpponent: number,
  vigPercentage: number = 0.05
): number {
  const totalPool = totalPoolFighter + totalPoolOpponent;
  
  if (totalPool === 0) {
    return baseProbability;
  }
  
  const poolProbability = totalPoolOpponent / totalPool;
  
  const adjustedProbability = (baseProbability * 0.7) + (poolProbability * 0.3);
  
  const withVig = adjustedProbability * (1 + vigPercentage);
  
  return Math.max(0.05, Math.min(0.95, withVig));
}

export function generateFightOdds(
  fightId: string,
  fighter1: Boxer,
  fighter2: Boxer,
  allBoxers: Boxer[],
  existingBets?: Bet[],
  oddsFormat: 'american' | 'decimal' | 'fractional' = 'american'
): FightOdds {
  const { fighter1Probability, fighter2Probability } = calculateImpliedProbability(
    fighter1,
    fighter2,
    allBoxers
  );
  
  let fighter1Bets = 0;
  let fighter2Bets = 0;
  
  if (existingBets) {
    fighter1Bets = existingBets
      .filter(b => b.fightId === fightId && b.fighterId === fighter1.id && b.status === 'pending')
      .reduce((sum, b) => sum + b.amount, 0);
    
    fighter2Bets = existingBets
      .filter(b => b.fightId === fightId && b.fighterId === fighter2.id && b.status === 'pending')
      .reduce((sum, b) => sum + b.amount, 0);
  }
  
  const adjustedProb1 = adjustOddsForPool(fighter1Probability, fighter1Bets, fighter2Bets);
  const adjustedProb2 = adjustOddsForPool(fighter2Probability, fighter2Bets, fighter1Bets);
  
  const totalAdjusted = adjustedProb1 + adjustedProb2;
  const normalizedProb1 = adjustedProb1 / totalAdjusted;
  const normalizedProb2 = adjustedProb2 / totalAdjusted;
  
  let fighter1Odds: number;
  let fighter2Odds: number;
  
  if (oddsFormat === 'american') {
    fighter1Odds = probabilityToAmericanOdds(normalizedProb1);
    fighter2Odds = probabilityToAmericanOdds(normalizedProb2);
  } else if (oddsFormat === 'decimal') {
    fighter1Odds = probabilityToDecimalOdds(normalizedProb1);
    fighter2Odds = probabilityToDecimalOdds(normalizedProb2);
  } else {
    fighter1Odds = parseFloat(probabilityToFractionalOdds(normalizedProb1).split('/')[0]);
    fighter2Odds = parseFloat(probabilityToFractionalOdds(normalizedProb2).split('/')[0]);
  }
  
  return {
    fightId,
    fighter1Id: fighter1.id,
    fighter2Id: fighter2.id,
    fighter1Odds,
    fighter2Odds,
    fighter1ImpliedProbability: normalizedProb1,
    fighter2ImpliedProbability: normalizedProb2,
    totalPool: fighter1Bets + fighter2Bets,
    fighter1Bets,
    fighter2Bets,
    lastUpdated: new Date().toISOString(),
    oddsFormat,
  };
}

export function formatOdds(odds: number, format: 'american' | 'decimal' | 'fractional', probability?: number): string {
  if (format === 'american') {
    return odds > 0 ? `+${odds}` : `${odds}`;
  } else if (format === 'decimal') {
    return odds.toFixed(2);
  } else {
    if (probability) {
      return probabilityToFractionalOdds(probability);
    }
    return `${odds}/1`;
  }
}

export function getMinimumBet(eventType: EventType): number {
  switch (eventType) {
    case 'regular':
      return BETTING_LIMITS.regular.minimum;
    case 'special':
      return BETTING_LIMITS.special.minimum;
    case 'tournament':
      return BETTING_LIMITS.tournament.entryPerBoxer;
    default:
      return BETTING_LIMITS.regular.minimum;
  }
}

export function validateBet(
  amount: number,
  eventType: EventType,
  userBalance?: number
): { valid: boolean; error?: string } {
  const minimum = getMinimumBet(eventType);
  
  if (amount < minimum) {
    return {
      valid: false,
      error: `Minimum bet for ${eventType} events is $${minimum.toLocaleString()}`,
    };
  }
  
  if (userBalance !== undefined && amount > userBalance) {
    return {
      valid: false,
      error: 'Insufficient funds',
    };
  }
  
  return { valid: true };
}

export function createBettingPool(
  fightCardId: string,
  eventName: string,
  eventDate: string,
  fights: Array<{ fighter1: Boxer; fighter2: Boxer; fightId: string }>,
  allBoxers: Boxer[],
  eventType: EventType = 'regular',
  existingBets?: Bet[],
  payoutSettings: PayoutSettings = DEFAULT_PAYOUT_SETTINGS
): BettingPool {
  const fightOdds = fights.map(({ fighter1, fighter2, fightId }) =>
    generateFightOdds(fightId, fighter1, fighter2, allBoxers, existingBets)
  );
  
  return {
    fightCardId,
    eventName,
    eventDate,
    minimumBet: getMinimumBet(eventType),
    fights: fightOdds,
    totalBetsPlaced: existingBets?.filter(b => b.fightCardId === fightCardId).length || 0,
    totalPoolAmount: existingBets
      ?.filter(b => b.fightCardId === fightCardId && b.status === 'pending')
      .reduce((sum, b) => sum + b.amount, 0) || 0,
    status: 'open',
    createdDate: new Date().toISOString(),
    casinoName: CASINO_NAME,
    payoutSettings,
  };
}

export function calculatePayoutBreakdown(
  originalBet: number,
  totalWinnings: number,
  payoutSettings: PayoutSettings
): PayoutBreakdown {
  const lsbaFee = (originalBet * payoutSettings.lsbaFeePercentage) / 100;
  const bettorPayout = totalWinnings - lsbaFee;
  const bookerProfit = originalBet - totalWinnings;

  return {
    originalBet,
    totalWinnings,
    bettorPayout,
    lsbaFee,
    bookerProfit,
  };
}

export function settleBets(
  bets: Bet[],
  fightId: string,
  winnerId: string,
  payoutSettings: PayoutSettings = DEFAULT_PAYOUT_SETTINGS
): Bet[] {
  return bets.map(bet => {
    if (bet.fightId !== fightId || bet.status !== 'pending') {
      return bet;
    }
    
    const lsbaFee = (bet.amount * payoutSettings.lsbaFeePercentage) / 100;
    
    if (bet.fighterId === winnerId) {
      const bettorPayout = bet.potentialPayout - lsbaFee;
      const bookerProfit = bet.amount - bet.potentialPayout;
      
      const payoutBreakdown: PayoutBreakdown = {
        originalBet: bet.amount,
        totalWinnings: bet.potentialPayout,
        bettorPayout,
        lsbaFee,
        bookerProfit,
      };
      
      return {
        ...bet,
        status: 'won',
        actualPayout: bettorPayout,
        payoutBreakdown,
        settledDate: new Date().toISOString(),
      };
    } else {
      const bookerProfit = bet.amount - lsbaFee;
      
      const payoutBreakdown: PayoutBreakdown = {
        originalBet: bet.amount,
        totalWinnings: 0,
        bettorPayout: 0,
        lsbaFee,
        bookerProfit,
      };
      
      return {
        ...bet,
        status: 'lost',
        actualPayout: 0,
        payoutBreakdown,
        settledDate: new Date().toISOString(),
      };
    }
  });
}

export function getFighterCurrentOdds(
  fighterId: string,
  fightCardId: string,
  bettingPools: BettingPool[]
): { odds: number; probability: number; format: string } | null {
  const pool = bettingPools.find(p => p.fightCardId === fightCardId);
  if (!pool) return null;
  
  for (const fight of pool.fights) {
    if (fight.fighter1Id === fighterId) {
      return {
        odds: fight.fighter1Odds,
        probability: fight.fighter1ImpliedProbability,
        format: fight.oddsFormat,
      };
    }
    if (fight.fighter2Id === fighterId) {
      return {
        odds: fight.fighter2Odds,
        probability: fight.fighter2ImpliedProbability,
        format: fight.oddsFormat,
      };
    }
  }
  
  return null;
}
