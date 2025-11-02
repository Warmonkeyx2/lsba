import { useState } from "react";
import { useKV } from "@github/spark/hooks";
import { Eye, PencilSimple, FloppyDisk } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FightCardEditor } from "@/components/FightCardEditor";
import { FightCardDisplay } from "@/components/FightCardDisplay";
import { toast, Toaster } from "sonner";
import type { FightCard } from "@/types/fightCard";

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
  const [activeTab, setActiveTab] = useState<string>('edit');

  const handleSave = () => {
    setSavedCard(editingCard);
    toast.success('Fight card saved successfully!');
  };

  const hasChanges = JSON.stringify(savedCard) !== JSON.stringify(editingCard);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" richColors />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl md:text-5xl uppercase text-secondary tracking-wide">
                  Fight Card Manager
                </h1>
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  <FightCardDisplay fightCard={savedCard || defaultFightCard} />
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Take a screenshot of this card to share on Discord or in-game!</p>
                  </div>
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