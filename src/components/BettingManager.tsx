import { useState, useEffect, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CurrencyDollar, TrendUp, TrendDown, ChartLine, Lock, LockOpen, Sliders, Receipt } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Boxer } from '@/types/boxer';
import type { FightCard } from '@/types/fightCard';
import type { Bet, BettingPool, FightOdds, EventType, PayoutSettings } from '@/types/betting';
import {
  createBettingPool,
  generateFightOdds,
  formatOdds,
  calculatePayout,
  validateBet,
  BETTING_LIMITS,
  DEFAULT_PAYOUT_SETTINGS,
  CASINO_NAME,
  calculatePayoutBreakdown,
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
  const [payoutSettings, setPayoutSettings] = useKV<PayoutSettings>('lsba-payout-settings', DEFAULT_PAYOUT_SETTINGS);
  const [selectedFightCard, setSelectedFightCard] = useState<string>('');
  const [selectedFight, setSelectedFight] = useState<string>('');
  const [selectedFighter, setSelectedFighter] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('');
  const [bettorStateId, setBettorStateId] = useState<string>('');
  const [bettorName, setBettorName] = useState<string>('');
  const [oddsFormat, setOddsFormat] = useState<'american' | 'decimal' | 'fractional'>('american');
  const [eventType, setEventType] = useState<EventType>('regular');
  const [maxBetLimit, setMaxBetLimit] = useState<string>('');
  const [editingFightId, setEditingFightId] = useState<string>('');

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
        bets,
        payoutSettings || DEFAULT_PAYOUT_SETTINGS
      );

      onUpdatePool(newPool);
    }
  }, [selectedFightCard, currentPool, upcomingFightCards, boxers, bets, eventType, onUpdatePool, payoutSettings]);

  const handlePlaceBet = () => {
    if (!selectedFightCard || !selectedFight || !selectedFighter || !betAmount || !bettorStateId || !bettorName) {
      toast.error('Please fill in all fields including bettor State ID and name');
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

    if (currentFightOdds.maxBetLimit && amount > currentFightOdds.maxBetLimit) {
      toast.error(`Maximum bet limit for this fight is $${currentFightOdds.maxBetLimit.toLocaleString()}`);
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
      bettorStateId: bettorStateId.trim(),
      bettorName: bettorName.trim(),
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
          f.fightId === selectedFight ? { ...updatedFightOdds, maxBetLimit: f.maxBetLimit } : f
        ),
        totalBetsPlaced: currentPool.totalBetsPlaced + 1,
        totalPoolAmount: currentPool.totalPoolAmount + amount,
      };
      onUpdatePool(updatedPool);
    }

    const lsbaFee = (amount * ((payoutSettings || DEFAULT_PAYOUT_SETTINGS).lsbaFeePercentage)) / 100;
    const bettorPayout = potentialPayout - lsbaFee;
    toast.success(
      `Bet placed for ${bettorName}! Potential bettor payout: $${bettorPayout.toLocaleString()}`
    );
    setBetAmount('');
    setSelectedFighter('');
    setBettorStateId('');
    setBettorName('');
  };

  const handleUpdateMaxBet = (fightId: string) => {
    if (!currentPool) return;

    const limit = maxBetLimit ? parseFloat(maxBetLimit) : undefined;
    
    const updatedPool: BettingPool = {
      ...currentPool,
      fights: currentPool.fights.map(f =>
        f.fightId === fightId ? { ...f, maxBetLimit: limit } : f
      ),
    };

    onUpdatePool(updatedPool);
    toast.success(limit ? `Max bet set to $${limit.toLocaleString()}` : 'Max bet limit removed');
    setMaxBetLimit('');
    setEditingFightId('');
  };

  const handleUpdatePayoutSettings = () => {
    if (!payoutSettings) return;

    if (payoutSettings.lsbaFeePercentage < 0 || payoutSettings.lsbaFeePercentage > 100) {
      toast.error('LSBA fee must be between 0% and 100%');
      return;
    }

    setPayoutSettings(payoutSettings);
    toast.success('Payout settings updated!');
  };

  const allBets = bets;
  const activeBets = allBets.filter(b => b.status === 'pending');
  const settledBets = allBets.filter(b => b.status === 'won' || b.status === 'lost');

  const totalWagered = allBets.reduce((sum, b) => sum + b.amount, 0);
  const totalWonByBettors = allBets.filter(b => b.status === 'won').reduce((sum, b) => sum + (b.actualPayout || 0), 0);
  
  const totalBookerRevenue = allBets
    .filter(b => b.payoutBreakdown)
    .reduce((sum, b) => sum + (b.payoutBreakdown?.bookerProfit || 0), 0);

  const totalLsbaRevenue = allBets
    .filter(b => b.payoutBreakdown)
    .reduce((sum, b) => sum + (b.payoutBreakdown?.lsbaFee || 0), 0);

  const currentSettings = payoutSettings || DEFAULT_PAYOUT_SETTINGS;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
            {CASINO_NAME} Bookmaking
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage bets, odds, and payouts for LSBA fights
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Sliders className="w-4 h-4 mr-2" />
              Payout Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Configure LSBA Fee</DialogTitle>
              <DialogDescription>
                Set the percentage LSBA receives from every bet (win or lose). This is always calculated from the original bet amount.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>LSBA Fee (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={currentSettings.lsbaFeePercentage}
                  onChange={(e) =>
                    setPayoutSettings((current) => ({
                      ...(current || DEFAULT_PAYOUT_SETTINGS),
                      lsbaFeePercentage: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  LSBA gets this percentage of every bet placed, regardless of outcome
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="font-semibold text-lg mb-2">How Payouts Work:</div>
                <div className="text-sm space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>LSBA Fee:</strong> Always {currentSettings.lsbaFeePercentage}% of the original bet</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>Winning Bet:</strong> Bettor gets total winnings minus LSBA fee</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>Losing Bet:</strong> {CASINO_NAME} keeps bet amount minus LSBA fee</span>
                  </div>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <div className="text-sm font-semibold mb-2">Example ($2,000 bet):</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>LSBA Fee:</span>
                    <span className="font-semibold">${(2000 * currentSettings.lsbaFeePercentage / 100).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>If Win (at 2:1 odds):</span>
                    <span className="font-semibold text-secondary">${(4000 - (2000 * currentSettings.lsbaFeePercentage / 100)).toFixed(0)} to bettor</span>
                  </div>
                  <div className="flex justify-between">
                    <span>If Lose:</span>
                    <span className="font-semibold">${(2000 - (2000 * currentSettings.lsbaFeePercentage / 100)).toFixed(0)} to {CASINO_NAME}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleUpdatePayoutSettings} className="w-full">
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">${totalWagered.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{CASINO_NAME} Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-secondary">${totalBookerRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">LSBA Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-accent">${totalLsbaRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="place-bet" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="place-bet">Place Bet</TabsTrigger>
          <TabsTrigger value="active-bets">Active ({activeBets.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="place-bet" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Book a Bet</CardTitle>
              <CardDescription>Collect State ID and place bet for a bettor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">Bettor Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>State ID *</Label>
                    <Input
                      placeholder="Enter bettor's State ID..."
                      value={bettorStateId}
                      onChange={(e) => setBettorStateId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bettor Name *</Label>
                    <Input
                      placeholder="Enter bettor's name..."
                      value={bettorName}
                      onChange={(e) => setBettorName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

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
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-sm uppercase tracking-wide">Current Odds</h4>
                        {currentFightOdds.maxBetLimit && (
                          <Badge variant="outline">
                            Max: ${currentFightOdds.maxBetLimit.toLocaleString()}
                          </Badge>
                        )}
                      </div>
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
                      <Label>
                        Bet Amount (Minimum: $
                        {eventType === 'tournament'
                          ? BETTING_LIMITS.tournament.entryPerBoxer.toLocaleString()
                          : (BETTING_LIMITS[eventType] as { minimum: number }).minimum.toLocaleString()}
                        )
                      </Label>
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
                      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Potential Payout:</span>
                          <span className="text-2xl font-display font-bold text-accent">
                            $
                            {calculatePayout(
                              parseFloat(betAmount),
                              selectedFighter === currentFightOdds.fighter1Id
                                ? currentFightOdds.fighter1Odds
                                : currentFightOdds.fighter2Odds,
                              oddsFormat
                            ).toLocaleString()}
                          </span>
                        </div>

                        <Separator />

                        <div className="text-sm space-y-1">
                          {(() => {
                            const betAmountNum = parseFloat(betAmount);
                            const totalPayout = calculatePayout(
                              betAmountNum,
                              selectedFighter === currentFightOdds.fighter1Id
                                ? currentFightOdds.fighter1Odds
                                : currentFightOdds.fighter2Odds,
                              oddsFormat
                            );
                            const lsbaFee = (betAmountNum * currentSettings.lsbaFeePercentage) / 100;
                            const bettorPayout = totalPayout - lsbaFee;
                            const bookerProfit = betAmountNum - totalPayout;
                            
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Bettor receives:</span>
                                  <span className="font-semibold text-secondary">
                                    ${bettorPayout.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">LSBA Fee:</span>
                                  <span className="font-semibold">
                                    ${lsbaFee.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{CASINO_NAME} Profit:</span>
                                  <span className="font-semibold">
                                    ${bookerProfit.toLocaleString()}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handlePlaceBet}
                      disabled={!selectedFighter || !betAmount || !bettorStateId || !bettorName}
                      size="lg"
                      className="w-full"
                    >
                      <CurrencyDollar className="w-5 h-5 mr-2" weight="bold" />
                      Book Bet
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
              <CardDescription>All pending wagers from bettors</CardDescription>
            </CardHeader>
            <CardContent>
              {activeBets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active bets. Book a bet to get started!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bettor</TableHead>
                      <TableHead>State ID</TableHead>
                      <TableHead>Event</TableHead>
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
                        <TableCell className="font-medium">{bet.bettorName}</TableCell>
                        <TableCell className="font-mono text-xs">{bet.bettorStateId}</TableCell>
                        <TableCell className="text-sm">{bet.eventName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{bet.fighterName}</Badge>
                          <div className="text-xs text-muted-foreground">vs {bet.opponentName}</div>
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
              <CardDescription>All settled bets with payout breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {settledBets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No betting history yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bettor</TableHead>
                      <TableHead>Fighter</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Bettor Payout</TableHead>
                      <TableHead>Breakdown</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settledBets.map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell className="font-medium">
                          {bet.bettorName}
                          <div className="text-xs text-muted-foreground font-mono">{bet.bettorStateId}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{bet.fighterName}</Badge>
                        </TableCell>
                        <TableCell>${bet.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={bet.status === 'won' ? 'default' : 'destructive'}>
                            {bet.status === 'won' ? <TrendUp className="w-3 h-3 mr-1" /> : <TrendDown className="w-3 h-3 mr-1" />}
                            {bet.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-semibold ${bet.status === 'won' ? 'text-secondary' : 'text-destructive'}`}>
                          {bet.status === 'won' ? '$' : '-$'}
                          {(bet.actualPayout || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {bet.payoutBreakdown && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Receipt className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Payout Breakdown</DialogTitle>
                                  <DialogDescription>Distribution for this bet</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-4">
                                  <div className="flex justify-between">
                                    <span>Original Bet:</span>
                                    <span className="font-bold">${bet.payoutBreakdown.originalBet.toLocaleString()}</span>
                                  </div>
                                  <Separator />
                                  <div className="flex justify-between">
                                    <span>Bettor Payout:</span>
                                    <span className="font-semibold text-secondary">${bet.payoutBreakdown.bettorPayout.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>LSBA Fee:</span>
                                    <span className="font-semibold">${bet.payoutBreakdown.lsbaFee.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{CASINO_NAME} Profit:</span>
                                    <span className="font-semibold">${bet.payoutBreakdown.bookerProfit.toLocaleString()}</span>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
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

        <TabsContent value="limits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bet Limits Management</CardTitle>
              <CardDescription>Set maximum bet amounts for individual fights</CardDescription>
            </CardHeader>
            <CardContent>
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

                {currentPool && (
                  <div className="space-y-3">
                    {currentPool.fights.map((fight) => {
                      const bout = allBouts.find((b) => b.id === fight.fightId);
                      if (!bout) return null;

                      return (
                        <div key={fight.fightId} className="bg-muted/50 rounded-lg p-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="font-semibold">
                                {bout.fighter1} vs {bout.fighter2}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {fight.maxBetLimit
                                  ? `Max Bet: $${fight.maxBetLimit.toLocaleString()}`
                                  : 'No limit set'}
                              </div>
                            </div>
                            {editingFightId === fight.fightId ? (
                              <div className="flex gap-2 items-center">
                                <Input
                                  type="number"
                                  placeholder="Max bet..."
                                  value={maxBetLimit}
                                  onChange={(e) => setMaxBetLimit(e.target.value)}
                                  className="w-32"
                                  step="1000"
                                  min="0"
                                />
                                <Button size="sm" onClick={() => handleUpdateMaxBet(fight.fightId)}>
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingFightId('')}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingFightId(fight.fightId);
                                  setMaxBetLimit(fight.maxBetLimit?.toString() || '');
                                }}
                              >
                                Set Limit
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
