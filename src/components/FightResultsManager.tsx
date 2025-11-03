import { useState } from "react";
import { Trophy, Check } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { FightCard, Bout } from "@/types/fightCard";
import type { Boxer } from "@/types/boxer";

interface FightResultsManagerProps {
  fightCard: FightCard;
  boxers: Boxer[];
  onDeclareResults: (updatedCard: FightCard, boxerUpdates: Map<string, Partial<Boxer>>) => void;
}

export function FightResultsManager({ fightCard, boxers = [], onDeclareResults }: FightResultsManagerProps) {
  const [boutResults, setBoutResults] = useState<Map<string, { winner: 'fighter1' | 'fighter2', knockout: boolean }>>(new Map());

  const allBouts = [
    fightCard.mainEvent,
    ...(fightCard.coMainEvent ? [fightCard.coMainEvent] : []),
    ...fightCard.otherBouts
  ].filter(bout => bout.fighter1 && bout.fighter2);

  const handleBoutResult = (boutId: string, winner: 'fighter1' | 'fighter2', knockout: boolean) => {
    const newResults = new Map(boutResults);
    newResults.set(boutId, { winner, knockout });
    setBoutResults(newResults);
  };

  const handleDeclareResults = () => {
    if (boutResults.size === 0) {
      toast.error('Please declare at least one fight result');
      return;
    }

    const boxerUpdates = new Map<string, Partial<Boxer>>();

    const updatedBouts = allBouts.map(bout => {
      const result = boutResults.get(bout.id);
      if (!result) return bout;

      const updatedBout = {
        ...bout,
        winner: result.winner,
        knockout: result.knockout,
      };

      const winnerId = result.winner === 'fighter1' ? bout.fighter1Id : bout.fighter2Id;
      const loserId = result.winner === 'fighter1' ? bout.fighter2Id : bout.fighter1Id;
      const winnerName = result.winner === 'fighter1' ? bout.fighter1 : bout.fighter2;
      const loserName = result.winner === 'fighter1' ? bout.fighter2 : bout.fighter1;

      if (winnerId) {
        const winner = boxers.find(b => b.id === winnerId);
        if (winner) {
          const winnerUpdate = boxerUpdates.get(winnerId) || { wins: winner.wins, losses: winner.losses, knockouts: winner.knockouts };
          winnerUpdate.wins = (winnerUpdate.wins || 0) + 1;
          if (result.knockout) {
            winnerUpdate.knockouts = (winnerUpdate.knockouts || 0) + 1;
          }
          boxerUpdates.set(winnerId, winnerUpdate);
        }
      }

      if (loserId) {
        const loser = boxers.find(b => b.id === loserId);
        if (loser) {
          const loserUpdate = boxerUpdates.get(loserId) || { wins: loser.wins, losses: loser.losses, knockouts: loser.knockouts };
          loserUpdate.losses = (loserUpdate.losses || 0) + 1;
          boxerUpdates.set(loserId, loserUpdate);
        }
      }

      return updatedBout;
    });

    const updatedCard: FightCard = {
      ...fightCard,
      status: 'completed',
      mainEvent: updatedBouts[0] || fightCard.mainEvent,
      coMainEvent: updatedBouts[1] || fightCard.coMainEvent,
      otherBouts: updatedBouts.slice(fightCard.coMainEvent ? 2 : 1),
    };

    onDeclareResults(updatedCard, boxerUpdates);
    toast.success('Fight results declared and boxer records updated!');
  };

  if (fightCard.status === 'completed') {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Check className="w-12 h-12 mx-auto mb-3 text-secondary" weight="bold" />
          <h3 className="font-semibold text-lg mb-1">Event Completed</h3>
          <p className="text-muted-foreground text-sm">
            All results have been declared for this fight card
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-7 h-7 text-secondary" weight="fill" />
        <h2 className="text-2xl font-display uppercase text-secondary">Declare Fight Results</h2>
      </div>

      <div className="flex flex-col gap-6">
        {allBouts.map((bout, index) => {
          const result = boutResults.get(bout.id);
          const boutType = index === 0 ? 'Main Event' : index === 1 && fightCard.coMainEvent ? 'Co-Main Event' : `Bout ${index + 1}`;

          return (
            <div key={bout.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <Badge className={index === 0 ? 'bg-primary' : 'bg-accent'}>
                  {boutType}
                </Badge>
                {bout.title && (
                  <span className="text-sm text-muted-foreground">{bout.title}</span>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="font-fighter text-xl uppercase font-bold">
                  {bout.fighter1}
                </span>
                <span className="text-primary font-display text-xl">VS</span>
                <span className="font-fighter text-xl uppercase font-bold">
                  {bout.fighter2}
                </span>
              </div>

              <Separator className="my-4" />

              <RadioGroup
                value={result?.winner}
                onValueChange={(value) => handleBoutResult(bout.id, value as 'fighter1' | 'fighter2', result?.knockout || false)}
              >
                <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                  <RadioGroupItem value="fighter1" id={`${bout.id}-fighter1`} />
                  <Label htmlFor={`${bout.id}-fighter1`} className="flex-1 cursor-pointer">
                    {bout.fighter1} wins
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                  <RadioGroupItem value="fighter2" id={`${bout.id}-fighter2`} />
                  <Label htmlFor={`${bout.id}-fighter2`} className="flex-1 cursor-pointer">
                    {bout.fighter2} wins
                  </Label>
                </div>
              </RadioGroup>

              {result && (
                <div className="mt-4 flex items-center space-x-2 p-2 rounded bg-muted/30">
                  <Checkbox
                    id={`${bout.id}-knockout`}
                    checked={result.knockout}
                    onCheckedChange={(checked) => handleBoutResult(bout.id, result.winner, checked as boolean)}
                  />
                  <Label htmlFor={`${bout.id}-knockout`} className="cursor-pointer">
                    Victory by Knockout
                  </Label>
                </div>
              )}
            </div>
          );
        })}

        <Button
          onClick={handleDeclareResults}
          disabled={boutResults.size === 0}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          <Check className="w-5 h-5 mr-2" />
          Declare All Results ({boutResults.size} of {allBouts.length})
        </Button>
      </div>
    </Card>
  );
}
