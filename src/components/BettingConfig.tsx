import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FloppyDisk, CurrencyDollar, Warning } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { BettingConfig } from "@/types/betting";

interface BettingConfigProps {
  config: BettingConfig;
  onSave: (config: BettingConfig) => void;
}

export function BettingConfigComponent({ config, onSave }: BettingConfigProps) {
  const [editedConfig, setEditedConfig] = useState<BettingConfig>(config);

  const handleSave = () => {
    if (editedConfig.wageLimits.minimum >= editedConfig.wageLimits.maximum) {
      toast.error("Minimum wage must be less than maximum wage");
      return;
    }

    if (editedConfig.wageLimits.perFight > editedConfig.wageLimits.perEvent) {
      toast.error("Per-fight limit cannot exceed per-event limit");
      return;
    }

    const updatedConfig = {
      ...editedConfig,
      lastUpdated: new Date().toISOString(),
    };

    onSave(updatedConfig);
    toast.success("Betting configuration saved successfully!");
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(editedConfig);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
            Betting Configuration
          </h2>
          <p className="text-muted-foreground mt-1">
            Set event pricing and betting limits to manage funds and payouts
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          <FloppyDisk className="w-5 h-5 mr-2" />
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyDollar className="w-5 h-5 text-primary" />
              Event Pricing
            </CardTitle>
            <CardDescription>
              Set the cost for creating different types of betting events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="regular-pricing">Regular Event</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="regular-pricing"
                  type="number"
                  min="0"
                  step="50"
                  value={editedConfig.eventPricing.regular}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      eventPricing: {
                        ...editedConfig.eventPricing,
                        regular: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cost to create a regular fight card betting pool
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special-pricing">Special Event</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="special-pricing"
                  type="number"
                  min="0"
                  step="100"
                  value={editedConfig.eventPricing.special}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      eventPricing: {
                        ...editedConfig.eventPricing,
                        special: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cost to create a special event betting pool (higher stakes)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tournament-pricing">Tournament Event</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="tournament-pricing"
                  type="number"
                  min="0"
                  step="100"
                  value={editedConfig.eventPricing.tournament}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      eventPricing: {
                        ...editedConfig.eventPricing,
                        tournament: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cost to create a tournament bracket betting pool
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warning className="w-5 h-5 text-primary" />
              Betting Wage Limits
            </CardTitle>
            <CardDescription>
              Set minimum and maximum betting limits to control risk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="min-wage">Minimum Bet</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="min-wage"
                  type="number"
                  min="1"
                  step="10"
                  value={editedConfig.wageLimits.minimum}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      wageLimits: {
                        ...editedConfig.wageLimits,
                        minimum: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum amount required to place a bet
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-wage">Maximum Bet</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="max-wage"
                  type="number"
                  min="1"
                  step="100"
                  value={editedConfig.wageLimits.maximum}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      wageLimits: {
                        ...editedConfig.wageLimits,
                        maximum: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum amount allowed per single bet
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="per-fight-limit">Per Fight Limit</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="per-fight-limit"
                  type="number"
                  min="1"
                  step="100"
                  value={editedConfig.wageLimits.perFight}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      wageLimits: {
                        ...editedConfig.wageLimits,
                        perFight: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum total bets per fight across all bettors
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="per-event-limit">Per Event Limit</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="per-event-limit"
                  type="number"
                  min="1"
                  step="500"
                  value={editedConfig.wageLimits.perEvent}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      wageLimits: {
                        ...editedConfig.wageLimits,
                        perEvent: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum total bets per event across all fights
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Controls</CardTitle>
          <CardDescription>
            Enable or disable the betting system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="betting-enabled">Enable Betting System</Label>
              <p className="text-sm text-muted-foreground">
                When disabled, no new bets can be placed
              </p>
            </div>
            <Switch
              id="betting-enabled"
              checked={editedConfig.enabled}
              onCheckedChange={(checked) =>
                setEditedConfig({
                  ...editedConfig,
                  enabled: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent/50 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-accent-foreground">Current Limits Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-accent-foreground">Event Costs</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Regular:</span>
                  <span className="font-mono">${editedConfig.eventPricing.regular}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Special:</span>
                  <span className="font-mono">${editedConfig.eventPricing.special}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tournament:</span>
                  <span className="font-mono">${editedConfig.eventPricing.tournament}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-accent-foreground">Bet Limits</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Bet:</span>
                  <span className="font-mono">${editedConfig.wageLimits.minimum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Bet:</span>
                  <span className="font-mono">${editedConfig.wageLimits.maximum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Fight:</span>
                  <span className="font-mono">${editedConfig.wageLimits.perFight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Event:</span>
                  <span className="font-mono">${editedConfig.wageLimits.perEvent}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
