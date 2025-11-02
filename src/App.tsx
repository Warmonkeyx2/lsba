import { useState, useRef } from "react";
import { useKV } from "@github/spark/hooks";
import { Eye, PencilSimple, FloppyDisk, DownloadSimple, QrCode, Copy } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FightCardEditor } from "@/components/FightCardEditor";
import { FightCardDisplay } from "@/components/FightCardDisplay";
import { toast, Toaster } from "sonner";
import type { FightCard } from "@/types/fightCard";
import html2canvas from "html2canvas";
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
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
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
        useCORS: false,
        allowTaint: true,
        logging: false,
        imageTimeout: 0,
      });
      
      document.body.removeChild(tempContainer);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob');
        }
        
        if ('showSaveFilePicker' in window) {
          try {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: `lsba-fight-card-${Date.now()}.png`,
              types: [{
                description: 'PNG Image',
                accept: { 'image/png': ['.png'] },
              }],
            });
            
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            
            toast.success('Fight card exported successfully!');
          } catch (err: any) {
            if (err.name === 'AbortError') {
              setIsExporting(false);
              return;
            }
            throw err;
          }
        } else {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `lsba-fight-card-${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast.success('Fight card exported successfully!');
        }
        
        setIsExporting(false);
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting image:', error);
      toast.error('Failed to export fight card. Please try again.');
      setIsExporting(false);
    }
  };

  const uploadToImgBB = async (): Promise<string> => {
    if (!cardRef.current) throw new Error('Card reference not found');
    
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
      useCORS: false,
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
    });

    document.body.removeChild(tempContainer);

    const base64Data = canvas.toDataURL('image/png').split(',')[1];
    
    const formData = new FormData();
    formData.append('image', base64Data);
    
    const response = await fetch('https://api.imgbb.com/1/upload?key=d36eb6591370ae7f9089d85875e56b22', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to ImgBB');
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleGenerateQR = async () => {
    setIsUploading(true);
    try {
      const imageUrl = await uploadToImgBB();
      setUploadedImageUrl(imageUrl);
      setQrModalOpen(true);
      toast.success('Fight card uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload fight card image');
    } finally {
      setIsUploading(false);
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
                      {isExporting ? 'Exporting...' : 'Export as PNG'}
                    </Button>
                    <Button
                      onClick={handleGenerateQR}
                      disabled={isUploading}
                      variant="secondary"
                      size="lg"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      {isUploading ? 'Uploading...' : 'Generate QR Code'}
                    </Button>
                  </div>
                  
                  <div ref={cardRef}>
                    <FightCardDisplay fightCard={savedCard || defaultFightCard} />
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Export as PNG for local use, or generate a QR code to get a shareable image link!</p>
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
              Scan this QR code to view the fight card image. The image is hosted on ImgBB and can be used in Discord or stream overlays.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG 
                value={uploadedImageUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground text-center uppercase tracking-wider">
                Image URL
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={uploadedImageUrl} 
                  readOnly 
                  className="flex-1 px-3 py-2 text-sm bg-muted rounded border border-border text-foreground"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(uploadedImageUrl);
                    toast.success('URL copied to clipboard!');
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
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