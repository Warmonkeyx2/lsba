import { useState, useRef } from "react";
import { useKV } from "@github/spark/hooks";
import { Eye, PencilSimple, FloppyDisk, DownloadSimple, QrCode } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FightCardEditor } from "@/components/FightCardEditor";
import { FightCardDisplay } from "@/components/FightCardDisplay";
import { toast, Toaster } from "sonner";
import type { FightCard } from "@/types/fightCard";
import { toPng } from "html-to-image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

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
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    setSavedCard(editingCard);
    toast.success('Fight card saved successfully!');
  };

  const handleExportPNG = async () => {
    if (!cardRef.current) return;
    
    setIsExporting(true);
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#1e1e1e',
      });
      
      const link = document.createElement('a');
      link.download = `lsba-fight-card-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Fight card exported successfully!');
    } catch (error) {
      console.error('Error exporting image:', error);
      toast.error('Failed to export fight card');
    } finally {
      setIsExporting(false);
    }
  };

  const appUrl = window.location.href;
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
              
              <div className="flex flex-wrap gap-2">
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
                  
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={handleExportPNG}
                      disabled={isExporting}
                      variant="secondary"
                      size="lg"
                    >
                      <DownloadSimple className="w-5 h-5 mr-2" />
                      {isExporting ? 'Exporting...' : 'Export as PNG'}
                    </Button>
                    <Button
                      onClick={() => setQrModalOpen(true)}
                      variant="secondary"
                      size="lg"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Generate QR Code
                    </Button>
                  </div>
                  
                  <div ref={cardRef}>
                    <FightCardDisplay fightCard={savedCard || defaultFightCard} />
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Export as PNG or generate a QR code to share on Discord or in stream overlays!</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase">QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to view the fight card or add it to your stream overlays.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG 
                value={appUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              This QR code links to your fight card manager
            </p>
            <Button
              onClick={() => {
                const svg = document.querySelector('svg');
                if (svg) {
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  
                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    
                    const link = document.createElement('a');
                    link.download = `lsba-qr-code-${Date.now()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    toast.success('QR code downloaded!');
                  };
                  
                  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                }
              }}
              variant="secondary"
              className="w-full"
            >
              <DownloadSimple className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;