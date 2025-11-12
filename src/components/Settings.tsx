import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppSettingsManager } from './AppSettingsManager';
import { DataImportExport } from './DataImportExport';
import { LSBARevenueConfig } from './LSBARevenueConfig';
import { cosmosDB } from '@/lib/cosmosdb';
import { toast } from 'sonner';
import type { AppSettings } from '@/types/permissions';
import type { PayoutSettings } from '@/types/betting';
import { DEFAULT_PAYOUT_SETTINGS } from '@/lib/bettingUtils';

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
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>(DEFAULT_PAYOUT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load app settings
      const savedSettings = await cosmosDB.read('app_settings', 'main');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...savedSettings });
      }

      // Load payout settings
      const savedPayoutSettings = await cosmosDB.read('payout_settings', 'main');
      if (savedPayoutSettings) {
        setPayoutSettings({ ...DEFAULT_PAYOUT_SETTINGS, ...savedPayoutSettings });
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
      
  const handleUpdatePayoutSettings = async (newSettings: PayoutSettings) => {
    try {
      setIsLoading(true);
      await cosmosDB.update('payout_settings', 'main', { 
        id: 'main', 
        ...newSettings 
      });
      setPayoutSettings(newSettings);
      toast.success('LSBA revenue settings updated successfully');
      
      // Trigger data update if callback provided
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('Failed to update payout settings:', error);
      toast.error('Failed to update LSBA revenue settings');
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="revenue">LSBA Revenue</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <AppSettingsManager
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        </TabsContent>

        <TabsContent value="revenue">
          <LSBARevenueConfig
            settings={payoutSettings}
            onUpdateSettings={handleUpdatePayoutSettings}
          />
        </TabsContent>

        <TabsContent value="data">
          <DataImportExport onDataUpdate={onDataUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}