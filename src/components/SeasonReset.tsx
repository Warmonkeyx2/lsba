import { useState } from "react";
import { ArrowsClockwise, Warning, Trash } from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Boxer } from "@/types/boxer";

interface SeasonResetProps {
  boxers: Boxer[];
  onResetSeason: () => void;
  onClearAll: () => void;
}

export function SeasonReset({ boxers, onResetSeason, onClearAll }: SeasonResetProps) {
  const [confirmText, setConfirmText] = useState("");
  
  const rankedBoxers = boxers.filter((b) => b.rankingPoints > 0).length;
  const totalBoxers = boxers.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <ArrowsClockwise className="w-8 h-8 text-secondary" weight="bold" />
          <div>
            <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
              Season Management
            </h2>
            <p className="text-muted-foreground mt-1">
              Reset rankings or clear all data for a fresh start
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <CardHeader>
            <CardTitle className="text-primary">Total Boxers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-primary">{totalBoxers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30">
          <CardHeader>
            <CardTitle className="text-secondary">Ranked Boxers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-secondary">{rankedBoxers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
          <CardHeader>
            <CardTitle className="text-accent">Unranked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-accent">{totalBoxers - rankedBoxers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl uppercase tracking-wide flex items-center gap-2">
            <ArrowsClockwise className="w-5 h-5 text-secondary" weight="bold" />
            Reset Season Rankings
          </CardTitle>
          <CardDescription>
            Reset all ranking points to zero while keeping boxer profiles and fight history intact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
            <p className="text-sm text-foreground mb-2">
              <strong>What happens when you reset the season:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>All boxer ranking points reset to 0</li>
              <li>Everyone becomes unranked (no one appears on leaderboard)</li>
              <li>Boxer profiles remain (name, contact, sponsor)</li>
              <li>Fight history is preserved for records</li>
              <li>Win/Loss/KO stats remain unchanged</li>
              <li>Upcoming fight cards are kept</li>
            </ul>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg" variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                <ArrowsClockwise className="w-5 h-5 mr-2" />
                Reset Season Rankings
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Warning className="w-6 h-6 text-accent" weight="fill" />
                  Reset Season Rankings?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This will reset all ranking points to zero for all {totalBoxers} boxers. 
                    Everyone will start fresh in the new season.
                  </p>
                  <p className="font-semibold text-foreground">
                    All boxer profiles and fight histories will be preserved.
                  </p>
                  <p className="text-destructive">
                    This action cannot be undone.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onResetSeason}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  Reset Season
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="font-display text-xl uppercase tracking-wide flex items-center gap-2 text-destructive">
            <Trash className="w-5 h-5" weight="bold" />
            Clear All Data
          </CardTitle>
          <CardDescription>
            Permanently delete all boxers, fight cards, and history from the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-sm text-foreground mb-2">
              <strong className="text-destructive">DANGER: What happens when you clear all data:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>All {totalBoxers} boxer profiles are permanently deleted</li>
              <li>All fight history is erased</li>
              <li>All fight cards (past and upcoming) are removed</li>
              <li>All statistics are lost forever</li>
              <li>The system returns to a completely blank state</li>
            </ul>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg" variant="destructive" className="w-full">
                <Trash className="w-5 h-5 mr-2" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <Warning className="w-6 h-6" weight="fill" />
                  Permanently Delete Everything?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p className="text-destructive font-semibold">
                    WARNING: This will permanently delete all data from the system!
                  </p>
                  <p>
                    • {totalBoxers} boxer profiles will be deleted<br />
                    • All fight history will be lost<br />
                    • All fight cards will be removed<br />
                    • All statistics will be erased
                  </p>
                  <p className="font-semibold text-foreground">
                    This action CANNOT be undone. All data will be lost permanently.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onClearAll}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
