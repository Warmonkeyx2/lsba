import { Trophy } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { FightCard, Bout } from "@/types/fightCard";

interface FightCardDisplayProps {
  fightCard: FightCard;
}

export function FightCardDisplay({ fightCard, compact = false }: FightCardDisplayProps & { compact?: boolean }) {
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
      <div className={`flex flex-col items-center ${compact ? 'gap-2' : 'gap-3'}`}>
        {showBadge && badgeText && (
          <Badge 
            className={`${
              bout.type === 'main' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-accent text-accent-foreground'
            } ${compact ? 'text-xs px-3 py-0.5' : 'text-sm px-4 py-1'}`}
          >
            {badgeText}
          </Badge>
        )}
        
        {hasTitle && (
          <div className={`flex items-center justify-center ${compact ? 'gap-2' : 'gap-3'} text-secondary`}>
            {isMainEvent && <Trophy className={compact ? 'w-4 h-4' : 'w-6 h-6'} weight="fill" />}
            <p className={`font-display uppercase ${
              compact 
                ? isMainEvent ? 'text-xl' : 'text-lg'
                : isMainEvent ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'
            } tracking-widest text-center font-extrabold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]`}>
              {bout.title}
            </p>
            {isMainEvent && <Trophy className={compact ? 'w-4 h-4' : 'w-6 h-6'} weight="fill" />}
          </div>
        )}

        <div className={`flex items-center justify-center ${compact ? 'gap-3' : 'gap-6'} w-full`}>
          <div className={`flex-1 flex flex-col items-end ${compact ? 'gap-2' : 'gap-3'}`}>
            {bout.fighter1Image && showImages && (
              <div className="flex flex-col items-center gap-2">
                <div className={`${compact ? 'w-20 h-20' : 'w-32 h-32 md:w-40 md:h-40'} rounded-lg overflow-hidden border-2 border-primary/50 shadow-lg relative`}>
                  {bout.fighter1Rank && (
                    <div className={`absolute top-1 left-1 ${compact ? 'w-7 h-7' : 'w-10 h-10'} bg-secondary/95 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-foreground/20 shadow-lg z-10`}>
                      <span className={`font-display font-bold ${compact ? 'text-xs' : 'text-sm'} text-secondary-foreground`}>#{bout.fighter1Rank}</span>
                    </div>
                  )}
                  <img 
                    src={bout.fighter1Image} 
                    alt={bout.fighter1 || 'Fighter 1'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                {bout.fighter1Record && (bout.fighter1Record.wins || bout.fighter1Record.losses || bout.fighter1Record.knockouts) && (
                  <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} font-semibold text-muted-foreground`}>
                    <span className="text-foreground">{bout.fighter1Record.wins || '0'}</span>
                    <span>|</span>
                    <span className="text-foreground">{bout.fighter1Record.losses || '0'}</span>
                    <span>|</span>
                    <span className="text-foreground">{bout.fighter1Record.knockouts || '0'}</span>
                  </div>
                )}
              </div>
            )}
            <p className={`font-fighter uppercase ${
              compact 
                ? isMainEvent ? 'text-3xl' : isCoMain ? 'text-2xl' : 'text-xl'
                : isMainEvent ? 'text-6xl md:text-8xl' : isCoMain ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'
            } leading-none tracking-tight text-foreground text-right font-black drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]`}>
              {bout.fighter1 || 'TBD'}
            </p>
          </div>
          
          <div className={`flex flex-col items-center justify-center ${compact ? 'px-2' : 'px-4'}`}>
            <p className={`font-display ${
              compact 
                ? isMainEvent ? 'text-3xl' : 'text-2xl'
                : isMainEvent ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'
            } text-primary font-black drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]`}>VS</p>
          </div>
          
          <div className={`flex-1 flex flex-col items-start ${compact ? 'gap-2' : 'gap-3'}`}>
            {bout.fighter2Image && showImages && (
              <div className="flex flex-col items-center gap-2">
                <div className={`${compact ? 'w-20 h-20' : 'w-32 h-32 md:w-40 md:h-40'} rounded-lg overflow-hidden border-2 border-primary/50 shadow-lg relative`}>
                  {bout.fighter2Rank && (
                    <div className={`absolute top-1 left-1 ${compact ? 'w-7 h-7' : 'w-10 h-10'} bg-secondary/95 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-foreground/20 shadow-lg z-10`}>
                      <span className={`font-display font-bold ${compact ? 'text-xs' : 'text-sm'} text-secondary-foreground`}>#{bout.fighter2Rank}</span>
                    </div>
                  )}
                  <img 
                    src={bout.fighter2Image} 
                    alt={bout.fighter2 || 'Fighter 2'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                {bout.fighter2Record && (bout.fighter2Record.wins || bout.fighter2Record.losses || bout.fighter2Record.knockouts) && (
                  <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} font-semibold text-muted-foreground`}>
                    <span className="text-foreground">{bout.fighter2Record.wins || '0'}</span>
                    <span>|</span>
                    <span className="text-foreground">{bout.fighter2Record.losses || '0'}</span>
                    <span>|</span>
                    <span className="text-foreground">{bout.fighter2Record.knockouts || '0'}</span>
                  </div>
                )}
              </div>
            )}
            <p className={`font-fighter uppercase ${
              compact 
                ? isMainEvent ? 'text-3xl' : isCoMain ? 'text-2xl' : 'text-xl'
                : isMainEvent ? 'text-6xl md:text-8xl' : isCoMain ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'
            } leading-none tracking-tight text-foreground text-left font-black drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]`}>
              {bout.fighter2 || 'TBD'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`w-full ${compact ? 'max-w-3xl' : 'max-w-5xl'} mx-auto overflow-hidden border-2 border-primary/30 relative`}>
      {fightCard.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${fightCard.backgroundImage})` }}
        />
      )}
      <div className={`relative ${fightCard.backgroundImage ? 'bg-card/95 backdrop-blur-sm' : 'bg-gradient-to-br from-card via-card to-muted'} ${compact ? 'p-4 md:p-6 flex flex-col gap-4' : 'p-8 md:p-12 flex flex-col gap-8'}`}>
        <div className="text-center space-y-2">
          {fightCard.customLogo ? (
            <div className="flex justify-center">
              <img 
                src={fightCard.customLogo} 
                alt="LSBA Logo" 
                className={`${compact ? 'max-h-16 md:max-h-20' : 'max-h-32 md:max-h-40'} object-contain drop-shadow-2xl`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <>
              <h1 className={`font-display ${compact ? 'text-4xl md:text-5xl' : 'text-7xl md:text-8xl'} uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-secondary via-accent to-secondary drop-shadow-lg relative`}>
                <span className="absolute inset-0 text-secondary/20 blur-lg">LSBA</span>
                <span className="relative">LSBA</span>
              </h1>
              <p className={`${compact ? 'text-xs md:text-sm' : 'text-lg md:text-xl'} text-muted-foreground font-semibold tracking-[0.3em] uppercase`}>
                Los Santos Boxing Association
              </p>
            </>
          )}
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
            <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-6'}`}>
              <h3 className={`font-display ${compact ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'} uppercase text-center text-secondary tracking-[0.2em] font-extrabold drop-shadow-md`}>
                Fight Card
              </h3>
              {fightCard.otherBouts.map((bout) => {
                if (!bout.fighter1 && !bout.fighter2) return null;
                return (
                  <div key={bout.id} className="flex flex-col items-center gap-2">
                    {bout.title && (
                      <p className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground uppercase tracking-widest font-semibold`}>
                        {bout.title}
                      </p>
                    )}
                    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-4'}`}>
                      <p className={`font-fighter ${compact ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'} uppercase text-foreground font-bold drop-shadow-md`}>
                        {bout.fighter1 || 'TBD'}
                      </p>
                      <span className={`text-primary font-display ${compact ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'} font-bold`}>VS</span>
                      <p className={`font-fighter ${compact ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'} uppercase text-foreground font-bold drop-shadow-md`}>
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

        <div className={`flex flex-col md:flex-row justify-between items-center ${compact ? 'gap-2' : 'gap-4'} text-center md:text-left`}>
          <div>
            <p className={`${compact ? 'text-[10px]' : 'text-xs'} uppercase text-muted-foreground tracking-widest mb-1`}>Date</p>
            <p className={`font-semibold text-foreground ${compact ? 'text-base' : 'text-lg'}`}>
              {fightCard.eventDate || 'TBD'}
            </p>
          </div>
          <div>
            <p className={`${compact ? 'text-[10px]' : 'text-xs'} uppercase text-muted-foreground tracking-widest mb-1`}>Location</p>
            <p className={`font-semibold text-foreground ${compact ? 'text-base' : 'text-lg'}`}>
              {fightCard.location || 'TBD'}
            </p>
          </div>
        </div>

        {sponsors.length > 0 && (
          <>
            <Separator className="bg-muted-foreground/20" />
            <div className="text-center">
              <p className={`${compact ? 'text-[10px]' : 'text-xs'} uppercase text-muted-foreground tracking-widest mb-2`}>
                Sponsored By
              </p>
              <div className={`flex flex-wrap justify-center ${compact ? 'gap-2' : 'gap-3'}`}>
                {sponsors.map((sponsor, index) => (
                  <span
                    key={index}
                    className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-secondary px-3 py-1 border border-secondary/30 rounded`}
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
