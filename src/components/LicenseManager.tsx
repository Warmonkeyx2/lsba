import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyDollar, CheckCircle, WarningCircle, XCircle, Prohibit, ProhibitInset } from '@phosphor-icons/react';
import type { Boxer } from '@/types/boxer';
import { isLicenseValid, getDaysUntilDue, processPayment, LICENSE_FEE } from '@/lib/licenseUtils';
import { toast } from 'sonner';

interface LicenseManagerProps {
  boxers: Boxer[];
  onUpdateBoxer: (boxer: Boxer) => void;
}

export function LicenseManager({ boxers = [], onUpdateBoxer }: LicenseManagerProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'dueSoon' | 'suspended'>('all');
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [selectedBoxer, setSelectedBoxer] = useState<Boxer | null>(null);
  const [suspensionAction, setSuspensionAction] = useState<'suspend' | 'ban'>('suspend');
  const [suspensionReason, setSuspensionReason] = useState('');

  const getFilteredBoxers = () => {
    const boxerList = boxers ?? [];
    let filtered = [...boxerList];

    if (filter === 'active') {
      filtered = filtered.filter(b => b.licenseStatus === 'active' && isLicenseValid(b) && getDaysUntilDue(b) > 7);
    } else if (filter === 'expired') {
      filtered = filtered.filter(b => b.licenseStatus === 'expired' || (!isLicenseValid(b) && b.licenseStatus === 'active'));
    } else if (filter === 'dueSoon') {
      filtered = filtered.filter(b => {
        const days = getDaysUntilDue(b);
        return b.licenseStatus === 'active' && days >= 0 && days <= 7;
      });
    } else if (filter === 'suspended') {
      filtered = filtered.filter(b => b.licenseStatus === 'suspended' || b.licenseStatus === 'banned');
    }

    return filtered.sort((a, b) => {
      const aDays = getDaysUntilDue(a);
      const bDays = getDaysUntilDue(b);
      return aDays - bDays;
    });
  };

  const handleProcessPayment = (boxer: Boxer) => {
    const updatedBoxer = processPayment(boxer);
    onUpdateBoxer(updatedBoxer);
    toast.success(`License renewed for ${boxer.firstName} ${boxer.lastName}`);
  };

  const handleOpenSuspendDialog = (boxer: Boxer, action: 'suspend' | 'ban') => {
    setSelectedBoxer(boxer);
    setSuspensionAction(action);
    setSuspensionReason('');
    setSuspendDialogOpen(true);
  };

  const handleSuspendBoxer = () => {
    if (!selectedBoxer || !suspensionReason.trim()) {
      toast.error('Please provide a reason for this action');
      return;
    }

    const updatedBoxer: Boxer = {
      ...selectedBoxer,
      licenseStatus: suspensionAction === 'ban' ? 'banned' : 'suspended',
      suspensionReason: suspensionReason.trim(),
      suspensionDate: new Date().toISOString(),
    };

    onUpdateBoxer(updatedBoxer);
    toast.success(
      `${selectedBoxer.firstName} ${selectedBoxer.lastName} has been ${suspensionAction === 'ban' ? 'banned' : 'suspended'}. State ID blocked from all activities except betting.`
    );
    setSuspendDialogOpen(false);
    setSelectedBoxer(null);
    setSuspensionReason('');
  };

  const handleReactivateBoxer = (boxer: Boxer) => {
    const updatedBoxer: Boxer = {
      ...boxer,
      licenseStatus: 'active',
      suspensionReason: undefined,
      suspensionDate: undefined,
    };

    onUpdateBoxer(updatedBoxer);
    toast.success(`${boxer.firstName} ${boxer.lastName} license has been reactivated`);
  };

  const filteredBoxers = getFilteredBoxers();
  const boxerList = boxers ?? [];

  const stats = {
    total: boxerList.length,
    active: boxerList.filter(b => b.licenseStatus === 'active' && isLicenseValid(b) && getDaysUntilDue(b) > 7).length,
    dueSoon: boxerList.filter(b => {
      const days = getDaysUntilDue(b);
      return b.licenseStatus === 'active' && days >= 0 && days <= 7;
    }).length,
    expired: boxerList.filter(b => b.licenseStatus === 'expired' || (!isLicenseValid(b) && b.licenseStatus === 'active')).length,
    suspended: boxerList.filter(b => b.licenseStatus === 'suspended' || b.licenseStatus === 'banned').length,
  };

  const getLicenseStatusBadge = (boxer: Boxer) => {
    if (boxer.licenseStatus === 'banned') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 bg-destructive">
          <ProhibitInset className="w-3 h-3" weight="fill" />
          BANNED
        </Badge>
      );
    }

    if (boxer.licenseStatus === 'suspended') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 bg-orange-500/80">
          <Prohibit className="w-3 h-3" />
          Suspended
        </Badge>
      );
    }

    if (!isLicenseValid(boxer) || boxer.licenseStatus === 'expired') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Expired
        </Badge>
      );
    }

    const days = getDaysUntilDue(boxer);
    if (days <= 7) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
          <WarningCircle className="w-3 h-3" />
          Due in {days} day{days !== 1 ? 's' : ''}
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/20 text-green-700 border-green-500/30">
        <CheckCircle className="w-3 h-3" />
        Active
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
          License Management
        </h2>
        <p className="text-muted-foreground mt-1">
          Track fighter licenses and monthly payments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Fighters</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-muted-foreground">Active Licenses</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.dueSoon}</div>
          <div className="text-sm text-muted-foreground">Due Soon (7 days)</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
          <div className="text-sm text-muted-foreground">Expired</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.suspended}</div>
          <div className="text-sm text-muted-foreground">Suspended/Banned</div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Fighters
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'dueSoon' ? 'default' : 'outline'}
          onClick={() => setFilter('dueSoon')}
        >
          Due Soon
        </Button>
        <Button
          variant={filter === 'expired' ? 'default' : 'outline'}
          onClick={() => setFilter('expired')}
        >
          Expired
        </Button>
        <Button
          variant={filter === 'suspended' ? 'default' : 'outline'}
          onClick={() => setFilter('suspended')}
        >
          Suspended/Banned
        </Button>
      </div>

      {filteredBoxers.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No fighters found for this filter</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBoxers.map((boxer) => {
            const isValid = isLicenseValid(boxer);
            const daysUntilDue = getDaysUntilDue(boxer);
            const isSuspendedOrBanned = boxer.licenseStatus === 'suspended' || boxer.licenseStatus === 'banned';

            return (
              <Card key={boxer.id} className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={boxer.profileImage} />
                        <AvatarFallback className="bg-primary/10 text-primary font-fighter text-lg">
                          {boxer.firstName[0]}{boxer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-fighter text-xl">
                            {boxer.firstName} {boxer.lastName}
                          </h3>
                          {getLicenseStatusBadge(boxer)}
                          {boxer.feePaid === false && (
                            <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">
                              Payment Pending
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          State ID: {boxer.stateId}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      {!isSuspendedOrBanned && (
                        <>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Last Payment: </span>
                            <span className="font-medium">
                              {new Date(boxer.lastPaymentDate).toLocaleDateString()}
                            </span>
                          </div>
                          {!isValid && (
                            <div className="text-sm text-destructive font-medium">
                              ⚠ Overdue by {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''}
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex gap-2">
                        {isSuspendedOrBanned ? (
                          <Button
                            onClick={() => handleReactivateBoxer(boxer)}
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-700 hover:bg-green-500/10"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Reactivate License
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleProcessPayment(boxer)}
                              className="bg-primary hover:bg-primary/90"
                              size="sm"
                            >
                              <CurrencyDollar className="w-4 h-4 mr-2" />
                              Process Payment (${LICENSE_FEE.toLocaleString()})
                            </Button>
                            <Button
                              onClick={() => handleOpenSuspendDialog(boxer, 'suspend')}
                              variant="outline"
                              size="sm"
                              className="border-orange-500 text-orange-700 hover:bg-orange-500/10"
                            >
                              <Prohibit className="w-4 h-4 mr-2" />
                              Suspend
                            </Button>
                            <Button
                              onClick={() => handleOpenSuspendDialog(boxer, 'ban')}
                              variant="outline"
                              size="sm"
                              className="border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <ProhibitInset className="w-4 h-4 mr-2" weight="fill" />
                              Ban
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSuspendedOrBanned && boxer.suspensionReason && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <ProhibitInset className="w-5 h-5 text-destructive mt-0.5" weight="fill" />
                        <div className="flex-1">
                          <div className="font-medium text-destructive mb-1">
                            {boxer.licenseStatus === 'banned' ? 'Ban' : 'Suspension'} Reason:
                          </div>
                          <p className="text-sm text-foreground">{boxer.suspensionReason}</p>
                          {boxer.suspensionDate && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Date: {new Date(boxer.suspensionDate).toLocaleDateString()}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            ⚠ State ID blocked from all activities except betting
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {suspensionAction === 'ban' ? 'Ban' : 'Suspend'} Fighter License
            </DialogTitle>
            <DialogDescription>
              {suspensionAction === 'ban' 
                ? 'This will permanently ban the fighter from all activities except betting. Their State ID will be blocked.'
                : 'This will temporarily suspend the fighter from all activities except betting. Their State ID will be blocked until reactivated.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedBoxer && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">
                  {selectedBoxer.firstName} {selectedBoxer.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  State ID: {selectedBoxer.stateId}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="suspension-reason">
                Reason for {suspensionAction === 'ban' ? 'ban' : 'suspension'} *
              </Label>
              <Textarea
                id="suspension-reason"
                placeholder={`Explain why this fighter is being ${suspensionAction === 'ban' ? 'banned' : 'suspended'}...`}
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspendBoxer}
              disabled={!suspensionReason.trim()}
            >
              {suspensionAction === 'ban' ? 'Ban Fighter' : 'Suspend Fighter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
