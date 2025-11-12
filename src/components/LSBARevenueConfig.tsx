import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Settings, 
  Trophy,
  Target,
  Percent,
  Calculator,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import type { PayoutSettings } from '@/types/betting';

interface LSBARevenueConfigProps {
  settings: PayoutSettings;
  onUpdateSettings: (settings: PayoutSettings) => void;
}

export function LSBARevenueConfig({ settings, onUpdateSettings }: LSBARevenueConfigProps) {
  const [formData, setFormData] = useState<PayoutSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof PayoutSettings, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numericValue }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Validation
    if (formData.lsbaFeePercentage < 0 || formData.lsbaFeePercentage > 50) {
      toast.error('LSBA fee percentage must be between 0% and 50%');
      return;
    }
    if (formData.lsbaFightWagePercentage < 0 || formData.lsbaFightWagePercentage > 50) {
      toast.error('LSBA fight wage percentage must be between 0% and 50%');
      return;
    }
    if (formData.minimumLsbaFee < 0) {
      toast.error('Minimum LSBA fee cannot be negative');
      return;
    }

    onUpdateSettings(formData);
    setHasChanges(false);
    toast.success('LSBA revenue settings updated successfully');
  };

  const handleReset = () => {
    setFormData(settings);
    setHasChanges(false);
    toast.info('Changes discarded');
  };

  const calculateRevenue = (amount: number, percentage: number): number => {
    return (amount * percentage) / 100;
  };

  const previewRevenue = (baseAmount: number) => {
    return {
      betting: calculateRevenue(baseAmount, formData.lsbaFeePercentage),
      wages: calculateRevenue(baseAmount, formData.lsbaFightWagePercentage),
      event: calculateRevenue(baseAmount, formData.lsbaEventFeePercentage),
      commission: calculateRevenue(baseAmount, formData.lsbaBettingCommission)
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">LSBA Revenue Configuration</h2>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure the percentage rates that LSBA earns from betting activities, fight wages, and event operations.
          Changes will apply to all new transactions.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="betting" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="betting">Betting Revenue</TabsTrigger>
          <TabsTrigger value="wages">Fight Wages</TabsTrigger>
          <TabsTrigger value="events">Event Fees</TabsTrigger>
          <TabsTrigger value="preview">Revenue Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="betting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Betting Revenue Settings</span>
              </CardTitle>
              <CardDescription>
                Configure how much LSBA earns from betting activities and winnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lsbaFeePercentage">LSBA Fee Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="lsbaFeePercentage"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.lsbaFeePercentage}
                      onChange={(e) => handleChange('lsbaFeePercentage', e.target.value)}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Percentage of betting winnings that goes to LSBA
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lsbaBettingCommission">Betting Commission</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="lsbaBettingCommission"
                      type="number"
                      min="0"
                      max="25"
                      step="0.1"
                      value={formData.lsbaBettingCommission}
                      onChange={(e) => handleChange('lsbaBettingCommission', e.target.value)}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Commission on all betting activity regardless of outcome
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumLsbaFee">Minimum LSBA Fee</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="minimumLsbaFee"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.minimumLsbaFee}
                      onChange={(e) => handleChange('minimumLsbaFee', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Minimum fee LSBA charges per transaction
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maximumLsbaFee">Maximum LSBA Fee (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="maximumLsbaFee"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.maximumLsbaFee || ''}
                      onChange={(e) => handleChange('maximumLsbaFee', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Optional maximum cap on LSBA fees per transaction
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Fight Wage Settings</span>
              </CardTitle>
              <CardDescription>
                Configure LSBA's percentage of fighter wages and purses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lsbaFightWagePercentage">Base Fight Wage Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="lsbaFightWagePercentage"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.lsbaFightWagePercentage}
                      onChange={(e) => handleChange('lsbaFightWagePercentage', e.target.value)}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Standard percentage of fighter wages that goes to LSBA
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainEventWagePercentage">Main Event Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="mainEventWagePercentage"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.mainEventWagePercentage}
                      onChange={(e) => handleChange('mainEventWagePercentage', e.target.value)}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Higher percentage for main event fights
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="underCardWagePercentage">Undercard Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="underCardWagePercentage"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.underCardWagePercentage}
                      onChange={(e) => handleChange('underCardWagePercentage', e.target.value)}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Lower percentage for undercard fights
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tournamentWagePercentage">Tournament Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="tournamentWagePercentage"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.tournamentWagePercentage}
                      onChange={(e) => handleChange('tournamentWagePercentage', e.target.value)}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Percentage for tournament fights
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Event & Revenue Sharing</span>
              </CardTitle>
              <CardDescription>
                Configure event organization fees and revenue sharing with partners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lsbaEventFeePercentage">Event Organization Fee</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="lsbaEventFeePercentage"
                      type="number"
                      min="0"
                      max="30"
                      step="0.1"
                      value={formData.lsbaEventFeePercentage}
                      onChange={(e) => handleChange('lsbaEventFeePercentage', e.target.value)}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fee for organizing and sanctioning events
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="casinoCommissionPercentage">Casino Commission</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="casinoCommissionPercentage"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.casinoCommissionPercentage}
                      onChange={(e) => handleChange('casinoCommissionPercentage', e.target.value)}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Casino's share of betting revenue
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sponsorCommissionPercentage">Sponsor Fee</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="sponsorCommissionPercentage"
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={formData.sponsorCommissionPercentage}
                      onChange={(e) => handleChange('sponsorCommissionPercentage', e.target.value)}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fee charged to sponsors for event participation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Revenue Preview</span>
              </CardTitle>
              <CardDescription>
                Preview how much LSBA will earn with current settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Betting Scenario ($10,000 total betting)</h4>
                  <div className="space-y-2">
                    {(() => {
                      const preview = previewRevenue(10000);
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm">LSBA Fee ({formData.lsbaFeePercentage}%)</span>
                            <Badge variant="secondary">${preview.betting.toFixed(2)}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Betting Commission ({formData.lsbaBettingCommission}%)</span>
                            <Badge variant="secondary">${preview.commission.toFixed(2)}</Badge>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total LSBA Revenue</span>
                            <Badge variant="default">${(preview.betting + preview.commission).toFixed(2)}</Badge>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Fight Wages ($50,000 total purse)</h4>
                  <div className="space-y-2">
                    {(() => {
                      const preview = previewRevenue(50000);
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm">Main Event ({formData.mainEventWagePercentage}%)</span>
                            <Badge variant="secondary">${((50000 * formData.mainEventWagePercentage) / 100).toFixed(2)}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Undercard ({formData.underCardWagePercentage}%)</span>
                            <Badge variant="secondary">${((50000 * formData.underCardWagePercentage) / 100).toFixed(2)}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Tournament ({formData.tournamentWagePercentage}%)</span>
                            <Badge variant="secondary">${((50000 * formData.tournamentWagePercentage) / 100).toFixed(2)}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Event Fee ({formData.lsbaEventFeePercentage}%)</span>
                            <Badge variant="secondary">${preview.event.toFixed(2)}</Badge>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <Alert>
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> These are example calculations. Actual revenue will depend on fight types, 
                  betting volumes, and purse amounts. All percentages are applied before any minimum/maximum fee limits.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges}
        >
          Discard Changes
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Save LSBA Settings
        </Button>
      </div>
    </div>
  );
}