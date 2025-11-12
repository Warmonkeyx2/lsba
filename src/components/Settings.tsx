import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppSettingsManager } from './AppSettingsManager';
import { DataImportExport } from './DataImportExport';
import { cosmosDB } from '@/lib/cosmosdb';
import { toast } from 'sonner';
import type { AppSettings } from '@/types/permissions';

const defaultSettings: AppSettings = {
  appTitle: 'LSBA Management System',
  appSubtitle: 'Professional Boxing Association Management',
  organizationName: 'Local State Boxing Association',
  primaryColor: 'oklch(0.70 0.20 142)',
  secondaryColor: 'oklch(0.80 0.15 85)',
  accentColor: 'oklch(0.85 0.18 90)',
};

interface SettingsProps {
  onDataUpdate?: () => void;
}

export function Settings({ onDataUpdate }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await cosmosDB.read('app_settings', 'main');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...savedSettings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use default settings if loading fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    try {
      setIsLoading(true);
      await cosmosDB.update('app_settings', 'main', { 
        id: 'main', 
        ...newSettings 
      });
      setSettings(newSettings);
      
      // Apply theme colors to CSS variables
      if (newSettings.primaryColor) {
        document.documentElement.style.setProperty('--primary', newSettings.primaryColor);
      }
      if (newSettings.secondaryColor) {
        document.documentElement.style.setProperty('--secondary', newSettings.secondaryColor);
      }
      if (newSettings.accentColor) {
        document.documentElement.style.setProperty('--accent', newSettings.accentColor);
      }
      
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage application settings, data backup, import, and export.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <AppSettingsManager
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        </TabsContent>

        <TabsContent value="data">
          <DataImportExport onDataUpdate={onDataUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}