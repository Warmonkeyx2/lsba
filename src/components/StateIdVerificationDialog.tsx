import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Shield, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Bet } from '@/types/betting';

interface StateIdVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  betsToSettle: Array<{ bet: Bet; winnerId: string; note: string }>;
  title?: string;
  description?: string;
}

export function StateIdVerificationDialog({
  isOpen,
  onClose,
  onConfirm,
  betsToSettle,
  title = 'State ID Verification Required',
  description = 'Please verify State IDs for all bettors before settling bets.',
}: StateIdVerificationDialogProps) {
  const [verifications, setVerifications] = useState<Record<string, string>>({});
  const [verifiedBets, setVerifiedBets] = useState<Set<string>>(new Set());

  const handleStateIdInput = (betId: string, enteredStateId: string) => {
    setVerifications(prev => ({ ...prev, [betId]: enteredStateId }));
    
    const bet = betsToSettle.find(b => b.bet.id === betId)?.bet;
    if (bet && enteredStateId.toLowerCase() === bet.bettorStateId.toLowerCase()) {
      setVerifiedBets(prev => new Set(prev).add(betId));
    } else {
      setVerifiedBets(prev => {
        const newSet = new Set(prev);
        newSet.delete(betId);
        return newSet;
      });
    }
  };

  const allVerified = betsToSettle.length > 0 && 
    betsToSettle.every(({ bet }) => verifiedBets.has(bet.id));

  const handleConfirm = () => {
    if (!allVerified) {
      toast.error('All State IDs must be verified before settlement');
      return;
    }
    
    toast.success('State ID verification completed successfully');
    onConfirm();
  };

  const handleClose = () => {
    setVerifications({});
    setVerifiedBets(new Set());
    onClose();
  };

  const totalAmount = betsToSettle.reduce((sum, { bet }) => sum + bet.amount, 0);
  const winningBetsCount = betsToSettle.filter(({ bet, winnerId }) => bet.fighterId === winnerId).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description} Total bets: {betsToSettle.length} | Total value: ${totalAmount.toLocaleString()} | Winning bets: {winningBetsCount}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Security Verification Required
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  For each bettor below, enter their exact State ID as it appears in their betting records. 
                  All State IDs must be verified before bet settlement can proceed.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {betsToSettle.map(({ bet, winnerId, note }) => {
              const isWinningBet = bet.fighterId === winnerId;
              const isVerified = verifiedBets.has(bet.id);
              const enteredValue = verifications[bet.id] || '';

              return (
                <div 
                  key={bet.id} 
                  className={`border rounded-lg p-4 transition-colors ${
                    isVerified 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{bet.bettorName}</span>
                        <Badge variant={isWinningBet ? 'default' : 'destructive'}>
                          {isWinningBet ? 'Winner' : 'Loser'}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          ${bet.amount.toLocaleString()}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div>Event: {bet.eventName}</div>
                        <div>Bet on: {bet.fighterName} vs {bet.opponentName}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label htmlFor={`stateId-${bet.id}`} className="text-sm font-medium">
                            Enter State ID for verification:
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              id={`stateId-${bet.id}`}
                              type="text"
                              placeholder="Enter State ID exactly as recorded..."
                              value={enteredValue}
                              onChange={(e) => handleStateIdInput(bet.id, e.target.value)}
                              className={`font-mono ${
                                isVerified ? 'border-green-300 bg-green-50' : ''
                              }`}
                            />
                            {isVerified && (
                              <div className="flex items-center text-green-600 dark:text-green-400">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                            {enteredValue && !isVerified && (
                              <div className="flex items-center text-red-500">
                                <X className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 font-mono">
                        Expected: {bet.bettorStateId}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              Verified: {verifiedBets.size} of {betsToSettle.length} bettors
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={!allVerified}
                className="min-w-[120px]"
              >
                {allVerified ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Settle Bets
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify All ({verifiedBets.size}/{betsToSettle.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}