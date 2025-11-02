import { Briefcase, Phone, Calendar, Users, IdentificationCard } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import type { Sponsor } from '@/types/boxer';

interface SponsorListProps {
  sponsors: Sponsor[];
}

export function SponsorList({ sponsors }: SponsorListProps) {
  if (sponsors.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground text-lg">No sponsors registered yet</p>
        <p className="text-sm text-muted-foreground mt-2">Register your first sponsor above</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sponsors.map((sponsor) => {
        return (
          <Card key={sponsor.id} className="p-6 hover:border-accent/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-accent" weight="bold" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl uppercase text-foreground font-bold mb-1 truncate">
                  {sponsor.name}
                </h3>
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
                        {sponsor.boxersSponsored.length}
                      </span>
                      <span className="text-xs text-accent-foreground/80 uppercase tracking-wide">
                        {sponsor.boxersSponsored.length === 1 ? 'Boxer' : 'Boxers'}
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
  );
}
