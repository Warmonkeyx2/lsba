import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencyDollar, TrendUp, TrendDown, ChartLine, Lock, LockOpen } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Boxer } from '@/types/boxer';
import type { FightCard, Bout } from '@/types/fightCard';
import type { Bet, BettingPool, FightOdds, EventType } from '@/types/betting';
import {
  createBettingPool,
  generateFightOdds,
  formatOdds,
  calculatePayout,
  validateBet,
  BETTING_LIMITS,
} from '@/lib/bettingUtils';

interface BettingManagerProps {
  fightCards: FightCard[];
  boxers: Boxer[];
  bets: Bet[];
  bettingPools: BettingPool[];
  onPlaceBet: (bet: Bet) => void;
  onUpdatePool: (pool: BettingPool) => void;
}

export function BettingManager({
  fightCards,
  boxers,
  bets,
  bettingPools,
  onPlaceBet,
  onUpdatePool,
}: BettingManagerProps) {
  const [selectedFightCard, setSelectedFightCard] = useState<string>('');
  const [selectedFight, setSelectedFight] = useState<string>('');
  const [selectedFighter, setSelectedFighter] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('');
  const [oddsFormat, setOddsFormat] = useState<'american' | 'decimal' | 'fractional'>('american');
  const [eventType, setEventType] = useState<EventType>('regular');

  const upcomingFightCards = fightCards.filter(fc => fc.status === 'upcoming');

  const currentPool = useMemo(() => {
    if (!selectedFightCard) return null;
    return bettingPools.find(p => p.fightCardId === selectedFightCard);
  }, [selectedFightCard, bettingPools]);

  const currentFightOdds = useMemo(() => {
    if (!currentPool || !selectedFight) return null;
    return currentPool.fights.find(f => f.fightId === selectedFight);
  }, [currentPool, selectedFight]);

  const selectedFightCard_data = upcomingFightCards.find(fc => fc.id === selectedFightCard);
  const allBouts = selectedFightCard_data
    ? [
        selectedFightCard_data.mainEvent,
        ...(selectedFightCard_data.coMainEvent ? [selectedFightCard_data.coMainEvent] : []),
        ...selectedFightCard_data.otherBouts,
      ]
    : [];

  const selectedBout = allBouts.find(b => b.id === selectedFight);

  useEffect(() => {
    if (selectedFightCard && !currentPool) {
      const fightCardData = upcomingFightCards.find(fc => fc.id === selectedFightCard);
      if (!fightCardData) return;

      const bouts = [
        fightCardData.mainEvent,
        ...(fightCardData.coMainEvent ? [fightCardData.coMainEvent] : []),
        ...fightCardData.otherBouts,
      ];

      const fights = bouts
        .filter(b => b.fighter1Id && b.fighter2Id)
        .map(b => {
          const fighter1 = boxers.find(boxer => boxer.id === b.fighter1Id);
          const fighter2 = boxers.find(boxer => boxer.id === b.fighter2Id);
          if (!fighter1 || !fighter2) return null;
          return { fighter1, fighter2, fightId: b.id };
        })
        .filter(Boolean) as Array<{ fighter1: Boxer; fighter2: Boxer; fightId: string }>;

      const newPool = createBettingPool(
        selectedFightCard,
        fightCardData.mainEvent.title || `LSBA Event - ${fightCardData.eventDate}`,
        fightCardData.eventDate,
        fights,
        boxers,
        eventType,
        bets
      );

      onUpdatePool(newPool);
    }
  }, [selectedFightCard, currentPool, upcomingFightCards, boxers, bets, eventType, onUpdatePool]);

  const handlePlaceBet = () => {
    if (!selectedFightCard || !selectedFight || !selectedFighter || !betAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    const validation = validateBet(amount, eventType);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    if (!currentFightOdds || !selectedBout) {
      toast.error('Fight odds not available');
      return;
    }

    const fighter = boxers.find(b => b.id === selectedFighter);
    const opponent = boxers.find(b =>
      b.id === (selectedFighter === selectedBout.fighter1Id ? selectedBout.fighter2Id : selectedBout.fighter1Id)
    );

    if (!fighter || !opponent) {
      toast.error('Fighter not found');
      return;
    }

    const odds =
      selectedFighter === currentFightOdds.fighter1Id
        ? currentFightOdds.fighter1Odds
        : currentFightOdds.fighter2Odds;

    const potentialPayout = calculatePayout(amount, odds, oddsFormat);

    const bet: Bet = {
      id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current-user',
      userName: 'LSBA User',
      fightId: selectedFight,
      fightCardId: selectedFightCard,
      eventName: currentPool?.eventName || 'LSBA Event',
      eventDate: currentPool?.eventDate || '',
      fighterId: selectedFighter,
      fighterName: `${fighter.firstName} ${fighter.lastName}`,
      opponentName: `${opponent.firstName} ${opponent.lastName}`,
      amount,
      odds,
      potentialPayout,
      placedDate: new Date().toISOString(),
      status: 'pending',
    };

    onPlaceBet(bet);

    const updatedFightOdds = generateFightOdds(
      selectedFight,
      boxers.find(b => b.id === selectedBout.fighter1Id)!,
      boxers.find(b => b.id === selectedBout.fighter2Id)!,
      boxers,
      [...bets, bet],
      oddsFormat
    );

    if (currentPool) {
      const updatedPool: BettingPool = {
        ...currentPool,
        fights: currentPool.fights.map(f =>
          f.fightId === selectedFight ? updatedFightOdds : f
        ),
        totalBetsPlaced: currentPool.totalBetsPlaced + 1,
        totalPoolAmount: currentPool.totalPoolAmount + amount,
      };
      onUpdatePool(updatedPool);
    }

    toast.success(`Bet placed! Potential payout: $${potentialPayout.toLocaleString()}`);
    setBetAmount('');
    setSelectedFighter('');
  };

  const userBets = bets.filter(b => b.userId === 'current-user');
  const activeBets = userBets.filter(b => b.status === 'pending');
  const settledBets = userBets.filter(b => b.status === 'won' || b.status === 'lost');

  const totalWagered = userBets.reduce((sum, b) => sum + b.amount, 0);
  const totalWon = userBets.filter(b => b.status === 'won').reduce((sum, b) => sum + (b.actualPayout || 0), 0);
  const profitLoss = totalWon - totalWagered;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
          Betting System
        </h2>
        <p className="text-muted-foreground mt-1">
          Place bets on upcoming fights with dynamic odds
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-primary">{activeBets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Wagered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">${totalWagered.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Won</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-secondary">${totalWon.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-display font-bold ${profitLoss >= 0 ? 'text-secondary' : 'text-destructive'}`}>
              {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="place-bet" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="place-bet">Place Bet</TabsTrigger>
          <TabsTrigger value="active-bets">Active Bets ({activeBets.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="place-bet" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Place Your Bet</CardTitle>
              <CardDescription>Select a fight and place your wager</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">
                        Regular Event (${BETTING_LIMITS.regular.minimum.toLocaleString()} min)
                      </SelectItem>
                      <SelectItem value="special">
                        Special Event (${BETTING_LIMITS.special.minimum.toLocaleString()} min)
                      </SelectItem>
                      <SelectItem value="tournament">
                        Tournament (${BETTING_LIMITS.tournament.entryPerBoxer.toLocaleString()} entry)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Odds Format</Label>
                  <Select value={oddsFormat} onValueChange={(v) => setOddsFormat(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="american">American (e.g. +150, -200)</SelectItem>
                      <SelectItem value="decimal">Decimal (e.g. 2.50)</SelectItem>
                      <SelectItem value="fractional">Fractional (e.g. 3/2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Fight Card</Label>
                  <Select value={selectedFightCard} onValueChange={setSelectedFightCard}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {upcomingFightCards.map((fc) => (
                        <SelectItem key={fc.id} value={fc.id!}>
                          {fc.mainEvent.title || 'LSBA Event'} - {new Date(fc.eventDate).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedFightCard && (
                  <div className="space-y-2">
                    <Label>Select Fight</Label>
                    <Select value={selectedFight} onValueChange={setSelectedFight}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a fight..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allBouts.map((bout) => (
                          <SelectItem key={bout.id} value={bout.id}>
                            {bout.fighter1} vs {bout.fighter2}
                            {bout.type === 'main' && ' (Main Event)'}
                            {bout.type === 'co-main' && ' (Co-Main)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedFight && currentFightOdds && selectedBout && (
                  <>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wide">Current Odds</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setSelectedFighter(currentFightOdds.fighter1Id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedFighter === currentFightOdds.fighter1Id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-semibold">{selectedBout.fighter1}</div>
                          <div className="text-2xl font-display font-bold text-primary mt-1">
                            {formatOdds(
                              currentFightOdds.fighter1Odds,
                              oddsFormat,
                              currentFightOdds.fighter1ImpliedProbability
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {(currentFightOdds.fighter1ImpliedProbability * 100).toFixed(1)}% probability
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Pool: ${currentFightOdds.fighter1Bets.toLocaleString()}
                          </div>
                        </button>

                        <button
                          onClick={() => setSelectedFighter(currentFightOdds.fighter2Id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedFighter === currentFightOdds.fighter2Id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-semibold">{selectedBout.fighter2}</div>
                          <div className="text-2xl font-display font-bold text-primary mt-1">
                            {formatOdds(
                              currentFightOdds.fighter2Odds,
                              oddsFormat,
                              currentFightOdds.fighter2ImpliedProbability
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {(currentFightOdds.fighter2ImpliedProbability * 100).toFixed(1)}% probability
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Pool: ${currentFightOdds.fighter2Bets.toLocaleString()}
                          </div>
                        </button>
                      </div>
                      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                        Total Pool: ${currentFightOdds.totalPool.toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Bet Amount (Minimum: ${
                        eventType === 'tournament' 
                          ? BETTING_LIMITS.tournament.entryPerBoxer.toLocaleString()
                          : (BETTING_LIMITS[eventType] as { minimum: number }).minimum.toLocaleString()
                      })</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount..."
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        min={
                          eventType === 'tournament'
                            ? BETTING_LIMITS.tournament.entryPerBoxer
                            : (BETTING_LIMITS[eventType] as { minimum: number }).minimum
                        }
                        step="100"
                      />
                    </div>

                    {betAmount && selectedFighter && (
                      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Potential Payout:</span>
                          <span className="text-2xl font-display font-bold text-accent">
                            ${calculatePayout(
                              parseFloat(betAmount),
                              selectedFighter === currentFightOdds.fighter1Id
                                ? currentFightOdds.fighter1Odds
                                : currentFightOdds.fighter2Odds,
                              oddsFormat
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-muted-foreground">Profit:</span>
                          <span className="text-lg font-semibold text-secondary">
                            ${(
                              calculatePayout(
                                parseFloat(betAmount),
                                selectedFighter === currentFightOdds.fighter1Id
                                  ? currentFightOdds.fighter1Odds
                                  : currentFightOdds.fighter2Odds,
                                oddsFormat
                              ) - parseFloat(betAmount)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handlePlaceBet}
                      disabled={!selectedFighter || !betAmount}
                      size="lg"
                      className="w-full"
                    >
                      <CurrencyDollar className="w-5 h-5 mr-2" weight="bold" />
                      Place Bet
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-bets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Bets</CardTitle>
              <CardDescription>Your pending wagers</CardDescription>
            </CardHeader>
            <CardContent>
              {activeBets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active bets. Place a bet to get started!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Fight</TableHead>
                      <TableHead>Fighter</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Odds</TableHead>
                      <TableHead>Potential Payout</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBets.map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell className="font-medium">{bet.eventName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-semibold">{bet.fighterName}</div>
                            <div className="text-muted-foreground">vs {bet.opponentName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{bet.fighterName}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">${bet.amount.toLocaleString()}</TableCell>
                        <TableCell className="font-mono">{formatOdds(bet.odds, 'american')}</TableCell>
                        <TableCell className="font-semibold text-secondary">
                          ${bet.potentialPayout.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(bet.placedDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Betting History</CardTitle>
              <CardDescription>Your settled bets</CardDescription>
            </CardHeader>
            <CardContent>
              {settledBets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No betting history yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Fighter</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Odds</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Payout</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settledBets.map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell className="font-medium">{bet.eventName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{bet.fighterName}</Badge>
                        </TableCell>
                        <TableCell>${bet.amount.toLocaleString()}</TableCell>
                        <TableCell className="font-mono">{formatOdds(bet.odds, 'american')}</TableCell>
                        <TableCell>
                          <Badge variant={bet.status === 'won' ? 'default' : 'destructive'}>
                            {bet.status === 'won' ? (
                              <TrendUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendDown className="w-3 h-3 mr-1" />
                            )}
                            {bet.status}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`font-semibold ${
                            bet.status === 'won' ? 'text-secondary' : 'text-destructive'
                          }`}
                        >
                          {bet.status === 'won' ? '+' : '-'}${(bet.actualPayout || bet.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(bet.settledDate || bet.placedDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
