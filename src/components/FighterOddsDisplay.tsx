import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendUp, TrendDown, Minus, ChartLine } from '@phosphor-icons/react';
import type { Boxer } from '@/types/boxer';
import type { BettingPool } from '@/types/betting';
import type { FightCard } from '@/types/fightCard';
import { getFighterCurrentOdds, formatOdds } from '@/lib/bettingUtils';

interface FighterOddsDisplayProps {
  boxer: Boxer;
  bettingPools: BettingPool[];
  fightCards: FightCard[];
}

export function FighterOddsDisplay({ boxer, bettingPools, fightCards }: FighterOddsDisplayProps) {
  const upcomingFights = fightCards
    .filter(fc => fc.status === 'upcoming')
    .flatMap(fc => {
      const allBouts = [
        fc.mainEvent,
        ...(fc.coMainEvent ? [fc.coMainEvent] : []),
        ...fc.otherBouts,
      ];
      
      return allBouts
        .filter(bout => bout.fighter1Id === boxer.id || bout.fighter2Id === boxer.id)
        .map(bout => {
          const isF1 = bout.fighter1Id === boxer.id;
          const opponentName = isF1 ? bout.fighter2 : bout.fighter1;
          const odds = getFighterCurrentOdds(boxer.id, fc.id!, bettingPools);
          
          return {
            fightCardId: fc.id!,
            eventName: fc.mainEvent.title || `LSBA Event - ${fc.eventDate}`,
            eventDate: fc.eventDate,
            opponent: opponentName,
            odds: odds?.odds,
            probability: odds?.probability,
            format: odds?.format,
            boutType: bout.type,
          };
        });
    });

  if (upcomingFights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine className="w-5 h-5" weight="bold" />
          Current Betting Odds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingFights.map((fight, index) => {
          if (!fight.odds || !fight.probability) {
            return (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <div className="font-semibold">{fight.eventName}</div>
                  <div className="text-sm text-muted-foreground">vs {fight.opponent}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(fight.eventDate).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="outline">
                  <Minus className="w-3 h-3 mr-1" />
                  Odds Pending
                </Badge>
              </div>
            );
          }

          const isFavorite = fight.probability > 0.5;
          const formattedOdds = formatOdds(fight.odds, 'american', fight.probability);
          
          return (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold">{fight.eventName}</div>
                  {fight.boutType === 'main' && (
                    <Badge variant="default" className="text-xs">Main Event</Badge>
                  )}
                  {fight.boutType === 'co-main' && (
                    <Badge variant="secondary" className="text-xs">Co-Main</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">vs {fight.opponent}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(fight.eventDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  {isFavorite ? (
                    <Badge variant="default" className="bg-secondary">
                      <TrendUp className="w-3 h-3 mr-1" />
                      Favorite
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <TrendDown className="w-3 h-3 mr-1" />
                      Underdog
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-display font-bold text-primary">
                    {formattedOdds}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((fight.probability || 0) * 100).toFixed(1)}% win probability
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
