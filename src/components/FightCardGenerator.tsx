import { useState } from 'react';
import { Sparkle, ArrowRight, Trash, CalendarBlank, Warning } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Boxer } from '@/types/boxer';
import type { FightCard, Bout } from '@/types/fightCard';
import { getRanking } from '@/lib/rankingUtils';
import { isLicenseValid, getDaysUntilDue } from '@/lib/licenseUtils';

interface FightCardGeneratorProps {
  boxers: Boxer[];
  allBoxers: Boxer[];
  onGenerate: (fightCard: FightCard, boxerIds: string[]) => void;
}

interface BoutSetup {
  id: string;
  fighter1Id: string;
  fighter2Id: string;
  type: 'main' | 'co-main' | 'undercard' | 'preliminary';
  title?: string;
}

export function FightCardGenerator({ boxers = [], allBoxers = [], onGenerate }: FightCardGeneratorProps) {
  const [selectedBoxers, setSelectedBoxers] = useState<string[]>([]);
  const [bouts, setBouts] = useState<BoutSetup[]>([]);
  const [eventDate, setEventDate] = useState('');
  const [calendarDate, setCalendarDate] = useState<Date>();
  const [location, setLocation] = useState('');

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setCalendarDate(date);
      setEventDate(format(date, 'EEEE, MMMM do, yyyy'));
    }
  };

  const boxerList = boxers ?? [];

  const toggleBoxer = (boxerId: string) => {
    const boxer = boxerList.find(b => b.id === boxerId);
    if (boxer && !isLicenseValid(boxer)) {
      toast.error(`${boxer.firstName} ${boxer.lastName} has an expired license and cannot be added to a fight card`);
      return;
    }
    
    setSelectedBoxers((prev) =>
      prev.includes(boxerId) ? prev.filter((id) => id !== boxerId) : [...prev, boxerId]
    );
  };

  const autoMatchBoxers = () => {
    if (selectedBoxers.length < 2) {
      toast.error('Please select at least 2 boxers');
      return;
    }

    const newBouts: BoutSetup[] = [];
    for (let i = 0; i < selectedBoxers.length; i += 2) {
      if (i + 1 < selectedBoxers.length) {
        newBouts.push({
          id: `bout-${Date.now()}-${i}`,
          fighter1Id: selectedBoxers[i],
          fighter2Id: selectedBoxers[i + 1],
          type: i === 0 ? 'main' : i === 2 ? 'co-main' : 'undercard',
        });
      }
    }

    setBouts(newBouts);
    setSelectedBoxers([]);
    toast.success('Bouts created! Configure each bout type below.');
  };

  const updateFighter = (boutId: string, position: 'fighter1' | 'fighter2', fighterId: string) => {
    setBouts((prev) =>
      prev.map((bout) =>
        bout.id === boutId
          ? { ...bout, [position === 'fighter1' ? 'fighter1Id' : 'fighter2Id']: fighterId }
          : bout
      )
    );
  };

  const updateBoutType = (boutId: string, type: 'main' | 'co-main' | 'undercard' | 'preliminary') => {
    setBouts((prev) =>
      prev.map((bout) => (bout.id === boutId ? { ...bout, type } : bout))
    );
  };

  const updateBoutTitle = (boutId: string, title: string) => {
    setBouts((prev) =>
      prev.map((bout) => (bout.id === boutId ? { ...bout, title } : bout))
    );
  };

  const removeBout = (boutId: string) => {
    setBouts((prev) => prev.filter((bout) => bout.id !== boutId));
  };

  const addBout = () => {
    if (boxers.length < 2) {
      toast.error('Not enough boxers registered.');
      return;
    }

    setBouts((prev) => [
      ...prev,
      {
        id: `bout-${Date.now()}`,
        fighter1Id: boxers[0].id,
        fighter2Id: boxers[1]?.id || boxers[0].id,
        type: 'undercard',
      },
    ]);
  };

  const handleGenerate = () => {
    if (bouts.length === 0) {
      toast.error('Please create at least one bout');
      return;
    }

    if (!eventDate || !location) {
      toast.error('Please enter event date and location');
      return;
    }

    const hasMainEvent = bouts.some((b) => b.type === 'main');
    if (!hasMainEvent) {
      toast.error('At least one bout must be set as the Main Event');
      return;
    }

    const generatedBouts: Bout[] = bouts.map((boutSetup) => {
      const fighter1 = boxers.find((b) => b.id === boutSetup.fighter1Id);
      const fighter2 = boxers.find((b) => b.id === boutSetup.fighter2Id);

      if (!fighter1 || !fighter2) {
        throw new Error('Fighter not found');
      }

      return {
        id: boutSetup.id,
        fighter1: `${fighter1.firstName} ${fighter1.lastName}`,
        fighter2: `${fighter2.firstName} ${fighter2.lastName}`,
        fighter1Image: fighter1.profileImage,
        fighter2Image: fighter2.profileImage,
        fighter1Id: fighter1.id,
        fighter2Id: fighter2.id,
        fighter1Rank: getRanking(fighter1, allBoxers) || undefined,
        fighter2Rank: getRanking(fighter2, allBoxers) || undefined,
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
        type: boutSetup.type,
        title: boutSetup.title,
      };
    });

    const mainEvent = generatedBouts.find((b) => b.type === 'main');
    const coMainEvent = generatedBouts.find((b) => b.type === 'co-main');
    const otherBouts = generatedBouts.filter((b) => b.type !== 'main' && b.type !== 'co-main');

    if (!mainEvent) {
      toast.error('Main event is required');
      return;
    }

    const fightCard: FightCard = {
      id: `fight-card-${Date.now()}`,
      eventDate,
      location,
      mainEvent,
      coMainEvent,
      otherBouts,
      sponsors: '',
      status: 'upcoming',
      createdDate: new Date().toISOString(),
    };

    const allBoxerIds = bouts.flatMap((bout) => [bout.fighter1Id, bout.fighter2Id]);
    onGenerate(fightCard, allBoxerIds);
    toast.success('Fight card generated successfully!');
    setSelectedBoxers([]);
    setBouts([]);
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
            <div className="flex gap-2 mt-1">
              <Input
                id="gen-event-date"
                placeholder="e.g., Saturday, October 26th, 2024"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="flex-1"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <CalendarBlank className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={calendarDate}
                    onSelect={handleCalendarSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
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
          <div className="flex items-center justify-between mb-3">
            <Label>Select Boxers ({selectedBoxers.length} selected)</Label>
            {selectedBoxers.length >= 2 && (
              <Button onClick={autoMatchBoxers} variant="outline" size="sm">
                <Sparkle className="w-4 h-4 mr-2" />
                Auto-Match Pairs
              </Button>
            )}
          </div>
          {boxers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No boxers available. Register boxers first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
              {boxers.map((boxer) => {
                const hasValidLicense = isLicenseValid(boxer);
                const daysUntilDue = getDaysUntilDue(boxer);
                
                return (
                  <div
                    key={boxer.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                      !hasValidLicense
                        ? 'border-destructive/50 bg-destructive/5 opacity-60 cursor-not-allowed'
                        : selectedBoxers.includes(boxer.id)
                        ? 'border-primary bg-primary/5 cursor-pointer'
                        : 'border-border hover:bg-muted/50 cursor-pointer'
                    }`}
                    onClick={() => toggleBoxer(boxer.id)}
                  >
                    <Checkbox
                      checked={selectedBoxers.includes(boxer.id)}
                      onCheckedChange={() => toggleBoxer(boxer.id)}
                      disabled={!hasValidLicense}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-fighter text-lg uppercase font-bold truncate">
                          {boxer.firstName} {boxer.lastName}
                        </div>
                        {!hasValidLicense && (
                          <Badge variant="destructive" className="text-xs flex items-center gap-1">
                            <Warning className="w-3 h-3" />
                            Expired
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {boxer.wins}-{boxer.losses}-{boxer.knockouts}
                        </Badge>
                        {boxer.sponsor && (
                          <span className="text-xs text-muted-foreground truncate">{boxer.sponsor}</span>
                        )}
                      </div>
                      {!hasValidLicense && (
                        <div className="text-xs text-destructive mt-1">
                          License expired - payment required
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {bouts.length > 0 && (
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base">Configure Bouts ({bouts.length})</Label>
              <Button onClick={addBout} variant="outline" size="sm">
                Add Another Bout
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              {bouts.map((bout) => {
                const fighter1 = boxers.find((b) => b.id === bout.fighter1Id);
                const fighter2 = boxers.find((b) => b.id === bout.fighter2Id);
                if (!fighter1 || !fighter2) return null;

                return (
                  <div key={bout.id} className="bg-muted/30 p-4 rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`fighter1-${bout.id}`} className="text-xs">
                              Fighter 1
                            </Label>
                            <Select
                              value={bout.fighter1Id}
                              onValueChange={(value) => updateFighter(bout.id, 'fighter1', value)}
                            >
                              <SelectTrigger id={`fighter1-${bout.id}`} className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {boxers.map((boxer) => (
                                  <SelectItem key={boxer.id} value={boxer.id}>
                                    {boxer.firstName} {boxer.lastName} ({boxer.wins}-{boxer.losses}-{boxer.knockouts})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`fighter2-${bout.id}`} className="text-xs">
                              Fighter 2
                            </Label>
                            <Select
                              value={bout.fighter2Id}
                              onValueChange={(value) => updateFighter(bout.id, 'fighter2', value)}
                            >
                              <SelectTrigger id={`fighter2-${bout.id}`} className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {boxers.map((boxer) => (
                                  <SelectItem key={boxer.id} value={boxer.id}>
                                    {boxer.firstName} {boxer.lastName} ({boxer.wins}-{boxer.losses}-{boxer.knockouts})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`bout-type-${bout.id}`} className="text-xs">
                              Bout Type
                            </Label>
                            <Select
                              value={bout.type}
                              onValueChange={(value: 'main' | 'co-main' | 'undercard' | 'preliminary') =>
                                updateBoutType(bout.id, value)
                              }
                            >
                              <SelectTrigger id={`bout-type-${bout.id}`} className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="main">Main Event</SelectItem>
                                <SelectItem value="co-main">Co-Main Event</SelectItem>
                                <SelectItem value="undercard">Undercard</SelectItem>
                                <SelectItem value="preliminary">Preliminary</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`bout-title-${bout.id}`} className="text-xs">
                              Title (Optional)
                            </Label>
                            <Input
                              id={`bout-title-${bout.id}`}
                              placeholder="e.g., For the LSBA Title"
                              value={bout.title || ''}
                              onChange={(e) => updateBoutTitle(bout.id, e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => removeBout(bout.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={bouts.length === 0 || !eventDate || !location}
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
