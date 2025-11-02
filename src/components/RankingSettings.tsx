import { useState } from "react";
import { Sliders, FloppyDisk, ArrowCounterClockwise } from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { RankingSettings } from "@/types/boxer";
import { DEFAULT_RANKING_SETTINGS } from "@/lib/rankingUtils";

interface RankingSettingsProps {
  settings: RankingSettings;
  onSave: (settings: RankingSettings) => void;
}

export function RankingSettingsComponent({ settings, onSave }: RankingSettingsProps) {
  const [localSettings, setLocalSettings] = useState<RankingSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof RankingSettings, value: number) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(localSettings);
    setHasChanges(false);
    toast.success("Ranking settings updated successfully");
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_RANKING_SETTINGS);
    setHasChanges(true);
    toast.info("Settings reset to defaults. Click Save to apply.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Sliders className="w-8 h-8 text-secondary" weight="bold" />
          <div>
            <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
              Ranking Settings
            </h2>
            <p className="text-muted-foreground mt-1">
              Adjust the point system to balance competition
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl uppercase tracking-wide">
            Point Values
          </CardTitle>
          <CardDescription>
            Configure how many points are awarded or deducted for fight outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="baseWinPoints" className="text-base font-semibold">
                Base Win Points
              </Label>
              <Input
                id="baseWinPoints"
                type="number"
                value={localSettings.baseWinPoints}
                onChange={(e) => handleChange("baseWinPoints", parseInt(e.target.value) || 0)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Points awarded for a standard victory
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseLossPoints" className="text-base font-semibold">
                Base Loss Points
              </Label>
              <Input
                id="baseLossPoints"
                type="number"
                value={localSettings.baseLossPoints}
                onChange={(e) => handleChange("baseLossPoints", parseInt(e.target.value) || 0)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Points deducted for a loss (use negative number)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="koBonus" className="text-base font-semibold">
                Knockout Bonus
              </Label>
              <Input
                id="koBonus"
                type="number"
                value={localSettings.koBonus}
                onChange={(e) => handleChange("koBonus", parseInt(e.target.value) || 0)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Extra points added for knockout victories
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rankDifferenceMultiplier" className="text-base font-semibold">
                Rank Difference Multiplier
              </Label>
              <Input
                id="rankDifferenceMultiplier"
                type="number"
                step="0.01"
                value={localSettings.rankDifferenceMultiplier}
                onChange={(e) => handleChange("rankDifferenceMultiplier", parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Multiplier for beating higher-ranked opponents (e.g., 0.15 = 15% per rank)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upsetBonusMultiplier" className="text-base font-semibold">
                Upset Bonus Multiplier
              </Label>
              <Input
                id="upsetBonusMultiplier"
                type="number"
                step="0.01"
                value={localSettings.upsetBonusMultiplier}
                onChange={(e) => handleChange("upsetBonusMultiplier", parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Multiplier for major upsets by lower-ranked fighters (e.g., 0.5 = 50% per rank)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              size="lg"
              className="bg-primary hover:bg-primary/90 flex-1"
            >
              <FloppyDisk className="w-5 h-5 mr-2" />
              Save Settings
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <ArrowCounterClockwise className="w-5 h-5 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/30">
        <CardHeader>
          <CardTitle className="font-display text-xl uppercase tracking-wide text-accent">
            Preview Calculations
          </CardTitle>
          <CardDescription>
            See how your settings affect point distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-primary mb-2">Standard Win</p>
              <p className="text-2xl font-display font-bold text-foreground">
                +{localSettings.baseWinPoints}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Against equal rank</p>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-accent mb-2">Win by Knockout</p>
              <p className="text-2xl font-display font-bold text-foreground">
                +{localSettings.baseWinPoints + localSettings.koBonus}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Standard win + KO bonus</p>
            </div>

            <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-secondary mb-2">Upset Victory (5 ranks up)</p>
              <p className="text-2xl font-display font-bold text-foreground">
                +{localSettings.baseWinPoints + Math.floor(5 * localSettings.upsetBonusMultiplier * localSettings.baseWinPoints)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Lower ranked beats higher ranked</p>
            </div>

            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-destructive mb-2">Upset Loss (5 ranks down)</p>
              <p className="text-2xl font-display font-bold text-foreground">
                {localSettings.baseLossPoints - Math.floor(5 * localSettings.rankDifferenceMultiplier * Math.abs(localSettings.baseLossPoints))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Higher ranked loses to lower ranked</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
