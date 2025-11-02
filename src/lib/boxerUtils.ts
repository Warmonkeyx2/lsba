import type { Boxer } from '@/types/boxer';

export function calculateWinRate(boxer: Boxer): number {
  const totalFights = boxer.wins + boxer.losses;
  if (totalFights === 0) return 0;
  return (boxer.wins / totalFights) * 100;
}

export function calculateRank(boxer: Boxer, allBoxers: Boxer[]): number {
  const sortedBoxers = [...allBoxers].sort((a, b) => {
    const aRate = calculateWinRate(a);
    const bRate = calculateWinRate(b);
    if (bRate !== aRate) return bRate - aRate;
    return b.wins - a.wins;
  });
  return sortedBoxers.findIndex(b => b.id === boxer.id) + 1;
}

export function getBoxerRecord(boxer: Boxer): string {
  return `${boxer.wins}-${boxer.losses}-${boxer.knockouts}`;
}

export function getBoxerFullName(boxer: Boxer): string {
  return `${boxer.firstName} ${boxer.lastName}`;
}

export function sortBoxersByRank(boxers: Boxer[]): Boxer[] {
  return [...boxers].sort((a, b) => {
    const aRate = calculateWinRate(a);
    const bRate = calculateWinRate(b);
    if (bRate !== aRate) return bRate - aRate;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });
}
