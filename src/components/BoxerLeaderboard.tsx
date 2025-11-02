import { Trophy, User, ChartLine, Lightning } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Boxer } from '@/types/boxer';
import { getSortedBoxers } from '@/lib/rankingUtils';

interface BoxerLeaderboardProps {
  boxers: Boxer[];
  onSelectBoxer: (boxer: Boxer) => void;
}

export function BoxerLeaderboard({ boxers, onSelectBoxer }: BoxerLeaderboardProps) {
  const sortedBoxers = getSortedBoxers(boxers);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-secondary';
    if (rank === 2) return 'text-accent';
    if (rank === 3) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className="w-5 h-5" weight="fill" />;
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <ChartLine className="w-7 h-7 text-secondary" weight="bold" />
        <h2 className="text-2xl font-display uppercase text-secondary">Leaderboard</h2>
        <Badge variant="outline" className="ml-auto">Point-Based Ranking</Badge>
      </div>

      {sortedBoxers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="mb-2 font-semibold">No ranked fighters yet</p>
          <p className="text-sm">Fighters appear on the leaderboard once they earn points through competition</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedBoxers.map((boxer, index) => {
            const rank = index + 1;
            const totalFights = boxer.wins + boxer.losses;

            return (
              <div
                key={boxer.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => onSelectBoxer(boxer)}
              >
                <div className={`flex items-center justify-center w-12 ${getRankColor(rank)}`}>
                  <div className="flex flex-col items-center">
                    {getRankIcon(rank)}
                    <span className="font-display text-2xl font-bold">#{rank}</span>
                  </div>
                </div>

                <Avatar className="w-14 h-14 border-2 border-primary/30">
                  <AvatarImage src={boxer.profileImage} alt={`${boxer.firstName} ${boxer.lastName}`} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {boxer.firstName[0]}{boxer.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-fighter text-2xl uppercase font-bold truncate">
                      {boxer.firstName} {boxer.lastName}
                    </h3>
                    {boxer.sponsor && (
                      <Badge variant="outline" className="text-xs">
                        {boxer.sponsor}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {boxer.wins}W - {boxer.losses}L - {boxer.knockouts}KO
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Lightning className="w-5 h-5 text-accent" weight="fill" />
                    <div className="font-display text-3xl font-bold text-accent">
                      {boxer.rankingPoints}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground uppercase">Points</div>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="text-secondary">
                  View Profile
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
