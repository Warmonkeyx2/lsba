import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CurrencyDollar, CheckCircle, WarningCircle, XCircle } from '@phosphor-icons/react';
import type { Boxer } from '@/types/boxer';
import { isLicenseValid, getDaysUntilDue, processPayment, LICENSE_FEE } from '@/lib/licenseUtils';
import { toast } from 'sonner';

interface LicenseManagerProps {
  boxers: Boxer[];
  onUpdateBoxer: (boxer: Boxer) => void;
}

export function LicenseManager({ boxers = [], onUpdateBoxer }: LicenseManagerProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'dueSoon'>('all');

  const getFilteredBoxers = () => {
    const boxerList = boxers ?? [];
    let filtered = [...boxerList];

    if (filter === 'active') {
      filtered = filtered.filter(b => isLicenseValid(b) && getDaysUntilDue(b) > 7);
    } else if (filter === 'expired') {
      filtered = filtered.filter(b => !isLicenseValid(b));
    } else if (filter === 'dueSoon') {
      filtered = filtered.filter(b => {
        const days = getDaysUntilDue(b);
        return days >= 0 && days <= 7;
      });
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

  const filteredBoxers = getFilteredBoxers();
  const boxerList = boxers ?? [];

  const stats = {
    total: boxerList.length,
    active: boxerList.filter(b => isLicenseValid(b) && getDaysUntilDue(b) > 7).length,
    dueSoon: boxerList.filter(b => {
      const days = getDaysUntilDue(b);
      return days >= 0 && days <= 7;
    }).length,
    expired: boxerList.filter(b => !isLicenseValid(b)).length,
  };

  const getLicenseStatusBadge = (boxer: Boxer) => {
    if (!isLicenseValid(boxer)) {
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            return (
              <Card key={boxer.id} className="p-6">
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
                      </div>
                      <div className="text-sm text-muted-foreground">
                        State ID: {boxer.stateId}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
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
                    <Button
                      onClick={() => handleProcessPayment(boxer)}
                      className="bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      <CurrencyDollar className="w-4 h-4 mr-2" />
                      Process Payment (${LICENSE_FEE.toLocaleString()})
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
