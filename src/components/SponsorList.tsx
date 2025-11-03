import { Briefcase, Phone, Calendar, Users, IdentificationCard, Eye } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Sponsor } from '@/types/boxer';

interface SponsorListProps {
  sponsors: Sponsor[];
  onViewProfile: (sponsor: Sponsor) => void;
}

export function SponsorList({ sponsors = [], onViewProfile }: SponsorListProps) {
  const sponsorList = sponsors ?? [];
  
  if (sponsorList.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground text-lg">No sponsors registered yet</p>
        <p className="text-sm text-muted-foreground mt-2">Register your first sponsor above</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-2xl uppercase text-accent tracking-wide">Registered Sponsors</h3>
        <p className="text-muted-foreground mt-1">View and manage sponsor profiles</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sponsorList.map((sponsor) => {
          const boxersSponsored = sponsor.boxersSponsored || [];
          return (
            <Card key={sponsor.id} className="p-6 hover:border-accent/50 transition-colors">
              <div className="flex items-start gap-4">
                {sponsor.logoUrl ? (
                  <div className="w-12 h-12 rounded-lg border border-border flex items-center justify-center flex-shrink-0 overflow-hidden bg-card">
                    <img 
                      src={sponsor.logoUrl} 
                      alt={`${sponsor.name} logo`}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-6 h-6 text-accent"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M152,120H136V104a8,8,0,0,0-16,0v16H104a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V136h16a8,8,0,0,0,0-16ZM216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216v62.75l-30.07-30.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,100.69Zm176,144H40V128.69L76.69,92,147,162.28a16,16,0,0,0,22.62,0L190,142l26,26Z"></path></svg></div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-accent" weight="bold" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display text-xl uppercase text-foreground font-bold truncate">
                      {sponsor.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProfile(sponsor)}
                      className="flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{sponsor.contactPerson}</p>
                  
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IdentificationCard className="w-4 h-4" />
                      <span>State ID: {sponsor.stateId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{sponsor.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(sponsor.registeredDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent/20 border border-accent/30">
                      <Users className="w-5 h-5 text-accent" weight="bold" />
                      <div className="flex flex-col">
                        <span className="text-2xl font-display font-bold text-accent leading-none">
                          {boxersSponsored.length}
                        </span>
                        <span className="text-xs text-accent-foreground/80 uppercase tracking-wide">
                          {boxersSponsored.length === 1 ? 'Boxer' : 'Boxers'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
