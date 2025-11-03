import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, CurrencyDollar, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Bet } from '@/types/betting';
import type { FightCard } from '@/types/fightCard';
import type { Boxer } from '@/types/boxer';

interface BetSettlementManagerProps {
  fightCards: FightCard[];
  bets: Bet[];
  boxers: Boxer[];
  onSettleBets: (settledBets: Array<{ bet: Bet; winnerId: string; note: string }>) => void;
}

export function BetSettlementManager({
  fightCards = [],
  bets = [],
  boxers = [],
  onSettleBets,
}: BetSettlementManagerProps) {
  const completedFightCards = fightCards.filter(fc => fc.status === 'completed');

  const pendingBetsForCompletedFights = useMemo(() => {
    return bets.filter(bet => {
      const fightCard = completedFightCards.find(fc => fc.id === bet.fightCardId);
      if (!fightCard || bet.status !== 'pending') return false;

      const allBouts = [
        fightCard.mainEvent,
        ...(fightCard.coMainEvent ? [fightCard.coMainEvent] : []),
        ...fightCard.otherBouts,
      ];
      
      const bout = allBouts.find(b => b.id === bet.fightId);
      return bout && bout.winner;
    });
  }, [bets, completedFightCards]);

  const getBetResult = (bet: Bet): { winner: 'fighter1' | 'fighter2', winnerId: string, winnerName: string } | null => {
    const fightCard = completedFightCards.find(fc => fc.id === bet.fightCardId);
    if (!fightCard) return null;

    const allBouts = [
      fightCard.mainEvent,
      ...(fightCard.coMainEvent ? [fightCard.coMainEvent] : []),
      ...fightCard.otherBouts,
    ];
    
    const bout = allBouts.find(b => b.id === bet.fightId);
    if (!bout || !bout.winner) return null;

    const winnerId = bout.winner === 'fighter1' ? bout.fighter1Id : bout.fighter2Id;
    const winnerName = bout.winner === 'fighter1' ? bout.fighter1 : bout.fighter2;

    return {
      winner: bout.winner,
      winnerId: winnerId || '',
      winnerName,
    };
  };

  const handleSettleAllBets = () => {
    const betsToSettle = pendingBetsForCompletedFights
      .map(bet => {
        const result = getBetResult(bet);
        if (!result) return null;
        return {
          bet,
          winnerId: result.winnerId,
          note: `Auto-settled for completed fight on ${new Date().toLocaleDateString()}`,
        };
      })
      .filter(Boolean) as Array<{ bet: Bet; winnerId: string; note: string }>;

    if (betsToSettle.length === 0) {
      toast.error('No valid bets to settle');
      return;
    }

    onSettleBets(betsToSettle);
    toast.success(`${betsToSettle.length} bet(s) settled successfully!`);
  };

  if (pendingBetsForCompletedFights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settle Bets</CardTitle>
          <CardDescription>Settle bets for completed fights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No pending bets for completed fights. All bets are either settled or fights haven't concluded yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settle Bets</CardTitle>
        <CardDescription>
          {pendingBetsForCompletedFights.length} pending bet(s) ready to settle for completed fights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex items-start gap-3">
          <Warning className="w-5 h-5 text-accent mt-0.5" weight="bold" />
          <div className="flex-1 text-sm">
            <p className="font-semibold mb-1">Bets Ready for Settlement</p>
            <p className="text-muted-foreground">
              These bets are for completed fights with declared winners. Click the button below to settle all pending bets.
            </p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bettor</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Fighter Bet On</TableHead>
                <TableHead>Winner</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingBetsForCompletedFights.map((bet) => {
                const result = getBetResult(bet);
                const didWin = result && bet.fighterId === result.winnerId;
                
                return (
                  <TableRow key={bet.id}>
                    <TableCell>
                      <div className="font-medium">{bet.bettorName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{bet.bettorStateId}</div>
                    </TableCell>
                    <TableCell className="text-sm">{bet.eventName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{bet.fighterName}</Badge>
                      <div className="text-xs text-muted-foreground">vs {bet.opponentName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{result?.winnerName}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">${bet.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {didWin ? (
                        <Badge className="bg-secondary">
                          <Check className="w-3 h-3 mr-1" weight="bold" />
                          Win
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Loss</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <Separator />

        <Button
          onClick={handleSettleAllBets}
          size="lg"
          className="w-full"
        >
          <CurrencyDollar className="w-5 h-5 mr-2" weight="bold" />
          Settle All {pendingBetsForCompletedFights.length} Bet(s)
        </Button>
      </CardContent>
    </Card>
  );
}
