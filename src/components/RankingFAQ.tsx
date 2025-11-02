import { Info, Trophy, TrendUp, Lightning, Scales } from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { RankingSettings } from "@/types/boxer";

interface RankingFAQProps {
  settings: RankingSettings;
}

export function RankingFAQ({ settings }: RankingFAQProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Info className="w-8 h-8 text-secondary" weight="fill" />
          <div>
            <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
              Ranking System FAQ
            </h2>
            <p className="text-muted-foreground mt-1">
              Understanding the LSBA Point-Based Ranking System
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-primary" weight="fill" />
              <CardTitle className="text-primary">Base Win</CardTitle>
            </div>
            <CardDescription>Points for a victory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-primary">
              +{settings.baseWinPoints}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/20 to-destructive/5 border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <TrendUp className="w-6 h-6 text-destructive rotate-180" weight="bold" />
              <CardTitle className="text-destructive">Base Loss</CardTitle>
            </div>
            <CardDescription>Points deducted for a loss</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-destructive">
              {settings.baseLossPoints}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Lightning className="w-6 h-6 text-accent" weight="fill" />
              <CardTitle className="text-accent">KO Bonus</CardTitle>
            </div>
            <CardDescription>Extra points for knockout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-accent">
              +{settings.koBonus}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <Scales className="w-5 h-5 text-secondary" />
                  <span className="font-semibold">Why a point system instead of win-loss records?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-3">
                  A point-based system is fairer because it accounts for the quality of your opponents, not just quantity of fights. 
                  A fighter who rarely competes but defeats top-ranked opponents will be ranked higher than someone who fights frequently 
                  against lower-ranked opposition.
                </p>
                <p>
                  This prevents fighters from padding their records with easy wins and rewards those who take on tough challenges.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-secondary" />
                  <span className="font-semibold">How do I earn points?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-3">
                  <strong>Base Victory:</strong> You earn <strong className="text-foreground">+{settings.baseWinPoints} points</strong> for every win.
                </p>
                <p className="mb-3">
                  <strong>Knockout Bonus:</strong> If you win by knockout, you get an additional <strong className="text-foreground">+{settings.koBonus} points</strong> (total: {settings.baseWinPoints + settings.koBonus} points).
                </p>
                <p>
                  <strong>Rank Difference Bonus:</strong> Defeating a higher-ranked opponent gives you bonus points based on the rank gap. 
                  The bigger the upset, the more points you earn!
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <TrendUp className="w-5 h-5 text-secondary rotate-180" />
                  <span className="font-semibold">How do I lose points?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-3">
                  <strong>Base Loss:</strong> You lose <strong className="text-foreground">{settings.baseLossPoints} points</strong> for every loss.
                </p>
                <p>
                  <strong>Upset Penalty:</strong> If you lose to a lower-ranked opponent, you lose additional points based on the rank difference. 
                  Losing to someone ranked much lower than you results in a bigger point penalty.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <Lightning className="w-5 h-5 text-secondary" />
                  <span className="font-semibold">What about fighting higher vs. lower ranked opponents?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                    <p className="font-semibold text-primary mb-2">Example: Rank #7 defeats Rank #1</p>
                    <p className="text-sm">
                      This is a major upset! The #7 fighter earns their base win points PLUS a significant upset bonus 
                      (6 rank difference × {settings.upsetBonusMultiplier * 100}% bonus multiplier). 
                      They could earn {settings.baseWinPoints + Math.floor(6 * settings.upsetBonusMultiplier * settings.baseWinPoints)}+ points for this win!
                    </p>
                  </div>

                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                    <p className="font-semibold text-accent mb-2">Example: Rank #6 defeats Rank #15</p>
                    <p className="text-sm">
                      This is expected. The #6 fighter earns standard win points with a small bonus 
                      (9 rank difference × {settings.rankDifferenceMultiplier * 100}% = +{Math.floor(9 * settings.rankDifferenceMultiplier * settings.baseWinPoints)} bonus points). 
                      Total: {settings.baseWinPoints + Math.floor(9 * settings.rankDifferenceMultiplier * settings.baseWinPoints)} points.
                    </p>
                  </div>

                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                    <p className="font-semibold text-destructive mb-2">Example: Rank #6 loses to Rank #15</p>
                    <p className="text-sm">
                      This is a bad upset! The #6 fighter loses their base loss points PLUS a large penalty 
                      (9 rank difference × {settings.rankDifferenceMultiplier * 100}% penalty). 
                      They could lose {Math.abs(settings.baseLossPoints) + Math.floor(9 * settings.rankDifferenceMultiplier * Math.abs(settings.baseLossPoints))}+ points!
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-secondary" />
                  <span className="font-semibold">When do I appear on the leaderboard?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  New fighters start with 0 points and do not appear on the leaderboard until they earn their first points through competition. 
                  This ensures the leaderboard only shows active, proven fighters rather than all registered members.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <TrendUp className="w-5 h-5 text-secondary" />
                  <span className="font-semibold">What happens at the end of the season?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  At the end of each season, rankings can be reset by the association administrator. 
                  All fighters return to 0 points and unranked status, giving everyone a fresh start for the new season. 
                  Fight history is preserved for records, but points start from scratch.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30">
        <CardHeader>
          <CardTitle className="font-display text-xl uppercase tracking-wide text-secondary">
            Current Ranking Settings
          </CardTitle>
          <CardDescription>These values can be adjusted by administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Base Win Points</p>
              <p className="text-lg font-bold text-foreground">+{settings.baseWinPoints}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Base Loss Points</p>
              <p className="text-lg font-bold text-foreground">{settings.baseLossPoints}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">KO Bonus</p>
              <p className="text-lg font-bold text-foreground">+{settings.koBonus}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Rank Diff. Multiplier</p>
              <p className="text-lg font-bold text-foreground">{settings.rankDifferenceMultiplier}x</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Upset Bonus Multiplier</p>
              <p className="text-lg font-bold text-foreground">{settings.upsetBonusMultiplier}x</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
