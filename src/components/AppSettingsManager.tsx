import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Gear, Info, Palette, TextAa } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { AppSettings } from '@/types/permissions';

interface AppSettingsManagerProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export function AppSettingsManager({
  settings,
  onUpdateSettings,
}: AppSettingsManagerProps) {
  const [formData, setFormData] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof AppSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!formData.appTitle.trim()) {
      toast.error('Application title is required');
      return;
    }
    onUpdateSettings(formData);
    setHasChanges(false);
    toast.success('Application settings updated successfully');
  };

  const handleReset = () => {
    setFormData(settings);
    setHasChanges(false);
    toast.info('Changes discarded');
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Gear className="w-5 h-5 text-primary" weight="fill" />
                <CardTitle className="font-display text-2xl uppercase tracking-wide">
                  Application Settings
                </CardTitle>
              </div>
              <CardDescription>
                Customize application branding and display settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TextAa className="w-5 h-5 text-primary" weight="fill" />
                <h4 className="font-display text-lg uppercase">Branding</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="app-title">Application Title</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          The main title displayed in the header. This is the primary
                          branding for your application.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="app-title"
                    value={formData.appTitle}
                    onChange={(e) => handleChange('appTitle', e.target.value)}
                    placeholder="e.g., LSBA Manager"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          The official name of your organization or league.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="org-name"
                    value={formData.organizationName}
                    onChange={(e) => handleChange('organizationName', e.target.value)}
                    placeholder="e.g., Los Santos Boxing Association"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="app-subtitle">Application Subtitle</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        A descriptive tagline that appears below the main title,
                        explaining what the application does.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="app-subtitle"
                  value={formData.appSubtitle}
                  onChange={(e) => handleChange('appSubtitle', e.target.value)}
                  placeholder="e.g., Los Santos Boxing Association - Complete Management System"
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-primary" weight="fill" />
                <h4 className="font-display text-lg uppercase">Colors (Optional)</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Main brand color for buttons and key UI elements. Use OKLCH
                          format (e.g., oklch(0.45 0.21 25)).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      value={formData.primaryColor || ''}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      placeholder="oklch(0.45 0.21 25)"
                    />
                    {formData.primaryColor && (
                      <div
                        className="w-10 h-10 rounded border border-border flex-shrink-0"
                        style={{ backgroundColor: formData.primaryColor }}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Supporting brand color for secondary UI elements.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      value={formData.secondaryColor || ''}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      placeholder="oklch(0.80 0.15 85)"
                    />
                    {formData.secondaryColor && (
                      <div
                        className="w-10 h-10 rounded border border-border flex-shrink-0"
                        style={{ backgroundColor: formData.secondaryColor }}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Accent color for highlights and attention-grabbing elements.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      value={formData.accentColor || ''}
                      onChange={(e) => handleChange('accentColor', e.target.value)}
                      placeholder="oklch(0.85 0.18 90)"
                    />
                    {formData.accentColor && (
                      <div
                        className="w-10 h-10 rounded border border-border flex-shrink-0"
                        style={{ backgroundColor: formData.accentColor }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges}
              >
                Discard Changes
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges}>
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
