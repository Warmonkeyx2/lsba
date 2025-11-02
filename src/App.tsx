import { useState } from "react";
import { useKV } from "@github/spark/hooks";
import { 
  Eye, 
  PencilSimple, 
  FloppyDisk, 
  ChartLine, 
  UserPlus, 
  Sparkle,
  SquaresFour,
  Briefcase,
  AddressBook,
  Calendar
} from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FightCardEditor } from "@/components/FightCardEditor";
import { FightCardDisplay } from "@/components/FightCardDisplay";
import { BoxerRegistration } from "@/components/BoxerRegistration";
import { BoxerLeaderboard } from "@/components/BoxerLeaderboard";
import { BoxerProfile } from "@/components/BoxerProfile";
import { FightCardGenerator } from "@/components/FightCardGenerator";
import { SponsorRegistration } from "@/components/SponsorRegistration";
import { SponsorList } from "@/components/SponsorList";
import { BoxerDirectory } from "@/components/BoxerDirectory";
import { UpcomingFights } from "@/components/UpcomingFights";
import { FightResultsManager } from "@/components/FightResultsManager";
import { toast, Toaster } from "sonner";
import type { FightCard } from "@/types/fightCard";
import type { Boxer, Sponsor } from "@/types/boxer";

const defaultFightCard: FightCard = {
  eventDate: '',
  location: '',
  mainEvent: {
    id: 'main-event',
    fighter1: '',
    fighter2: '',
    type: 'main',
  },
  otherBouts: [],
  sponsors: '',
  status: 'upcoming',
};

