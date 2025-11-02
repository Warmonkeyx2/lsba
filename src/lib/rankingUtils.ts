import type { Boxer, RankingSettings } from "@/types/boxer";

export const DEFAULT_RANKING_SETTINGS: RankingSettings = {
  baseWinPoints: 100,
  baseLossPoints: -50,
  koBonus: 25,
  rankDifferenceMultiplier: 0.15,
  upsetBonusMultiplier: 0.5,
};

export function calculatePointsForFight(
  winner: Boxer,
  loser: Boxer,
  knockout: boolean,
  rankedBoxers: Boxer[],
  settings: RankingSettings = DEFAULT_RANKING_SETTINGS
): { winnerPoints: number; loserPoints: number } {
  const winnerRank = getRanking(winner, rankedBoxers);
  const loserRank = getRanking(loser, rankedBoxers);

  let winnerPoints = settings.baseWinPoints;
  let loserPoints = settings.baseLossPoints;

  if (winnerRank !== null && loserRank !== null) {
    const rankDifference = loserRank - winnerRank;

    if (rankDifference > 0) {
      const bonus = Math.floor(
        rankDifference * settings.rankDifferenceMultiplier * settings.baseWinPoints
      );
      winnerPoints += bonus;
    } else if (rankDifference < 0) {
      const upset = Math.abs(rankDifference);
      const upsetBonus = Math.floor(
        upset * settings.upsetBonusMultiplier * settings.baseWinPoints
      );
      winnerPoints += upsetBonus;

      const extraPenalty = Math.floor(
        upset * settings.rankDifferenceMultiplier * Math.abs(settings.baseLossPoints)
      );
      loserPoints -= extraPenalty;
    }
  }

  if (knockout) {
    winnerPoints += settings.koBonus;
  }

  return { winnerPoints, loserPoints };
}

export function getRanking(boxer: Boxer, rankedBoxers: Boxer[]): number | null {
  const sorted = getSortedBoxers(rankedBoxers);
  const index = sorted.findIndex((b) => b.id === boxer.id);
  return index !== -1 ? index + 1 : null;
}

export function getSortedBoxers(boxers: Boxer[]): Boxer[] {
  return [...boxers]
    .filter((b) => b.rankingPoints > 0)
    .sort((a, b) => {
      if (b.rankingPoints !== a.rankingPoints) {
        return b.rankingPoints - a.rankingPoints;
      }
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      return a.losses - b.losses;
    });
}
