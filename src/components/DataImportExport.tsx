import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  HardDrive,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import type { Boxer, Sponsor } from '@/types/boxer';
import type { FightCard } from '@/types/fightCard';
import type { Tournament } from '@/types/tournament';
import type { Bet, BettingPool, PayoutSettings } from '@/types/betting';

interface BackupData {
  version: string;
  timestamp: string;
  data: {
    [key: string]: any[];
  };
  metadata: {
    totalRecords: number;
    containers: string[];
    exportedBy: string;
    dataSources?: {
      database: string;
      fallback: string;
      note: string;
    };
  };
}

interface CurrentData {
  boxers: Boxer[];
  sponsors: Sponsor[];
  fightCards: FightCard[];
  tournaments: Tournament[];
  bets: Bet[];
  bettingPools: BettingPool[];
  payoutSettings: PayoutSettings;
}

interface DataImportExportProps {
  onDataUpdate?: () => void;
  currentData?: CurrentData;
}

export function DataImportExport({ onDataUpdate, currentData }: DataImportExportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [operation, setOperation] = useState<string>('');
  const [lastBackup, setLastBackup] = useState<string | null>(
    localStorage.getItem('lsba_last_backup')
  );

  // All container names for complete backup
  const containerNames = [
    'boxers',
    'sponsors', 
    'fights',
    'tournaments',
    'betting',
    'rankings',
    'licenses',
    'roles',
    'permissions',
    'app_settings',
    'payout_settings'
  ];

  const exportData = async (includeContainers: string[] = containerNames) => {
    setIsLoading(true);
    setOperation('Exporting data...');
    setProgress(0);

    try {
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {},
        metadata: {
          totalRecords: 0,
          containers: includeContainers,
          exportedBy: 'LSBA Management System'
        }
      };

      let totalRecords = 0;
      const totalContainers = includeContainers.length;

      for (let i = 0; i < includeContainers.length; i++) {
        const containerName = includeContainers[i];
        setOperation(`Exporting ${containerName}...`);
        setProgress(((i + 1) / totalContainers) * 100);

        try {
          let data = await apiClient.list(containerName);
          
          // If no data in database but we have current data, use that as fallback
          if (data.length === 0 && currentData) {
            switch (containerName) {
              case 'boxers':
                data = currentData.boxers || [];
                break;
              case 'sponsors':
                data = currentData.sponsors || [];
                break;
              case 'fights':
                data = currentData.fightCards || [];
                break;
              case 'tournaments':
                data = currentData.tournaments || [];
                break;
              case 'betting':
                data = currentData.bets || [];
                break;
              case 'betting_pools':
                data = currentData.bettingPools || [];
                break;
              case 'payout_settings':
                data = currentData.payoutSettings ? [currentData.payoutSettings] : [];
                break;
              default:
                data = [];
            }
            
            if (data.length > 0) {
              console.log(`Using current data for ${containerName}:`, data.length, 'records');
            }
          }
          
          backupData.data[containerName] = data;
          totalRecords += data.length;
        } catch (error) {
          console.warn(`Failed to export ${containerName}:`, error);
          backupData.data[containerName] = [];
        }
      }

      backupData.metadata.totalRecords = totalRecords;
      
      // Add information about data sources
      backupData.metadata.dataSources = {
        database: 'CosmosDB',
        fallback: currentData ? 'Local State' : 'None',
        note: 'Some data may come from local state if not yet synced to database'
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lsba-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update last backup time
      const backupTime = new Date().toISOString();
      localStorage.setItem('lsba_last_backup', backupTime);
      setLastBackup(backupTime);

      toast.success(`Backup created successfully! ${totalRecords} records exported.`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to create backup. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setOperation('');
    }
  };

  const importData = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    setOperation('Reading backup file...');
    setProgress(0);

    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);

      // Validate backup format
      if (!backupData.version || !backupData.data || !backupData.timestamp) {
        throw new Error('Invalid backup file format');
      }

      const containers = Object.keys(backupData.data);
      let totalProcessed = 0;
      let totalRecords = 0;

      // Count total records for progress
      containers.forEach(container => {
        totalRecords += backupData.data[container]?.length || 0;
      });

      for (let i = 0; i < containers.length; i++) {
        const containerName = containers[i];
        const containerData = backupData.data[containerName];

        if (!containerData || !Array.isArray(containerData)) continue;

        setOperation(`Importing ${containerName} (${containerData.length} records)...`);

        for (let j = 0; j < containerData.length; j++) {
          const record = containerData[j];
          
          try {
            // Check if record exists
            const existing = await cosmosDB.read(containerName, record.id);
            
            if (existing) {
              // Update existing record
              await cosmosDB.update(containerName, record.id, record);
            } else {
              // Create new record
              await cosmosDB.create(containerName, record);
            }

            totalProcessed++;
            setProgress((totalProcessed / totalRecords) * 100);
          } catch (error) {
            console.warn(`Failed to import record ${record.id} in ${containerName}:`, error);
          }
        }
      }

      if (onDataUpdate) {
        onDataUpdate();
      }

      toast.success(`Import completed! ${totalProcessed} records imported successfully.`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data. Please check the file format and try again.');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setOperation('');
    }
  };

  const clearAllData = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL data from the database. This action cannot be undone. Are you sure you want to continue?')) {
      return;
    }

    if (!confirm('🔴 FINAL WARNING: All boxers, fights, sponsors, tournaments, and settings will be permanently deleted. Type "DELETE" to confirm.')) {
      return;
    }

    setIsLoading(true);
    setOperation('Clearing all data...');
    setProgress(0);

    try {
      for (let i = 0; i < containerNames.length; i++) {
        const containerName = containerNames[i];
        setOperation(`Clearing ${containerName}...`);
        setProgress(((i + 1) / containerNames.length) * 100);

        try {
          const records = await cosmosDB.list(containerName);
          
          for (const record of records) {
            await cosmosDB.delete(containerName, record.id);
          }
        } catch (error) {
          console.warn(`Failed to clear ${containerName}:`, error);
        }
      }

      if (onDataUpdate) {
        onDataUpdate();
      }

      toast.success('All data has been cleared successfully.');
    } catch (error) {
      console.error('Clear data error:', error);
      toast.error('Failed to clear all data. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setOperation('');
    }
  };

  const exportTemplate = () => {
    const template = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        boxers: [{
          id: 'example-boxer-1',
          stateId: 'BX001',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '555-0123',
          timezone: 'UTC',
          wins: 0,
          losses: 0,
          knockouts: 0,
          rankingPoints: 0,
          fightHistory: [],
          feePaid: false,
          licenseStatus: 'active',
          registeredDate: new Date().toISOString()
        }],
        sponsors: [{
          id: 'example-sponsor-1',
          stateId: 'SP001',
          name: 'Example Sponsor',
          contactPerson: 'Jane Smith',
          phoneNumber: '555-0124',
          registeredDate: new Date().toISOString(),
          boxersSponsored: [],
          additionalContacts: []
        }]
      },
      metadata: {
        totalRecords: 2,
        containers: ['boxers', 'sponsors'],
        exportedBy: 'LSBA Template Generator'
      }
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lsba-import-template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Import template downloaded successfully!');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Database className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Data Management</h2>
      </div>

      {isLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">{operation}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {Math.round(progress)}% complete
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="backup" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5" />
                <span>Create Backup</span>
              </CardTitle>
              <CardDescription>
                Create a complete backup of all LSBA data including boxers, fights, sponsors, and settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Backup:</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(lastBackup)}
                  </span>
                </div>
                <Badge variant={lastBackup ? "default" : "secondary"}>
                  {lastBackup ? "Available" : "None"}
                </Badge>
              </div>

              <Button 
                onClick={() => exportData()} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Create Full Backup
              </Button>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Backups include all data containers and can be used to restore your complete LSBA system.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Import Data</span>
              </CardTitle>
              <CardDescription>
                Import data from a backup file or CSV. Existing records will be updated, new records will be created.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-file">Select Backup File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      importData(file);
                    }
                  }}
                  disabled={isLoading}
                />
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Only import backup files created by this system. Invalid files may cause data corruption.
                </AlertDescription>
              </Alert>

              <Separator />

              <div className="space-y-2">
                <Label>Need a Template?</Label>
                <Button 
                  variant="outline" 
                  onClick={exportTemplate}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Import Template
                </Button>
                <p className="text-xs text-muted-foreground">
                  Download a template file with example data format for custom imports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export Data</span>
              </CardTitle>
              <CardDescription>
                Export specific data collections for analysis, reporting, or partial backups.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => exportData(['boxers'])}
                  disabled={isLoading}
                >
                  Export Boxers
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => exportData(['sponsors'])}
                  disabled={isLoading}
                >
                  Export Sponsors  
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => exportData(['fights'])}
                  disabled={isLoading}
                >
                  Export Fights
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => exportData(['tournaments'])}
                  disabled={isLoading}
                >
                  Export Tournaments
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => exportData(['betting'])}
                  disabled={isLoading}
                >
                  Export Betting Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => exportData(['rankings', 'licenses', 'roles', 'permissions', 'app_settings'])}
                  disabled={isLoading}
                >
                  Export Settings
                </Button>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Partial exports are useful for data analysis, reporting, or sharing specific datasets.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5" />
                <span>Database Maintenance</span>
              </CardTitle>
              <CardDescription>
                Advanced maintenance operations. Use with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Danger Zone:</strong> These operations permanently modify or delete data. 
                  Always create a backup before proceeding.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-2">Clear All Data</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Permanently delete all data from the database. This cannot be undone.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={clearAllData}
                    disabled={isLoading}
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Always backup your data before maintenance operations</p>
                <p>• Data clearing operations cannot be undone</p>
                <p>• Contact support if you need assistance with data recovery</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}