function App() {
  const [savedCard, setSavedCard] = useKV<FightCard>('lsba-fight-card', defaultFightCard);
  const [editingCard, setEditingCard] = useState<FightCard>(savedCard || defaultFightCard);
  const [fightCards, setFightCards] = useKV<FightCard[]>('lsba-fight-cards', []);
  const [boxers, setBoxers] = useKV<Boxer[]>('lsba-boxers', []);
  const [sponsors, setSponsors] = useKV<Sponsor[]>('lsba-sponsors', []);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedBoxer, setSelectedBoxer] = useState<Boxer | null>(null);

  const boxersList = boxers || [];
  const sponsorsList = sponsors || [];
  const fightCardsList = fightCards || [];
  const currentCard = savedCard || defaultFightCard;

  const handleSave = () => {
    setSavedCard(editingCard);
    toast.success('Fight card saved successfully!');
  };

  const handleRegisterBoxer = (boxer: Boxer) => {
    setBoxers((current) => [...(current || []), boxer]);
  };

  const handleRegisterSponsor = (sponsor: Sponsor) => {
    setSponsors((current) => [...(current || []), sponsor]);
  };

  const handleUpdateBoxer = (updatedBoxer: Boxer) => {
    setBoxers((current) =>
      (current || []).map((b) => (b.id === updatedBoxer.id ? updatedBoxer : b))
    );
    setSelectedBoxer(updatedBoxer);
  };

  const handleDeleteBoxer = (boxerId: string) => {
    setBoxers((current) => (current || []).filter((b) => b.id !== boxerId));
    toast.success("Fighter profile deleted successfully");
  };

  const handleGenerateFightCard = (fightCard: FightCard, boxerIds: string[]) => {
    setEditingCard(fightCard);
    setSavedCard(fightCard);
    
    setFightCards((current) => [...(current || []), fightCard]);
    
    const eventName = fightCard.mainEvent.title || `LSBA Event - ${fightCard.eventDate}`;
    const eventDate = fightCard.createdDate || new Date().toISOString();
    
    const matchedPairs: Array<[string, string]> = [];
    for (let i = 0; i < boxerIds.length; i += 2) {
      if (i + 1 < boxerIds.length) {
        matchedPairs.push([boxerIds[i], boxerIds[i + 1]]);
      }
    }
    
    setBoxers((current) => {
      const updated = [...(current || [])];
      matchedPairs.forEach(([fighterId1, fighterId2]) => {
        const boxer1Index = updated.findIndex(b => b.id === fighterId1);
        const boxer2Index = updated.findIndex(b => b.id === fighterId2);
        
        if (boxer1Index !== -1) {
          const opponent = updated[boxer2Index];
          updated[boxer1Index].fightHistory = [
            {
              id: `fight-${Date.now()}-${fighterId1}`,
              opponent: opponent ? `${opponent.firstName} ${opponent.lastName}` : 'TBD',
              date: eventDate,
              result: 'pending',
              eventName,
              fightCardId: fightCard.id,
            },
            ...updated[boxer1Index].fightHistory,
          ];
        }
        
        if (boxer2Index !== -1) {
          const opponent = updated[boxer1Index];
          updated[boxer2Index].fightHistory = [
            {
              id: `fight-${Date.now()}-${fighterId2}`,
              opponent: opponent ? `${opponent.firstName} ${opponent.lastName}` : 'TBD',
              date: eventDate,
              result: 'pending',
              eventName,
              fightCardId: fightCard.id,
            },
            ...updated[boxer2Index].fightHistory,
          ];
        }
      });
      return updated;
    });
    
    setActiveTab('upcoming-fights');
    toast.success('Fight card generated! View upcoming fights.');
  };

  const handleDeclareResults = (updatedCard: FightCard, boxerUpdates: Map<string, Partial<Boxer>>) => {
    setFightCards((current) =>
      (current || []).map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );

    setBoxers((current) => {
      const updated = [...(current || [])];
      boxerUpdates.forEach((updates, boxerId) => {
        const index = updated.findIndex((b) => b.id === boxerId);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            wins: updates.wins ?? updated[index].wins,
            losses: updates.losses ?? updated[index].losses,
            knockouts: updates.knockouts ?? updated[index].knockouts,
          };

          updated[index].fightHistory = updated[index].fightHistory.map((fight) => {
            if (fight.fightCardId === updatedCard.id && fight.result === 'pending') {
              const allBouts = [
                updatedCard.mainEvent,
                ...(updatedCard.coMainEvent ? [updatedCard.coMainEvent] : []),
                ...updatedCard.otherBouts,
              ];

              const bout = allBouts.find(
                (b) => b.fighter1Id === boxerId || b.fighter2Id === boxerId
              );

              if (bout && bout.winner) {
                const isWinner = 
                  (bout.winner === 'fighter1' && bout.fighter1Id === boxerId) ||
                  (bout.winner === 'fighter2' && bout.fighter2Id === boxerId);

                return {
                  ...fight,
                  result: isWinner ? (bout.knockout ? 'knockout' : 'win') : 'loss',
                };
              }
            }
            return fight;
          });
        }
      });
      return updated;
    });
  };

  const hasChanges = JSON.stringify(currentCard) !== JSON.stringify(editingCard);

  if (selectedBoxer) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Toaster position="top-center" richColors />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <BoxerProfile
              boxer={selectedBoxer}
              allBoxers={boxersList}
              onBack={() => setSelectedBoxer(null)}
              onUpdateBoxer={handleUpdateBoxer}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" richColors />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="font-display text-5xl md:text-6xl uppercase text-transparent bg-clip-text bg-gradient-to-r from-secondary via-accent to-secondary tracking-wide">
                  LSBA Manager
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Los Santos Boxing Association - Complete Management System
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 h-auto">
                <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3">
                  <SquaresFour className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="upcoming-fights" className="flex items-center gap-2 py-3">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Upcoming</span>
                </TabsTrigger>
                <TabsTrigger value="directory" className="flex items-center gap-2 py-3">
                  <AddressBook className="w-4 h-4" />
                  <span className="hidden sm:inline">Directory</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2 py-3">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Register</span>
                </TabsTrigger>
                <TabsTrigger value="generator" className="flex items-center gap-2 py-3">
                  <Sparkle className="w-4 h-4" />
                  <span className="hidden sm:inline">Generator</span>
                </TabsTrigger>
                <TabsTrigger value="sponsors" className="flex items-center gap-2 py-3">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Sponsors</span>
                </TabsTrigger>
                <TabsTrigger value="fight-card" className="flex items-center gap-2 py-3">
                  <PencilSimple className="w-4 h-4" />
                  <span className="hidden sm:inline">Fight Card</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <ChartLine className="w-8 h-8 text-primary" weight="bold" />
                        <div className="text-4xl font-display font-bold text-primary">
                          {boxersList.length}
                        </div>
                      </div>
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Registered Boxers
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-8 h-8 text-secondary" weight="bold" />
                        <div className="text-4xl font-display font-bold text-secondary">
                          {fightCardsList.filter(card => card.status === 'upcoming').length}
                        </div>
                      </div>
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Upcoming Events
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkle className="w-8 h-8 text-accent" weight="fill" />
                        <div className="text-4xl font-display font-bold text-accent">
                          {fightCardsList.filter(card => card.status === 'upcoming').reduce((total, card) => {
                            const allBouts = [card.mainEvent, ...(card.coMainEvent ? [card.coMainEvent] : []), ...card.otherBouts];
                            return total + allBouts.filter(bout => bout.fighter1 && bout.fighter2).length;
                          }, 0)}
                        </div>
                      </div>
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Scheduled Fights
                      </div>
                    </div>
                  </div>

                  <UpcomingFights fightCards={fightCardsList} boxers={boxersList} />

                  <BoxerLeaderboard boxers={boxersList} onSelectBoxer={setSelectedBoxer} />
                </div>
              </TabsContent>

              <TabsContent value="upcoming-fights" className="mt-6">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
                        Upcoming Fights
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Scheduled bouts awaiting results
                      </p>
                    </div>
                  </div>

                  <UpcomingFights fightCards={fightCardsList} boxers={boxersList} />

                  {fightCardsList.filter(card => card.status === 'upcoming').length > 0 && (
                    <>
                      <div className="mt-8">
                        <h3 className="font-display text-2xl uppercase text-secondary tracking-wide mb-4">
                          Declare Results
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Select a fight card below to declare winners and update fighter records
                        </p>
                      </div>
                      {fightCardsList.filter(card => card.status === 'upcoming').map((card) => (
                        <FightResultsManager
                          key={card.id}
                          fightCard={card}
                          boxers={boxersList}
                          onDeclareResults={handleDeclareResults}
                        />
                      ))}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="directory" className="mt-6">
                <BoxerDirectory 
                  boxers={boxersList} 
                  sponsors={sponsorsList}
                  onUpdateBoxer={handleUpdateBoxer}
                  onDeleteBoxer={handleDeleteBoxer}
                  onViewProfile={setSelectedBoxer}
                />
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <BoxerRegistration onRegister={handleRegisterBoxer} />
              </TabsContent>

              <TabsContent value="generator" className="mt-6">
                <FightCardGenerator boxers={boxersList} allBoxers={boxersList} onGenerate={handleGenerateFightCard} />
              </TabsContent>

              <TabsContent value="sponsors" className="mt-6">
                <div className="flex flex-col gap-6">
                  <SponsorRegistration onRegister={handleRegisterSponsor} />
                  <SponsorList sponsors={sponsorsList} />
                </div>
              </TabsContent>

              <TabsContent value="fight-card" className="mt-6">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
                        Fight Card Editor
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Create and manage your LSBA boxing events
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleSave}
                      disabled={!hasChanges}
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <FloppyDisk className="w-5 h-5 mr-2" />
                      Save Changes
                    </Button>
                  </div>

                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="edit" className="flex items-center gap-2">
                        <PencilSimple className="w-4 h-4" />
                        Edit Card
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="mt-6">
                      <FightCardEditor
                        fightCard={editingCard}
                        onChange={setEditingCard}
                      />
                    </TabsContent>

                    <TabsContent value="preview" className="mt-6">
                      <div className="flex flex-col gap-4">
                        {hasChanges && (
                          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
                            <p className="text-sm text-accent-foreground">
                              You have unsaved changes. Save to update the preview with your latest edits.
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-center">
                          <FightCardDisplay fightCard={currentCard} />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;