import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const [selectedBets, setSelectedBets] = useState<Set<string>>(new Set());
  const [settlementNote, setSettlementNote] = useState('');

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

  const handleToggleBet = (betId: string) => {
    const newSelected = new Set(selectedBets);
    if (newSelected.has(betId)) {
      newSelected.delete(betId);
    } else {
      newSelected.add(betId);
    }
    setSelectedBets(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedBets.size === pendingBetsForCompletedFights.length) {
      setSelectedBets(new Set());
    } else {
      setSelectedBets(new Set(pendingBetsForCompletedFights.map(b => b.id)));
    }
  };

  const handleSettleBets = () => {
    if (selectedBets.size === 0) {
      toast.error('Please select at least one bet to settle');
      return;
    }

    if (!settlementNote.trim()) {
      toast.error('Please enter a settlement note before settling bets');
      return;
    }

    const betsToSettle = pendingBetsForCompletedFights
      .filter(bet => selectedBets.has(bet.id))
      .map(bet => {
        const result = getBetResult(bet);
        if (!result) return null;
        return {
          bet,
          winnerId: result.winnerId,
          note: settlementNote.trim(),
        };
      })
      .filter(Boolean) as Array<{ bet: Bet; winnerId: string; note: string }>;

    if (betsToSettle.length === 0) {
      toast.error('No valid bets to settle');
      return;
    }

    onSettleBets(betsToSettle);
    setSelectedBets(new Set());
    setSettlementNote('');
    toast.success(`${betsToSettle.length} bet(s) settled successfully!`);
  };

  if (pendingBetsForCompletedFights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settle Bets</CardTitle>
          <CardDescription>Manually settle bets for completed fights</CardDescription>
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
          Review and settle {pendingBetsForCompletedFights.length} pending bet(s) for completed fights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex items-start gap-3">
          <Warning className="w-5 h-5 text-accent mt-0.5" weight="bold" />
          <div className="flex-1 text-sm">
            <p className="font-semibold mb-1">Important: Manual Settlement Required</p>
            <p className="text-muted-foreground">
              All bets remain pending until you manually review and settle them. Select the bets you want to settle, 
              add a settlement note (required), and confirm settlement.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedBets.size === pendingBetsForCompletedFights.length}
                onCheckedChange={handleToggleAll}
              />
              <Label htmlFor="select-all" className="cursor-pointer font-semibold">
                Select All ({pendingBetsForCompletedFights.length})
              </Label>
            </div>
            <Badge variant="outline">
              {selectedBets.size} selected
            </Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
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
                    <TableRow key={bet.id} className={selectedBets.has(bet.id) ? 'bg-muted/50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedBets.has(bet.id)}
                          onCheckedChange={() => handleToggleBet(bet.id)}
                        />
                      </TableCell>
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
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settlement-note" className="font-semibold">
              Settlement Note <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="settlement-note"
              placeholder="Enter a note about this settlement (e.g., 'Settled after fight card completion on [date]', 'Paid out to bettors', etc.)"
              value={settlementNote}
              onChange={(e) => setSettlementNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This note will be recorded with all selected bets for audit purposes
            </p>
          </div>

          <Button
            onClick={handleSettleBets}
            disabled={selectedBets.size === 0 || !settlementNote.trim()}
            size="lg"
            className="w-full"
          >
            <CurrencyDollar className="w-5 h-5 mr-2" weight="bold" />
            Settle {selectedBets.size} Bet(s)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
