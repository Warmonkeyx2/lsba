import { useState } from 'react';
import { Sparkle, ArrowRight } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Boxer } from '@/types/boxer';
import type { FightCard, Bout } from '@/types/fightCard';
import { getBoxerRecord, getBoxerFullName } from '@/lib/boxerUtils';

interface FightCardGeneratorProps {
  boxers: Boxer[];
  onGenerate: (fightCard: FightCard) => void;
}

export function FightCardGenerator({ boxers, onGenerate }: FightCardGeneratorProps) {
  const [selectedBoxers, setSelectedBoxers] = useState<string[]>([]);
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');

  const toggleBoxer = (boxerId: string) => {
    setSelectedBoxers((prev) =>
      prev.includes(boxerId) ? prev.filter((id) => id !== boxerId) : [...prev, boxerId]
    );
  };

  const handleGenerate = () => {
    if (selectedBoxers.length < 2) {
      toast.error('Please select at least 2 boxers to generate a fight card');
      return;
    }

    if (!eventDate || !location) {
      toast.error('Please enter event date and location');
      return;
    }

    const selected = boxers.filter((b) => selectedBoxers.includes(b.id));
    const bouts: Bout[] = [];

    for (let i = 0; i < selected.length; i += 2) {
      if (i + 1 < selected.length) {
        const fighter1 = selected[i];
        const fighter2 = selected[i + 1];

        const bout: Bout = {
          id: `bout-${Date.now()}-${i}`,
          fighter1: getBoxerFullName(fighter1),
          fighter2: getBoxerFullName(fighter2),
          fighter1Image: fighter1.profileImage,
          fighter2Image: fighter2.profileImage,
          fighter1Record: {
            wins: fighter1.wins.toString(),
            losses: fighter1.losses.toString(),
            knockouts: fighter1.knockouts.toString(),
          },
          fighter2Record: {
            wins: fighter2.wins.toString(),
            losses: fighter2.losses.toString(),
            knockouts: fighter2.knockouts.toString(),
          },
          type: i === 0 ? 'main' : i === 2 ? 'co-main' : 'undercard',
        };

        bouts.push(bout);
      }
    }

    const mainEvent = bouts[0];
    const coMainEvent = bouts.length > 1 ? bouts[1] : undefined;
    const otherBouts = bouts.slice(2);

    const fightCard: FightCard = {
      eventDate,
      location,
      mainEvent,
      coMainEvent,
      otherBouts,
      sponsors: '',
    };

    onGenerate(fightCard);
    toast.success('Fight card generated successfully!');
    setSelectedBoxers([]);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkle className="w-7 h-7 text-secondary" weight="fill" />
        <h2 className="text-2xl font-display uppercase text-secondary">Auto-Generate Fight Card</h2>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gen-event-date">Event Date</Label>
            <Input
              id="gen-event-date"
              placeholder="e.g., Saturday, October 26th, 2024"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="gen-location">Location</Label>
            <Input
              id="gen-location"
              placeholder="e.g., Los Santos Arena"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="mb-3 block">Select Boxers ({selectedBoxers.length} selected)</Label>
          {boxers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No boxers available. Register boxers first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
              {boxers.map((boxer) => (
                <div
                  key={boxer.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBoxers.includes(boxer.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => toggleBoxer(boxer.id)}
                >
                  <Checkbox
                    checked={selectedBoxers.includes(boxer.id)}
                    onCheckedChange={() => toggleBoxer(boxer.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-fighter text-lg uppercase font-bold truncate">
                      {getBoxerFullName(boxer)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {getBoxerRecord(boxer)}
                      </Badge>
                      {boxer.sponsor && (
                        <span className="text-xs text-muted-foreground truncate">{boxer.sponsor}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedBoxers.length > 0 && (
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <div className="flex flex-col gap-2">
              {Array.from({ length: Math.floor(selectedBoxers.length / 2) }).map((_, i) => {
                const fighter1 = boxers.find((b) => b.id === selectedBoxers[i * 2]);
                const fighter2 = boxers.find((b) => b.id === selectedBoxers[i * 2 + 1]);
                if (!fighter1 || !fighter2) return null;

                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge className={i === 0 ? 'bg-primary' : i === 1 ? 'bg-accent' : 'bg-muted'}>
                      {i === 0 ? 'Main' : i === 1 ? 'Co-Main' : `Bout ${i + 1}`}
                    </Badge>
                    <span className="font-semibold">{getBoxerFullName(fighter1)}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-semibold">{getBoxerFullName(fighter2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={selectedBoxers.length < 2 || !eventDate || !location}
          size="lg"
          className="bg-secondary hover:bg-secondary/90"
        >
          <Sparkle className="w-5 h-5 mr-2" weight="fill" />
          Generate Fight Card
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
