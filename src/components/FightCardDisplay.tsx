import { Trophy } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { FightCard, Bout } from "@/types/fightCard";

interface FightCardDisplayProps {
  fightCard: FightCard;
}

export function FightCardDisplay({ fightCard }: FightCardDisplayProps) {
  const sponsors = fightCard.sponsors
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const renderBout = (bout: Bout, showBadge: boolean = false, badgeText?: string) => {
    if (!bout.fighter1 && !bout.fighter2) return null;

    const hasTitle = bout.title && bout.title.trim().length > 0;
    const isMainEvent = bout.type === 'main';
    const isCoMain = bout.type === 'co-main';
    const showImages = (isMainEvent || isCoMain) && (bout.fighter1Image || bout.fighter2Image);

    return (
      <div className="flex flex-col items-center gap-3">
        {showBadge && badgeText && (
          <Badge 
            className={`${
              bout.type === 'main' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-accent text-accent-foreground'
            } text-sm px-4 py-1`}
          >
            {badgeText}
          </Badge>
        )}
        
        {hasTitle && (
          <div className="flex items-center gap-2 text-secondary">
            {isMainEvent && <Trophy className="w-5 h-5" weight="fill" />}
            <p className={`font-display uppercase ${isMainEvent ? 'text-2xl' : 'text-xl'} tracking-wide text-center`}>
              {bout.title}
            </p>
            {isMainEvent && <Trophy className="w-5 h-5" weight="fill" />}
          </div>
        )}

        <div className="flex items-center justify-center gap-6 w-full">
          <div className="flex-1 flex flex-col items-end gap-3">
            {bout.fighter1Image && showImages && (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-2 border-primary/50 shadow-lg">
                <img 
                  src={bout.fighter1Image} 
                  alt={bout.fighter1 || 'Fighter 1'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <p className={`font-display uppercase ${
              isMainEvent ? 'text-5xl md:text-6xl' : isCoMain ? 'text-3xl md:text-4xl' : 'text-3xl md:text-4xl'
            } leading-none tracking-tight text-foreground text-right`}>
              {bout.fighter1 || 'TBD'}
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            <p className={`font-display ${
              isMainEvent ? 'text-4xl' : 'text-3xl'
            } text-primary`}>VS</p>
          </div>
          
          <div className="flex-1 flex flex-col items-start gap-3">
            {bout.fighter2Image && showImages && (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-2 border-primary/50 shadow-lg">
                <img 
                  src={bout.fighter2Image} 
                  alt={bout.fighter2 || 'Fighter 2'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <p className={`font-display uppercase ${
              isMainEvent ? 'text-5xl md:text-6xl' : isCoMain ? 'text-3xl md:text-4xl' : 'text-3xl md:text-4xl'
            } leading-none tracking-tight text-foreground text-left`}>
              {bout.fighter2 || 'TBD'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-5xl mx-auto overflow-hidden border-2 border-primary/30 relative">
      {fightCard.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${fightCard.backgroundImage})` }}
        />
      )}
      <div className={`relative ${fightCard.backgroundImage ? 'bg-card/95 backdrop-blur-sm' : 'bg-gradient-to-br from-card via-card to-muted'} p-8 md:p-12 flex flex-col gap-8`}>
        <div className="text-center space-y-2">
          <h1 className="font-display text-6xl md:text-7xl uppercase tracking-wider text-secondary drop-shadow-lg">
            LSBA
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            Los Santos Boxing Association
          </p>
        </div>

        <Separator className="bg-primary/50" />

        {renderBout(fightCard.mainEvent, true, 'MAIN EVENT')}

        {fightCard.coMainEvent && fightCard.coMainEvent.fighter1 && fightCard.coMainEvent.fighter2 && (
          <>
            <Separator className="bg-accent/30" />
            {renderBout(fightCard.coMainEvent, true, 'CO-MAIN EVENT')}
          </>
        )}

        {fightCard.otherBouts.length > 0 && fightCard.otherBouts.some(b => b.fighter1 || b.fighter2) && (
          <>
            <Separator className="bg-muted-foreground/20" />
            <div className="flex flex-col gap-6">
              <h3 className="font-display text-2xl uppercase text-center text-secondary tracking-wide">
                Fight Card
              </h3>
              {fightCard.otherBouts.map((bout) => {
                if (!bout.fighter1 && !bout.fighter2) return null;
                return (
                  <div key={bout.id} className="flex flex-col items-center gap-2">
                    {bout.title && (
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">
                        {bout.title}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <p className="font-display text-xl md:text-2xl uppercase text-foreground">
                        {bout.fighter1 || 'TBD'}
                      </p>
                      <span className="text-primary font-display text-xl">VS</span>
                      <p className="font-display text-xl md:text-2xl uppercase text-foreground">
                        {bout.fighter2 || 'TBD'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <Separator className="bg-primary/50" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-widest mb-1">Date</p>
            <p className="font-semibold text-foreground text-lg">
              {fightCard.eventDate || 'TBD'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-widest mb-1">Location</p>
            <p className="font-semibold text-foreground text-lg">
              {fightCard.location || 'TBD'}
            </p>
          </div>
        </div>

        {sponsors.length > 0 && (
          <>
            <Separator className="bg-muted-foreground/20" />
            <div className="text-center">
              <p className="text-xs uppercase text-muted-foreground tracking-widest mb-2">
                Sponsored By
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {sponsors.map((sponsor, index) => (
                  <span
                    key={index}
                    className="text-sm font-medium text-secondary px-3 py-1 border border-secondary/30 rounded"
                  >
                    {sponsor}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
