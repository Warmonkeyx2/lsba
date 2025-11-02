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
  Check
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
}

export function BoxerDirectory({ boxers, sponsors, onUpdateBoxer, onDeleteBoxer }: BoxerDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBoxer, setEditingBoxer] = useState<Boxer | null>(null);
  const [deletingBoxer, setDeletingBoxer] = useState<Boxer | null>(null);

  const filteredBoxers = useMemo(() => {
    if (!searchQuery.trim()) return boxers;

    const query = searchQuery.toLowerCase();
    return boxers.filter((boxer) => {
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
  }, [boxers, searchQuery]);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
            Boxer Directory
          </h2>
          <p className="text-muted-foreground mt-1">
            Search and manage all registered fighters
          </p>
        </div>

        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, State ID, phone, or sponsor..."
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredBoxers.length} {filteredBoxers.length === 1 ? 'fighter' : 'fighters'} found
          </p>
        </div>
      </div>

      <Separator />

      {filteredBoxers.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <MagnifyingGlass className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">No fighters found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery.trim() ? 'Try adjusting your search terms' : 'Register your first fighter to get started'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">{boxer.phoneNumber}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">{boxer.sponsor || 'No sponsor'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Registered {new Date(boxer.registeredDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {boxer.fightHistory.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground">
                          Recent Fights ({boxer.fightHistory.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {boxer.fightHistory.slice(0, 3).map((fight) => (
                          <div key={fight.id} className="text-sm flex items-center gap-2">
                            <Badge 
                              variant={fight.result === 'win' || fight.result === 'knockout' ? 'default' : 'secondary'}
                              className={
                                fight.result === 'win' || fight.result === 'knockout' 
                                  ? 'bg-accent text-accent-foreground' 
                                  : ''
                              }
                            >
                              {fight.result === 'knockout' ? 'KO' : fight.result.toUpperCase()}
                            </Badge>
                            <span className="text-muted-foreground">vs {fight.opponent}</span>
                            <span className="text-muted-foreground text-xs">
                              {new Date(fight.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
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
