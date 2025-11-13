import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppSettingsManager } from './AppSettingsManager';
import { DataImportExport } from './DataImportExport';
import { LSBARevenueConfig } from './LSBARevenueConfig';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import type { AppSettings } from '@/types/permissions';
import type { PayoutSettings } from '@/types/betting';
import { DEFAULT_PAYOUT_SETTINGS } from '@/lib/bettingUtils';
import type { Boxer, Sponsor } from '@/types/boxer';
import type { FightCard } from '@/types/fightCard';
import type { Tournament } from '@/types/tournament';
import type { Bet, BettingPool } from '@/types/betting';

const defaultSettings: AppSettings = {
  appTitle: 'LSBA Management System',
  appSubtitle: 'Professional Boxing Association Management',
  organizationName: 'Local State Boxing Association',
  primaryColor: 'oklch(0.70 0.20 142)',
  secondaryColor: 'oklch(0.80 0.15 85)',
  accentColor: 'oklch(0.85 0.18 90)',
};

interface CurrentData {
  boxers: Boxer[];
  sponsors: Sponsor[];
  fightCards: FightCard[];
  tournaments: Tournament[];
  bets: Bet[];
  bettingPools: BettingPool[];
  payoutSettings: PayoutSettings;
}

interface SettingsProps {
  onDataUpdate?: () => void;
  currentData?: CurrentData;
}

export function Settings({ onDataUpdate, currentData }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>(DEFAULT_PAYOUT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load app settings
      const savedSettings = await apiClient.get('/app-settings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...savedSettings });
      }

      // Load payout settings
      const savedPayoutSettings = await apiClient.get('/payout-settings');
      if (savedPayoutSettings) {
        setPayoutSettings({ ...DEFAULT_PAYOUT_SETTINGS, ...savedPayoutSettings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

    const saveSettings = async (newSettings: AppSettings) => {
    try {
      await apiClient.put('/app-settings', { 
        ...newSettings, 
        id: 'main',
        updatedAt: new Date().toISOString() 
      });
      setSettings(newSettings);
      toast.success('App settings saved successfully');
      
      // Trigger parent component update if callback provided
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('Failed to save app settings:', error);
      toast.error('Failed to save app settings');
    }
  };
      
    const savePayoutSettings = async (newPayoutSettings: PayoutSettings) => {
    try {
      await apiClient.put('/payout-settings', { 
        ...newPayoutSettings, 
        id: 'main',
        updatedAt: new Date().toISOString() 
      });
      setPayoutSettings(newPayoutSettings);
      toast.success('Payout settings saved successfully');
      
      // Trigger parent component update if callback provided
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('Failed to save payout settings:', error);
      toast.error('Failed to save payout settings');
    }
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
  };

  const handleUpdatePayoutSettings = (newPayoutSettings: PayoutSettings) => {
    savePayoutSettings(newPayoutSettings);
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
          <DataImportExport 
            onDataUpdate={onDataUpdate} 
            currentData={currentData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}