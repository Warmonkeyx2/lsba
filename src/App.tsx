import { useState, useRef } from "react";
import { useKV } from "@github/spark/hooks";
import { Eye, PencilSimple, FloppyDisk, DownloadSimple, Copy } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FightCardEditor } from "@/components/FightCardEditor";
import { FightCardDisplay } from "@/components/FightCardDisplay";
import { toast, Toaster } from "sonner";
import type { FightCard } from "@/types/fightCard";
import html2canvas from "html2canvas";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [isExporting, setIsExporting] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    setSavedCard(editingCard);
    toast.success('Fight card saved successfully!');
  };

  const convertImageToDataURL = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      img.onerror = () => {
        resolve(url);
      };
      img.src = url;
    });
  };

  const cloneWithDataURLs = async (element: HTMLElement): Promise<HTMLElement> => {
    const clone = element.cloneNode(true) as HTMLElement;
    const images = clone.querySelectorAll('img');
    
    await Promise.all(
      Array.from(images).map(async (img) => {
        if (img.src && !img.src.startsWith('data:')) {
          try {
            const dataURL = await convertImageToDataURL(img.src);
            img.src = dataURL;
          } catch (error) {
            console.warn('Failed to convert image:', img.src);
          }
        }
      })
    );

    const bgElements = clone.querySelectorAll('[style*="background-image"]');
    await Promise.all(
      Array.from(bgElements).map(async (el) => {
        const htmlEl = el as HTMLElement;
        const style = htmlEl.style.backgroundImage;
        const urlMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:')) {
          try {
            const dataURL = await convertImageToDataURL(urlMatch[1]);
            htmlEl.style.backgroundImage = `url(${dataURL})`;
          } catch (error) {
            console.warn('Failed to convert background image:', urlMatch[1]);
          }
        }
      })
    );

    return clone;
  };

  const handleExportPNG = async () => {
    if (!cardRef.current) return;
    
    setIsExporting(true);
    
    try {
      const clonedElement = await cloneWithDataURLs(cardRef.current);
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);
      tempContainer.appendChild(clonedElement);

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        backgroundColor: '#262626',
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 0,
      });
      
      document.body.removeChild(tempContainer);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob');
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `lsba-fight-card-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        toast.success('Fight card downloaded successfully!');
        setIsExporting(false);
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting image:', error);
      toast.error('Failed to export fight card. Please try again.');
      setIsExporting(false);
    }
  };

  const handleShowImagePreview = async () => {
    if (!cardRef.current) return;
    
    setIsExporting(true);
    
    try {
      const clonedElement = await cloneWithDataURLs(cardRef.current);
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);
      tempContainer.appendChild(clonedElement);

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        backgroundColor: '#262626',
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 0,
      });
      
      document.body.removeChild(tempContainer);

      const dataUrl = canvas.toDataURL('image/png');
      setPreviewImageUrl(dataUrl);
      setImagePreviewOpen(true);
      setIsExporting(false);
      toast.success('Right-click the image and select "Save Image As..." to download');
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview. Please try again.');
      setIsExporting(false);
    }
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
                      {isExporting ? 'Downloading...' : 'Download PNG'}
                    </Button>
                    <Button
                      onClick={handleShowImagePreview}
                      disabled={isExporting}
                      variant="secondary"
                      size="lg"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      {isExporting ? 'Loading...' : 'View & Copy Image'}
                    </Button>
                  </div>
                  
                  <div ref={cardRef}>
                    <FightCardDisplay fightCard={savedCard || defaultFightCard} />
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Download PNG to save locally, or View & Copy to right-click and save the image.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase">Fight Card Image</DialogTitle>
            <DialogDescription>
              Right-click on the image below and select "Save Image As..." to download the fight card.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {previewImageUrl && (
              <img 
                src={previewImageUrl} 
                alt="Fight Card Preview" 
                className="w-full h-auto rounded-lg border border-border"
                style={{ maxWidth: '100%' }}
              />
            )}
            <p className="text-sm text-muted-foreground text-center">
              Right-click the image above and choose "Save Image As..." to download
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;