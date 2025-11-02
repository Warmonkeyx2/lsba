import { Briefcase, Phone, Calendar, Users, User } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Sponsor, Boxer } from '@/types/boxer';

interface SponsorListProps {
  sponsors: Sponsor[];
  boxers?: Boxer[];
}

export function SponsorList({ sponsors, boxers = [] }: SponsorListProps) {
  const getBoxerById = (boxerId: string) => {
    return boxers.find(b => b.id === boxerId);
  };

  const getSponsoredBoxers = (sponsor: Sponsor) => {
    return sponsor.boxersSponsored
      .map(id => getBoxerById(id))
      .filter((boxer): boxer is Boxer => boxer !== undefined);
  };
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
        const sponsoredBoxers = getSponsoredBoxers(sponsor);
        
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

                {sponsoredBoxers.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Sponsored Fighters
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sponsoredBoxers.map((boxer) => (
                          <Badge 
                            key={boxer.id} 
                            variant="secondary"
                            className="text-xs"
                          >
                            {boxer.firstName} {boxer.lastName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
