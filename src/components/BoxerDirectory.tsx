import { useState, useMemo } from "react";
import { 
  MagnifyingGlass, 
  PencilSimple, 
  Trash,
  Phone,
  IdentificationCard,
  Trophy,
  Calendar,
  Briefcase,
  X,
  Check,
  Eye,
  User,
  Users
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import type { Boxer, Sponsor } from "@/types/boxer";
import { BoxerEditDialog } from "./BoxerEditDialog";

interface BoxerDirectoryProps {
  boxers: Boxer[];
  sponsors: Sponsor[];
  onUpdateBoxer: (boxer: Boxer) => void;
  onDeleteBoxer: (boxerId: string) => void;
  onViewProfile: (boxer: Boxer) => void;
  onViewSponsorProfile: (sponsor: Sponsor) => void;
}

export function BoxerDirectory({ boxers = [], sponsors = [], onUpdateBoxer, onDeleteBoxer, onViewProfile, onViewSponsorProfile }: BoxerDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showBoxers, setShowBoxers] = useState(true);
  const [showSponsors, setShowSponsors] = useState(true);
  const [editingBoxer, setEditingBoxer] = useState<Boxer | null>(null);
  const [deletingBoxer, setDeletingBoxer] = useState<Boxer | null>(null);

  const filteredBoxers = useMemo(() => {
    if (!showBoxers) return [];
    const boxerList = boxers ?? [];
    if (!searchQuery.trim()) return boxerList;

    const query = searchQuery.toLowerCase();
    return boxerList.filter((boxer) => {
      const fullName = `${boxer.firstName} ${boxer.lastName}`.toLowerCase();
      const reverseName = `${boxer.lastName} ${boxer.firstName}`.toLowerCase();
      const stateId = boxer.stateId.toLowerCase();
      const phone = boxer.phoneNumber.toLowerCase();
      const sponsor = boxer.sponsor.toLowerCase();

      return (
        fullName.includes(query) ||
        reverseName.includes(query) ||
        stateId.includes(query) ||
        phone.includes(query) ||
        sponsor.includes(query) ||
        boxer.firstName.toLowerCase().includes(query) ||
        boxer.lastName.toLowerCase().includes(query)
      );
    });
  }, [boxers, searchQuery, showBoxers]);

  const filteredSponsors = useMemo(() => {
    if (!showSponsors) return [];
    const sponsorList = sponsors ?? [];
    if (!searchQuery.trim()) return sponsorList;

    const query = searchQuery.toLowerCase();
    return sponsorList.filter((sponsor) => {
      const name = sponsor.name.toLowerCase();
      const contactPerson = sponsor.contactPerson.toLowerCase();
      const stateId = sponsor.stateId.toLowerCase();
      const phone = sponsor.phoneNumber.toLowerCase();

      return (
        name.includes(query) ||
        contactPerson.includes(query) ||
        stateId.includes(query) ||
        phone.includes(query)
      );
    });
  }, [sponsors, searchQuery, showSponsors]);

  const handleDelete = () => {
    if (deletingBoxer) {
      onDeleteBoxer(deletingBoxer.id);
      setDeletingBoxer(null);
    }
  };

  const getWinRate = (boxer: Boxer) => {
    const total = boxer.wins + boxer.losses;
    if (total === 0) return 0;
    return Math.round((boxer.wins / total) * 100);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getSponsorInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getSponsoredBoxers = (sponsor: Sponsor) => {
    const boxersSponsored = sponsor.boxersSponsored || [];
    return boxers.filter(b => boxersSponsored.includes(b.id));
  };

  const totalResults = filteredBoxers.length + filteredSponsors.length;
  const hasAnyFilter = showBoxers || showSponsors;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
            Directory
          </h2>
          <p className="text-muted-foreground mt-1">
            Search and manage fighters and sponsors
          </p>
        </div>

        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, State ID, phone, or contact..."
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="show-boxers" 
                checked={showBoxers}
                onCheckedChange={(checked) => setShowBoxers(checked as boolean)}
              />
              <Label htmlFor="show-boxers" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" />
                Boxers
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="show-sponsors" 
                checked={showSponsors}
                onCheckedChange={(checked) => setShowSponsors(checked as boolean)}
              />
              <Label htmlFor="show-sponsors" className="flex items-center gap-2 cursor-pointer">
                <Users className="w-4 h-4" />
                Sponsors
              </Label>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {hasAnyFilter ? (
              <>
                {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                {showBoxers && showSponsors && ` (${filteredBoxers.length} boxers, ${filteredSponsors.length} sponsors)`}
              </>
            ) : (
              'Select at least one filter'
            )}
          </p>
        </div>
      </div>

      <Separator />

      {!hasAnyFilter || totalResults === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <MagnifyingGlass className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">
                {!hasAnyFilter ? 'No filters selected' : 'No results found'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {!hasAnyFilter 
                  ? 'Select boxers or sponsors to view results' 
                  : searchQuery.trim() 
                    ? 'Try adjusting your search terms or filters' 
                    : 'No entries found for the selected filters'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {showBoxers && filteredBoxers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl uppercase text-secondary tracking-wide flex items-center gap-2">
                <User className="w-5 h-5" />
                Boxers ({filteredBoxers.length})
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {filteredBoxers.map((boxer) => (
                  <Card key={boxer.id} className="p-6 hover:border-primary/50 transition-colors">
                    <div className="flex flex-col md:flex-row gap-6">
                      <Avatar className="w-20 h-20 border-2 border-border">
                        <AvatarImage src={boxer.profileImage} alt={`${boxer.firstName} ${boxer.lastName}`} />
                        <AvatarFallback className="text-xl font-semibold bg-primary/20 text-primary">
                          {getInitials(boxer.firstName, boxer.lastName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div>
                            <h3 className="font-fighter text-2xl uppercase text-foreground">
                              {boxer.firstName} {boxer.lastName}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="font-mono">
                                <IdentificationCard className="w-3 h-3 mr-1" />
                                {boxer.stateId}
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className="font-semibold"
                              >
                                {boxer.wins}W - {boxer.losses}L - {boxer.knockouts}KO
                              </Badge>
                              <Badge 
                                variant="default"
                                className="bg-accent text-accent-foreground"
                              >
                                {getWinRate(boxer)}% Win Rate
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewProfile(boxer)}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              <Eye className="w-4 h-4 md:mr-2" />
                              <span className="hidden md:inline">View</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingBoxer(boxer)}
                              className="hover:bg-secondary hover:text-secondary-foreground"
                            >
                              <PencilSimple className="w-4 h-4 md:mr-2" />
                              <span className="hidden md:inline">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingBoxer(boxer)}
                              className="hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash className="w-4 h-4 md:mr-2" />
                              <span className="hidden md:inline">Delete</span>
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground font-medium">{boxer.phoneNumber}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground font-medium">{boxer.sponsor || 'No sponsor'}</span>
                          </div>

                          {boxer.timezone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="text-xs">
                                {boxer.timezone}
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Registered {new Date(boxer.registeredDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {showSponsors && filteredSponsors.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl uppercase text-secondary tracking-wide flex items-center gap-2">
                <Users className="w-5 h-5" />
                Sponsors ({filteredSponsors.length})
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {filteredSponsors.map((sponsor) => {
                  const sponsoredBoxers = getSponsoredBoxers(sponsor);
                  return (
                    <Card key={sponsor.id} className="p-6 hover:border-secondary/50 transition-colors">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="w-20 h-20 border-2 border-border">
                          <AvatarFallback className="text-xl font-semibold bg-secondary/20 text-secondary">
                            {getSponsorInitials(sponsor.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                              <h3 className="font-fighter text-2xl uppercase text-foreground">
                                {sponsor.name}
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="font-mono">
                                  <IdentificationCard className="w-3 h-3 mr-1" />
                                  {sponsor.stateId}
                                </Badge>
                                <Badge 
                                  variant="default"
                                  className="bg-secondary text-secondary-foreground"
                                >
                                  {sponsoredBoxers.length} {sponsoredBoxers.length === 1 ? 'Boxer' : 'Boxers'}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewSponsorProfile(sponsor)}
                              className="hover:bg-primary hover:text-primary-foreground"
                            >
                              <Eye className="w-4 h-4 md:mr-2" />
                              <span className="hidden md:inline">View Profile</span>
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground font-medium">{sponsor.contactPerson}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground font-medium">{sponsor.phoneNumber}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Registered {new Date(sponsor.registeredDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {sponsoredBoxers.length > 0 && (
                            <div className="pt-2 border-t border-border">
                              <div className="flex items-center gap-2 mb-2">
                                <Trophy className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-semibold text-muted-foreground">
                                  Sponsored Boxers ({sponsoredBoxers.length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {sponsoredBoxers.map((boxer) => (
                                  <Badge 
                                    key={boxer.id} 
                                    variant="outline"
                                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => onViewProfile(boxer)}
                                  >
                                    {boxer.firstName} {boxer.lastName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {editingBoxer && (
        <BoxerEditDialog
          boxer={editingBoxer}
          sponsors={sponsors}
          onClose={() => setEditingBoxer(null)}
          onSave={(updatedBoxer) => {
            onUpdateBoxer(updatedBoxer);
            setEditingBoxer(null);
          }}
        />
      )}

      <AlertDialog open={!!deletingBoxer} onOpenChange={(open) => !open && setDeletingBoxer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash className="w-5 h-5" />
              Delete Fighter Profile
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {deletingBoxer?.firstName} {deletingBoxer?.lastName}
                </span>
                ?
              </p>
              <p className="text-sm">
                This will remove all their records, fight history, and statistics. This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Check className="w-4 h-4 mr-2" />
              Delete Fighter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
