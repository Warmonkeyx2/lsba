import { ArrowLeft, Plus, Minus, User, Trophy, Target, Lightning } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { Boxer, FightHistory } from '@/types/boxer';
import { getRanking, getSortedBoxers } from '@/lib/rankingUtils';

interface BoxerProfileProps {
  boxer: Boxer;
  allBoxers: Boxer[];
  onBack: () => void;
  onUpdateBoxer: (boxer: Boxer) => void;
}

export function BoxerProfile({ boxer, allBoxers, onBack, onUpdateBoxer }: BoxerProfileProps) {
  const rank = getRanking(boxer, allBoxers);
  const totalFights = boxer.wins + boxer.losses;
  const winRate = totalFights > 0 ? (boxer.wins / totalFights) * 100 : 0;

  const updateStat = (stat: 'wins' | 'losses' | 'knockouts', increment: boolean) => {
    const newValue = Math.max(0, boxer[stat] + (increment ? 1 : -1));
    const updated = { ...boxer, [stat]: newValue };
    onUpdateBoxer(updated);
    toast.success(`${stat.charAt(0).toUpperCase() + stat.slice(1)} ${increment ? 'increased' : 'decreased'}`);
  };

  const addFightResult = (result: 'win' | 'loss' | 'knockout') => {
    const newFight: FightHistory = {
      id: `fight-${Date.now()}`,
      opponent: 'TBD',
      date: new Date().toISOString(),
      result,
    };

    const updatedBoxer = { ...boxer };
    updatedBoxer.fightHistory = [newFight, ...updatedBoxer.fightHistory];

    if (result === 'win') {
      updatedBoxer.wins += 1;
    } else if (result === 'loss') {
      updatedBoxer.losses += 1;
    } else if (result === 'knockout') {
      updatedBoxer.wins += 1;
      updatedBoxer.knockouts += 1;
    }

    onUpdateBoxer(updatedBoxer);
    toast.success(`Fight result recorded: ${result.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leaderboard
        </Button>
      </div>

      <Card className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-40 h-40 border-4 border-primary/30">
              <AvatarImage src={boxer.profileImage} alt={`${boxer.firstName} ${boxer.lastName}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-5xl">
                {boxer.firstName[0]}{boxer.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Trophy className="w-6 h-6 text-secondary" weight="fill" />
                <span className="text-4xl font-display font-bold text-secondary">
                  {rank !== null ? `#${rank}` : 'Unranked'}
                </span>
              </div>
              <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1">
                Licensed Boxer
              </Badge>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div>
              <h1 className="font-fighter text-5xl uppercase font-black text-foreground mb-2">
                {boxer.firstName} {boxer.lastName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold">State ID:</span> {boxer.stateId}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span> {boxer.phoneNumber}
                </div>
                {boxer.timezone && (
                  <div>
                    <span className="font-semibold">Timezone:</span> {boxer.timezone}
                  </div>
                )}
                {boxer.sponsor && (
                  <div>
                    <span className="font-semibold">Sponsor:</span> {boxer.sponsor}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Lightning className="w-5 h-5 text-accent" weight="fill" />
                </div>
                <div className="text-3xl font-display font-bold text-accent">{boxer.rankingPoints}</div>
                <div className="text-xs uppercase text-muted-foreground mt-1">Ranking Points</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-display font-bold text-foreground">{totalFights}</div>
                <div className="text-xs uppercase text-muted-foreground mt-1">Total Fights</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-display font-bold text-secondary">{winRate.toFixed(1)}%</div>
                <div className="text-xs uppercase text-muted-foreground mt-1">Win Rate</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-display font-bold text-foreground">{boxer.wins}-{boxer.losses}-{boxer.knockouts}</div>
                <div className="text-xs uppercase text-muted-foreground mt-1">W-L-K Record</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-display font-bold text-primary">
                  {totalFights > 0 ? ((boxer.knockouts / totalFights) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-xs uppercase text-muted-foreground mt-1">KO Rate</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-secondary" weight="bold" />
            <h2 className="text-xl font-display uppercase text-secondary">Manage Stats</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-semibold text-foreground mb-1">Wins</div>
                <div className="text-3xl font-display font-bold text-secondary">{boxer.wins}</div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => updateStat('wins', false)}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="default" onClick={() => updateStat('wins', true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-semibold text-foreground mb-1">Losses</div>
                <div className="text-3xl font-display font-bold text-destructive">{boxer.losses}</div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => updateStat('losses', false)}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="default" onClick={() => updateStat('losses', true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-semibold text-foreground mb-1">Knockouts</div>
                <div className="text-3xl font-display font-bold text-primary">{boxer.knockouts}</div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => updateStat('knockouts', false)}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="default" onClick={() => updateStat('knockouts', true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Quick Add Fight Result</h3>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => addFightResult('win')}>
                  Add Win
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => addFightResult('loss')}>
                  Add Loss
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => addFightResult('knockout')}>
                  Add KO
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-display uppercase text-secondary mb-6">Fight History</h2>
          {boxer.fightHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No fight history yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
              {boxer.fightHistory.map((fight) => (
                <div key={fight.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {fight.result === 'pending' ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          UPCOMING
                        </Badge>
                      ) : (
                        <Badge
                          className={
                            fight.result === 'win' || fight.result === 'knockout'
                              ? 'bg-secondary text-secondary-foreground'
                              : 'bg-destructive text-destructive-foreground'
                          }
                        >
                          {fight.result === 'knockout' ? 'KO WIN' : fight.result.toUpperCase()}
                        </Badge>
                      )}
                      {fight.pointsChange !== undefined && fight.pointsChange !== 0 && (
                        <Badge 
                          variant="outline" 
                          className={fight.pointsChange > 0 ? 'text-accent border-accent' : 'text-destructive border-destructive'}
                        >
                          <Lightning className="w-3 h-3 mr-1" weight="fill" />
                          {fight.pointsChange > 0 ? '+' : ''}{fight.pointsChange}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(fight.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">vs</span>{' '}
                    <span className="font-semibold">{fight.opponent}</span>
                  </div>
                  {fight.eventName && (
                    <div className="text-xs text-muted-foreground mt-1">{fight.eventName}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
