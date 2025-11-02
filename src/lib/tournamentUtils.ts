import type { Boxer } from "@/types/boxer";
import type { Tournament, TournamentMatch } from "@/types/tournament";

export function getTop32Boxers(boxers: Boxer[]): Boxer[] {
  const sorted = [...boxers].sort((a, b) => {
    if (b.rankingPoints !== a.rankingPoints) {
      return b.rankingPoints - a.rankingPoints;
    }
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return a.losses - b.losses;
  });
  
  return sorted.slice(0, 32);
}

export function generateSeededBracket(boxers: Boxer[]): string[] {
  const top32 = getTop32Boxers(boxers);
  
  const seeding = [
    1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21,
    2, 31, 15, 18, 7, 26, 10, 23, 3, 30, 14, 19, 6, 27, 11, 22
  ];
  
  return seeding.map(seed => top32[seed - 1]?.id).filter(Boolean);
}

export function generateRandomBracket(boxers: Boxer[]): string[] {
  const top32 = getTop32Boxers(boxers);
  const shuffled = [...top32];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.map(b => b.id);
}

export function createTournamentBracket(
  participants: string[],
  seedingMethod: 'ranked' | 'random',
  tournamentName: string
): Tournament {
  const totalRounds = 5;
  const matches: TournamentMatch[] = [];
  
  let matchId = 1;
  
  for (let i = 0; i < 16; i++) {
    matches.push({
      id: `match-${matchId}`,
      round: 1,
      matchNumber: i + 1,
      fighter1Id: participants[i * 2],
      fighter2Id: participants[i * 2 + 1],
      fighter1Seed: i * 2 + 1,
      fighter2Seed: i * 2 + 2,
      status: 'pending',
      nextMatchId: `match-${17 + Math.floor(i / 2)}`,
    });
    matchId++;
  }
  
  for (let i = 0; i < 8; i++) {
    matches.push({
      id: `match-${matchId}`,
      round: 2,
      matchNumber: i + 1,
      status: 'pending',
      nextMatchId: `match-${25 + Math.floor(i / 2)}`,
    });
    matchId++;
  }
  
  for (let i = 0; i < 4; i++) {
    matches.push({
      id: `match-${matchId}`,
      round: 3,
      matchNumber: i + 1,
      status: 'pending',
      nextMatchId: `match-${29 + Math.floor(i / 2)}`,
    });
    matchId++;
  }
  
  for (let i = 0; i < 2; i++) {
    matches.push({
      id: `match-${matchId}`,
      round: 4,
      matchNumber: i + 1,
      status: 'pending',
      nextMatchId: 'match-31',
    });
    matchId++;
  }
  
  matches.push({
    id: 'match-31',
    round: 5,
    matchNumber: 1,
    status: 'pending',
  });
  
  return {
    id: `tournament-${Date.now()}`,
    name: tournamentName,
    createdDate: new Date().toISOString(),
    status: 'draft',
    totalRounds,
    matches,
    participants,
    seedingMethod,
  };
}

export function advanceWinner(
  tournament: Tournament,
  matchId: string,
  winnerId: string
): Tournament {
  const updatedMatches = tournament.matches.map(match => {
    if (match.id === matchId) {
      return {
        ...match,
        winnerId,
        status: 'completed' as const,
      };
    }
    return match;
  });
  
  const completedMatch = updatedMatches.find(m => m.id === matchId);
  
  if (completedMatch?.nextMatchId) {
    const nextMatch = updatedMatches.find(m => m.id === completedMatch.nextMatchId);
    if (nextMatch) {
      const matchIndex = updatedMatches.indexOf(nextMatch);
      const prevMatches = updatedMatches.filter(
        m => m.nextMatchId === nextMatch.id && m.status === 'completed'
      );
      
      if (prevMatches[0]?.winnerId === winnerId) {
        updatedMatches[matchIndex] = {
          ...nextMatch,
          fighter1Id: winnerId,
        };
      } else {
        updatedMatches[matchIndex] = {
          ...nextMatch,
          fighter2Id: winnerId,
        };
      }
    }
  }
  
  const allMatchesComplete = updatedMatches.every(m => m.status === 'completed');
  const finalMatch = updatedMatches.find(m => m.round === tournament.totalRounds);
  
  return {
    ...tournament,
    matches: updatedMatches,
    status: allMatchesComplete ? 'completed' : 'active',
    champion: allMatchesComplete ? finalMatch?.winnerId : undefined,
  };
}

export function getRoundName(round: number): string {
  switch (round) {
    case 1:
      return 'Round of 32';
    case 2:
      return 'Round of 16';
    case 3:
      return 'Quarterfinals';
    case 4:
      return 'Semifinals';
    case 5:
      return 'Championship';
    default:
      return `Round ${round}`;
  }
}
