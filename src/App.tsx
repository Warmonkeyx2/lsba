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
  Calendar,
  Sliders,
  Info,
  ArrowsClockwise
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
import { SponsorProfile } from "@/components/SponsorProfile";
import { BoxerDirectory } from "@/components/BoxerDirectory";
import { UpcomingFights } from "@/components/UpcomingFights";
import { FightResultsManager } from "@/components/FightResultsManager";
import { RankingFAQ } from "@/components/RankingFAQ";
import { RankingSettingsComponent } from "@/components/RankingSettings";
import { SeasonReset } from "@/components/SeasonReset";
import { toast, Toaster } from "sonner";
import type { FightCard } from "@/types/fightCard";
import type { Boxer, Sponsor, RankingSettings } from "@/types/boxer";
import { DEFAULT_RANKING_SETTINGS, calculatePointsForFight, getSortedBoxers } from "@/lib/rankingUtils";

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
  const [rankingSettings, setRankingSettings] = useKV<RankingSettings>('lsba-ranking-settings', DEFAULT_RANKING_SETTINGS);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedBoxer, setSelectedBoxer] = useState<Boxer | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  const boxersList = boxers || [];
  const sponsorsList = sponsors || [];
  const fightCardsList = fightCards || [];
  const currentCard = savedCard || defaultFightCard;
  const currentSettings = rankingSettings || DEFAULT_RANKING_SETTINGS;

  const handleSave = () => {
    setSavedCard(editingCard);
    toast.success('Fight card saved successfully!');
  };

  const handleRegisterBoxer = (boxer: Boxer) => {
    setBoxers((current) => [...(current || []), boxer]);
    
    if (boxer.sponsor) {
      setSponsors((current) => {
        const updated = [...(current || [])];
        const sponsorIndex = updated.findIndex(s => s.name.toLowerCase() === boxer.sponsor.toLowerCase());
        
        if (sponsorIndex !== -1) {
          updated[sponsorIndex].boxersSponsored = [
            ...updated[sponsorIndex].boxersSponsored,
            boxer.id
          ];
        }
        
        return updated;
      });
    }
  };

  const handleRegisterSponsor = (sponsor: Sponsor) => {
    setSponsors((current) => [...(current || []), sponsor]);
  };

  const handleUpdateBoxer = (updatedBoxer: Boxer) => {
    const oldBoxer = boxersList.find(b => b.id === updatedBoxer.id);
    
    setBoxers((current) =>
      (current || []).map((b) => (b.id === updatedBoxer.id ? updatedBoxer : b))
    );
    setSelectedBoxer(updatedBoxer);
    
    if (oldBoxer && oldBoxer.sponsor !== updatedBoxer.sponsor) {
      setSponsors((current) => {
        const updated = [...(current || [])];
        
        if (oldBoxer.sponsor) {
          const oldSponsorIndex = updated.findIndex(s => s.name.toLowerCase() === oldBoxer.sponsor.toLowerCase());
          if (oldSponsorIndex !== -1) {
            updated[oldSponsorIndex].boxersSponsored = updated[oldSponsorIndex].boxersSponsored.filter(
              id => id !== updatedBoxer.id
            );
          }
        }
        
        if (updatedBoxer.sponsor) {
          const newSponsorIndex = updated.findIndex(s => s.name.toLowerCase() === updatedBoxer.sponsor.toLowerCase());
          if (newSponsorIndex !== -1 && !updated[newSponsorIndex].boxersSponsored.includes(updatedBoxer.id)) {
            updated[newSponsorIndex].boxersSponsored = [
              ...updated[newSponsorIndex].boxersSponsored,
              updatedBoxer.id
            ];
          }
        }
        
        return updated;
      });
    }
  };

  const handleDeleteBoxer = (boxerId: string) => {
    const boxer = boxersList.find(b => b.id === boxerId);
    
    setBoxers((current) => (current || []).filter((b) => b.id !== boxerId));
    
    if (boxer?.sponsor) {
      setSponsors((current) => {
        const updated = [...(current || [])];
        const sponsorIndex = updated.findIndex(s => s.name.toLowerCase() === boxer.sponsor.toLowerCase());
        
        if (sponsorIndex !== -1) {
          updated[sponsorIndex].boxersSponsored = updated[sponsorIndex].boxersSponsored.filter(
            id => id !== boxerId
          );
        }
        
        return updated;
      });
    }
    
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
      
      const allBouts = [
        updatedCard.mainEvent,
        ...(updatedCard.coMainEvent ? [updatedCard.coMainEvent] : []),
        ...updatedCard.otherBouts,
      ];

      allBouts.forEach((bout) => {
        if (bout.winner && bout.fighter1Id && bout.fighter2Id) {
          const winnerIndex = updated.findIndex((b) => 
            b.id === (bout.winner === 'fighter1' ? bout.fighter1Id : bout.fighter2Id)
          );
          const loserIndex = updated.findIndex((b) => 
            b.id === (bout.winner === 'fighter1' ? bout.fighter2Id : bout.fighter1Id)
          );

          if (winnerIndex !== -1 && loserIndex !== -1) {
            const winner = updated[winnerIndex];
            const loser = updated[loserIndex];
            const knockout = bout.knockout || false;

            const { winnerPoints, loserPoints } = calculatePointsForFight(
              winner,
              loser,
              knockout,
              updated,
              currentSettings
            );

            updated[winnerIndex].rankingPoints += winnerPoints;
            updated[loserIndex].rankingPoints = Math.max(0, updated[loserIndex].rankingPoints + loserPoints);

            updated[winnerIndex].fightHistory = updated[winnerIndex].fightHistory.map((fight) => {
              if (fight.fightCardId === updatedCard.id && fight.result === 'pending') {
                return {
                  ...fight,
                  result: knockout ? 'knockout' : 'win',
                  pointsChange: winnerPoints,
                };
              }
              return fight;
            });

            updated[loserIndex].fightHistory = updated[loserIndex].fightHistory.map((fight) => {
              if (fight.fightCardId === updatedCard.id && fight.result === 'pending') {
                return {
                  ...fight,
                  result: 'loss',
                  pointsChange: loserPoints,
                };
              }
              return fight;
            });
          }
        }
      });

      boxerUpdates.forEach((updates, boxerId) => {
        const index = updated.findIndex((b) => b.id === boxerId);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            wins: updates.wins ?? updated[index].wins,
            losses: updates.losses ?? updated[index].losses,
            knockouts: updates.knockouts ?? updated[index].knockouts,
          };
        }
      });

      return updated;
    });

    toast.success('Fight results declared! Rankings updated with new points.');
  };

  const handleResetSeason = () => {
    setBoxers((current) =>
      (current || []).map((boxer) => ({
        ...boxer,
        rankingPoints: 0,
        fightHistory: [],
      }))
    );
    toast.success('Season reset! All ranking points and fight history cleared.');
  };

  const handleClearAll = () => {
    setBoxers([]);
    setFightCards([]);
    setSavedCard(defaultFightCard);
    setEditingCard(defaultFightCard);
    toast.success('All data cleared. Starting fresh!');
  };

  const handleSaveSettings = (settings: RankingSettings) => {
    setRankingSettings(settings);
  };

  const handleUpdateSponsor = (updatedSponsor: Sponsor) => {
    setSponsors((current) =>
      (current || []).map((s) => (s.id === updatedSponsor.id ? updatedSponsor : s))
    );
    setSelectedSponsor(updatedSponsor);
    toast.success('Sponsor updated successfully!');
  };

  const hasChanges = JSON.stringify(currentCard) !== JSON.stringify(editingCard);

  if (selectedSponsor) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Toaster position="top-center" richColors />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <SponsorProfile
              sponsor={selectedSponsor}
              boxers={boxersList}
              onBack={() => setSelectedSponsor(null)}
              onUpdateSponsor={handleUpdateSponsor}
            />
          </div>
        </div>
      </div>
    );
  }

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
              <TabsList className="grid w-full grid-cols-5 md:grid-cols-10 h-auto gap-1">
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
                <TabsTrigger value="faq" className="flex items-center gap-2 py-3">
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline">FAQ</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
                  <Sliders className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
                <TabsTrigger value="season" className="flex items-center gap-2 py-3">
                  <ArrowsClockwise className="w-4 h-4" />
                  <span className="hidden sm:inline">Season</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <ChartLine className="w-8 h-8 text-primary" weight="bold" />
                        <div className="text-4xl font-display font-bold text-primary">
                          {getSortedBoxers(boxersList).length}
                        </div>
                      </div>
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Ranked Fighters
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
                          {boxersList.length}
                        </div>
                      </div>
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Total Registered
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
                  onViewSponsorProfile={setSelectedSponsor}
                />
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <BoxerRegistration 
                  onRegister={handleRegisterBoxer} 
                  existingBoxers={boxersList}
                  existingSponsors={sponsorsList}
                />
              </TabsContent>

              <TabsContent value="generator" className="mt-6">
                <FightCardGenerator boxers={boxersList} allBoxers={boxersList} onGenerate={handleGenerateFightCard} />
              </TabsContent>

              <TabsContent value="sponsors" className="mt-6">
                <div className="flex flex-col gap-6">
                  <SponsorRegistration 
                    onRegister={handleRegisterSponsor} 
                    existingSponsors={sponsorsList}
                  />
                  <SponsorList 
                    sponsors={sponsorsList} 
                    onViewProfile={setSelectedSponsor}
                  />
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

              <TabsContent value="faq" className="mt-6">
                <RankingFAQ settings={currentSettings} />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <RankingSettingsComponent settings={currentSettings} onSave={handleSaveSettings} />
              </TabsContent>

              <TabsContent value="season" className="mt-6">
                <SeasonReset 
                  boxers={boxersList} 
                  onResetSeason={handleResetSeason}
                  onClearAll={handleClearAll}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;