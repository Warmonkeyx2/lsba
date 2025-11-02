import { useState } from "react";
import { useKV } from "@github/spark/hooks";
import { 
  Eye, 
  PencilSimple, 
  FloppyDisk, 
  ChartLine, 
  UserPlus, 
  Sparkle,
  SquaresFour 
} from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FightCardEditor } from "@/components/FightCardEditor";
import { FightCardDisplay } from "@/components/FightCardDisplay";
import { BoxerRegistration } from "@/components/BoxerRegistration";
import { BoxerLeaderboard } from "@/components/BoxerLeaderboard";
import { BoxerProfile } from "@/components/BoxerProfile";
import { FightCardGenerator } from "@/components/FightCardGenerator";
import { toast, Toaster } from "sonner";
import type { FightCard } from "@/types/fightCard";
import type { Boxer } from "@/types/boxer";

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
};

function App() {
  const [savedCard, setSavedCard] = useKV<FightCard>('lsba-fight-card', defaultFightCard);
  const [editingCard, setEditingCard] = useState<FightCard>(savedCard || defaultFightCard);
  const [boxers, setBoxers] = useKV<Boxer[]>('lsba-boxers', []);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedBoxer, setSelectedBoxer] = useState<Boxer | null>(null);

  const boxersList = boxers || [];
  const currentCard = savedCard || defaultFightCard;

  const handleSave = () => {
    setSavedCard(editingCard);
    toast.success('Fight card saved successfully!');
  };

  const handleRegisterBoxer = (boxer: Boxer) => {
    setBoxers((current) => [...(current || []), boxer]);
  };

  const handleUpdateBoxer = (updatedBoxer: Boxer) => {
    setBoxers((current) =>
      (current || []).map((b) => (b.id === updatedBoxer.id ? updatedBoxer : b))
    );
    setSelectedBoxer(updatedBoxer);
  };

  const handleGenerateFightCard = (fightCard: FightCard) => {
    setEditingCard(fightCard);
    setSavedCard(fightCard);
    setActiveTab('fight-card');
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
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3">
                  <SquaresFour className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2 py-3">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Register</span>
                </TabsTrigger>
                <TabsTrigger value="generator" className="flex items-center gap-2 py-3">
                  <Sparkle className="w-4 h-4" />
                  <span className="hidden sm:inline">Generator</span>
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
                        <FloppyDisk className="w-8 h-8 text-secondary" weight="bold" />
                        <div className="text-4xl font-display font-bold text-secondary">
                          {currentCard.mainEvent.fighter1 ? '1' : '0'}
                        </div>
                      </div>
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Active Fight Cards
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkle className="w-8 h-8 text-accent" weight="fill" />
                        <div className="text-4xl font-display font-bold text-accent">
                          {Math.floor(boxersList.length / 2)}
                        </div>
                      </div>
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Possible Matches
                      </div>
                    </div>
                  </div>

                  <BoxerLeaderboard boxers={boxersList} onSelectBoxer={setSelectedBoxer} />
                </div>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <BoxerRegistration onRegister={handleRegisterBoxer} />
              </TabsContent>

              <TabsContent value="generator" className="mt-6">
                <FightCardGenerator boxers={boxersList} onGenerate={handleGenerateFightCard} />
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