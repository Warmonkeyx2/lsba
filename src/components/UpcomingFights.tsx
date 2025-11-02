import { Calendar, Trophy } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { FightCard, Bout } from "@/types/fightCard";
import type { Boxer } from "@/types/boxer";

interface UpcomingFightsProps {
  fightCards: FightCard[];
  boxers: Boxer[];
}

export function UpcomingFights({ fightCards, boxers }: UpcomingFightsProps) {
  const upcomingCards = fightCards.filter(card => card.status === 'upcoming');

  const getBoxerById = (id?: string) => {
    if (!id) return null;
    return boxers.find(b => b.id === id);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderBout = (bout: Bout, cardId: string) => {
    if (!bout.fighter1 && !bout.fighter2) return null;

    const fighter1 = getBoxerById(bout.fighter1Id);
    const fighter2 = getBoxerById(bout.fighter2Id);

    return (
      <div key={bout.id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
        <div className="flex-1 flex items-center justify-end gap-3">
          <div className="text-right">
            <p className="font-fighter text-xl uppercase font-bold text-foreground">
              {bout.fighter1 || 'TBD'}
            </p>
            {bout.fighter1Record && (
              <p className="text-xs text-muted-foreground">
                {bout.fighter1Record.wins}W - {bout.fighter1Record.losses}L - {bout.fighter1Record.knockouts}KO
              </p>
            )}
          </div>
          <Avatar className="w-12 h-12 border-2 border-border">
            <AvatarImage src={bout.fighter1Image || fighter1?.profileImage} alt={bout.fighter1} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {getInitials(bout.fighter1 || 'TBD')}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col items-center gap-1 px-4">
          <span className="font-display text-2xl text-primary font-black">VS</span>
          {bout.fighter1Rank && bout.fighter2Rank && (
            <span className="text-xs text-muted-foreground">#{bout.fighter1Rank} vs #{bout.fighter2Rank}</span>
          )}
        </div>

        <div className="flex-1 flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-border">
            <AvatarImage src={bout.fighter2Image || fighter2?.profileImage} alt={bout.fighter2} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {getInitials(bout.fighter2 || 'TBD')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-fighter text-xl uppercase font-bold text-foreground">
              {bout.fighter2 || 'TBD'}
            </p>
            {bout.fighter2Record && (
              <p className="text-xs text-muted-foreground">
                {bout.fighter2Record.wins}W - {bout.fighter2Record.losses}L - {bout.fighter2Record.knockouts}KO
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (upcomingCards.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">No Upcoming Fights</h3>
            <p className="text-muted-foreground text-sm">
              Generate a fight card to schedule upcoming bouts
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {upcomingCards.map((card) => {
        const allBouts = [
          card.mainEvent,
          ...(card.coMainEvent ? [card.coMainEvent] : []),
          ...card.otherBouts
        ].filter(bout => bout.fighter1 && bout.fighter2);

        return (
          <Card key={card.id} className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-secondary" weight="fill" />
                    <h3 className="font-display text-2xl uppercase text-secondary tracking-wide">
                      {card.mainEvent.title || 'LSBA Event'}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{card.eventDate}</span>
                    </div>
                    <span>•</span>
                    <span>{card.location}</span>
                  </div>
                </div>
                <Badge className="bg-accent text-accent-foreground">
                  Upcoming
                </Badge>
              </div>

              <div className="flex flex-col gap-3">
                {allBouts.map((bout) => renderBout(bout, card.id || ''))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
