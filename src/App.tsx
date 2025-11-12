import { useState, useEffect } from "react";
import { 
  Eye, 
  PencilSimple, 
  FloppyDisk, 
  ChartLine, 
  UserPlus, 
  Sparkle,
  SquaresFour,
  Briefcase,
  AddressBook,
  Calendar,
  Sliders,
  Info,
  ArrowsClockwise,
  Trophy,
  CurrencyDollar,
  IdentificationCard,
  CaretDown,
  Book
} from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { FightCardEditor } from "@/components/FightCardEditor";
import { FightCardDisplay } from "@/components/FightCardDisplay";
import { BoxerRegistration } from "@/components/BoxerRegistration";
import { BoxerLeaderboard } from "@/components/BoxerLeaderboard";
import { BoxerProfile } from "@/components/BoxerProfile";
import { FightCardGenerator } from "@/components/FightCardGenerator";
import { SponsorRegistration } from "@/components/SponsorRegistration";
import { SponsorList } from "@/components/SponsorList";
import { SponsorProfile } from "@/components/SponsorProfile";
import { BoxerDirectory } from "@/components/BoxerDirectory";
import { UpcomingFights } from "@/components/UpcomingFights";
import { FightResultsManager } from "@/components/FightResultsManager";
import { RankingFAQ } from "@/components/RankingFAQ";
import { RankingSettingsComponent } from "@/components/RankingSettings";
import { SeasonReset } from "@/components/SeasonReset";
import { TournamentBracket } from "@/components/TournamentBracket";
import { BettingManager } from "@/components/BettingManager";
import { FighterOddsDisplay } from "@/components/FighterOddsDisplay";
import { LicenseManager } from "@/components/LicenseManager";
import { HelpGuide } from "@/components/HelpGuide";
import { Settings } from "@/components/Settings";
import { toast, Toaster } from "sonner";
import type { FightCard } from "@/types/fightCard";
import type { Boxer, Sponsor, RankingSettings } from "@/types/boxer";
import type { Tournament } from "@/types/tournament";
import type { Bet, BettingPool, PayoutSettings } from "@/types/betting";
import { DEFAULT_RANKING_SETTINGS, calculatePointsForFight, getSortedBoxers } from "@/lib/rankingUtils";
import { settleBet, DEFAULT_PAYOUT_SETTINGS } from "@/lib/bettingUtils";
import { LICENSE_FEE } from "@/lib/licenseUtils";
import type { BettingConfig } from "@/types/betting";

// CosmosDB client
import { cosmosDB, initializeCosmosDB } from "./lib/cosmosdb";

const DEFAULT_BETTING_CONFIG: BettingConfig = {
  id: 'default',
  enabled: true,
  eventPricing: {
    regular: 2000,
    special: 5000,
    tournament: 5000,
  },
  wageLimits: {
    minimum: 2000,
    maximum: 50000,
    perFight: 10000,
    perEvent: 50000,
  },
  lastUpdated: new Date().toISOString(),
};

/**
 * Note:
 * - This file keeps the same app structure and UI as your original App.tsx.
 * - I added CosmosDB syncing functions. The app still uses local state for persistence,
 *   but now the main CRUD handlers also attempt to persist changes to your CosmosDB instance.
 * - This is intentionally minimally invasive so the UI/UX and local behaviour remain unchanged,
 *   but database writes now occur so changes persist to CosmosDB.
 */

/* ---------- default data ---------- */
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
  status: 'upcoming',
};

/* ---------- small helpers to map boxer shape (app <-> db) ---------- */
/* CosmosDB uses the same field names as our TypeScript interfaces, so no mapping needed */
function toDbBoxer(boxer: any) {
  return {
    id: boxer.id,
    stateId: boxer.stateId,
    firstName: boxer.firstName,
    lastName: boxer.lastName,
    phoneNumber: boxer.phoneNumber,
    sponsor: boxer.sponsor,
    profileImage: boxer.profileImage,
    timezone: boxer.timezone,
    feePaid: boxer.feePaid ?? false,
    lastPaymentDate: boxer.lastPaymentDate ?? null,
    licenseStatus: boxer.licenseStatus ?? 'active',
    wins: boxer.wins ?? 0,
    losses: boxer.losses ?? 0,
    knockouts: boxer.knockouts ?? 0,
    fightHistory: boxer.fightHistory ?? [],
    suspensionReason: boxer.suspensionReason ?? null,
    suspensionDate: boxer.suspensionDate ?? null,
    registeredDate: boxer.registeredDate ?? null,
    rankingPoints: boxer.rankingPoints ?? 0,
    licenseFee: boxer.licenseFee ?? LICENSE_FEE,
  };
}

function fromDbBoxer(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    stateId: row.stateId,
    firstName: row.firstName,
    lastName: row.lastName,
    phoneNumber: row.phoneNumber,
    sponsor: row.sponsor,
    profileImage: row.profileImage,
    timezone: row.timezone,
    feePaid: row.feePaid,
    lastPaymentDate: row.lastPaymentDate,
    licenseStatus: row.licenseStatus,
    wins: row.wins,
    losses: row.losses,
    knockouts: row.knockouts,
    fightHistory: row.fightHistory ?? [],
    suspensionReason: row.suspensionReason,
    suspensionDate: row.suspensionDate,
    registeredDate: row.registeredDate,
    rankingPoints: row.rankingPoints ?? 0,
    licenseFee: row.licenseFee ?? LICENSE_FEE,
  };
}

/* ---------- App component (main) ---------- */
function App() {
  // --- THIS IS THE FIXED CODE ---
  const [savedCard, setSavedCard] = useState<FightCard>(defaultFightCard);
  const [fightCards, setFightCards] = useState<FightCard[]>([]);
  const [boxers, setBoxers] = useState<Boxer[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]); // Added missing sponsors state
  const [bettingConfig, setBettingConfig] = useState<BettingConfig>(DEFAULT_BETTING_CONFIG);
  const [rankingSettings, setRankingSettings] = useState<RankingSettings>(DEFAULT_RANKING_SETTINGS);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>(DEFAULT_PAYOUT_SETTINGS); // Added setPayoutSettings for consistency
  // --- END OF FIXED CODE ---
  
  const [editingCard, setEditingCard] = useState<FightCard>(defaultFightCard);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedBoxer, setSelectedBoxer] = useState<Boxer | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  const boxersList = boxers ?? [];
  const sponsorsList = sponsors ?? [];
  const fightCardsList = fightCards ?? [];
  const tournamentsList = tournaments ?? [];
  const betsList = bets ?? [];
  const bettingPoolsList = bettingPools ?? [];
  const currentCard = savedCard ?? defaultFightCard;
  const currentSettings = rankingSettings ?? DEFAULT_RANKING_SETTINGS;

  /* ---------- On mount: try to fetch latest from CosmosDB and merge into local state ---------- */
  useEffect(() => {
    // Initialize CosmosDB and fetch data once on mount
    initializeAndFetchData();
    // ensure existing behavior for saved card
    if (savedCard) setEditingCard(savedCard);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initializeAndFetchData() {
    try {
      // Initialize CosmosDB first
      await initializeCosmosDB();
      
      // Fetch boxers
      try {
        const boxersData = await cosmosDB.list<Boxer>('boxers');
        const validBoxers = boxersData
          .map(fromDbBoxer)
          .filter((boxer): boxer is NonNullable<typeof boxer> => boxer !== null);
        setBoxers(validBoxers);
      } catch (boxersError) {
        console.warn('CosmosDB boxers fetch error:', boxersError);
      }

      // Fetch sponsors
      try {
        const sponsorsData = await cosmosDB.list<Sponsor>('sponsors');
        setSponsors(sponsorsData);
      } catch (sponsorsError) {
        console.warn('CosmosDB sponsors fetch error:', sponsorsError);
      }

      // Fetch fight cards
      try {
        const fightCardsData = await cosmosDB.list<FightCard>('fights');
        setFightCards(fightCardsData);
        
        // Add sample upcoming fight cards if none exist (for testing countdown)
        if (fightCardsData.length === 0) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          
          const sampleFightCards: FightCard[] = [
            {
              id: 'sample-1',
              eventDate: tomorrow.toISOString().split('T')[0], // YYYY-MM-DD format
              location: 'Las Vegas, NV',
              mainEvent: {
                id: 'main-sample-1',
                fighter1: 'John "Thunder" Smith',
                fighter2: 'Mike "Lightning" Johnson',
                fighter1Rank: 1,
                fighter2Rank: 2,
                type: 'main',
                title: 'LSBA Championship Fight',
              },
              coMainEvent: {
                id: 'co-main-sample-1',
                fighter1: 'Carlos "El Toro" Rodriguez',
                fighter2: 'Danny "Iron Fist" Williams',
                fighter1Rank: 3,
                fighter2Rank: 4,
                type: 'co-main',
              },
              otherBouts: [],
              sponsors: 'LSBA Official',
              status: 'upcoming',
            },
            {
              id: 'sample-2',
              eventDate: nextWeek.toISOString().split('T')[0], // YYYY-MM-DD format
              location: 'New York, NY',
              mainEvent: {
                id: 'main-sample-2',
                fighter1: 'Alex "The Hammer" Brown',
                fighter2: 'Steve "Crusher" Davis',
                fighter1Rank: 5,
                fighter2Rank: 6,
                type: 'main',
                title: 'LSBA Contender Series',
              },
              otherBouts: [],
              sponsors: 'LSBA Official',
              status: 'upcoming',
            },
          ];
          
          setFightCards(sampleFightCards);
          console.log('Added sample fight cards for countdown testing:', sampleFightCards);
        }
      } catch (fightCardsError) {
        console.warn('CosmosDB fight_cards fetch error:', fightCardsError);
      }
    } catch (err) {
      console.error('initializeAndFetchData error', err);
      toast.error('Failed to fetch initial data from CosmosDB (check console)');
    }
  }

  /* ---------- Migrations from original app (kept intact) ---------- */
  useEffect(() => {
    if (sponsors && sponsors.length > 0) {
      const needsMigration = sponsors.some(
        sponsor => !sponsor.boxersSponsored || !sponsor.additionalContacts
      );
      
      if (needsMigration) {
        const migratedSponsors = sponsors.map(sponsor => ({
          ...sponsor,
          boxersSponsored: sponsor.boxersSponsored || [],
          additionalContacts: sponsor.additionalContacts || [],
        }));
        setSponsors(migratedSponsors);
      }
    }
  }, [sponsors, setSponsors]);

  useEffect(() => {
    if (boxers && boxers.length > 0) {
      const needsTimezoneMigration = boxers.some(boxer => !boxer.timezone);
      const needsLicenseMigration = boxers.some(boxer => 
        boxer.licenseStatus === undefined || 
        boxer.lastPaymentDate === undefined || 
        boxer.licenseFee === undefined
      );
      const needsNewFieldsMigration = boxers.some(boxer =>
        boxer.feePaid === undefined ||
        (boxer.licenseStatus === 'suspended' && !boxer.suspensionReason)
      );
      
      if (needsTimezoneMigration || needsLicenseMigration || needsNewFieldsMigration) {
        const migratedBoxers = boxers.map(boxer => ({
          ...boxer,
          timezone: boxer.timezone || 'NA',
          licenseStatus: boxer.licenseStatus || 'active',
          lastPaymentDate: boxer.lastPaymentDate || boxer.registeredDate || new Date().toISOString(),
          licenseFee: boxer.licenseFee || LICENSE_FEE,
          feePaid: boxer.feePaid !== undefined ? boxer.feePaid : true,
        }));
        setBoxers(migratedBoxers);
      }
    }
  }, [boxers, setBoxers]);

  /* ---------- Helper: sync a boxer to CosmosDB (upsert) ---------- */
  async function syncBoxerToDb(boxer: Boxer) {
    try {
      const payload = toDbBoxer({
        ...boxer,
        lastPaymentDate: typeof boxer.lastPaymentDate === 'string' ? boxer.lastPaymentDate : 
                        boxer.lastPaymentDate ? new Date(boxer.lastPaymentDate).toISOString() : boxer.lastPaymentDate,
      });
      
      // Try to update first, if not found then create
      const existingBoxer = await cosmosDB.read<Boxer>('boxers', boxer.id);
      if (existingBoxer) {
        const updated = await cosmosDB.update<Boxer>('boxers', boxer.id, payload);
        return fromDbBoxer(updated);
      } else {
        const created = await cosmosDB.create<Boxer>('boxers', payload);
        return fromDbBoxer(created);
      }
    } catch (err) {
      console.error('syncBoxerToDb error', err);
      return null;
    }
  }

  async function updateBoxerInDbPartial(id: string, partial: any) {
    try {
      const updated = await cosmosDB.update<Boxer>('boxers', id, partial);
      return fromDbBoxer(updated);
    } catch (err) {
      console.error('updateBoxerInDbPartial error', err);
      return null;
    }
  }

  /* ---------- Helper: sync sponsor to DB ---------- */
  async function syncSponsorToDb(sponsor: Sponsor) {
    try {
      // Try to update first, if not found then create
      const existingSponsor = await cosmosDB.read<Sponsor>('sponsors', sponsor.id);
      if (existingSponsor) {
        const updated = await cosmosDB.update<Sponsor>('sponsors', sponsor.id, sponsor);
        return updated;
      } else {
        const created = await cosmosDB.create<Sponsor>('sponsors', sponsor);
        return created;
      }
    } catch (err) {
      console.error('syncSponsorToDb error', err);
      return null;
    }
  }

  /* ---------- App handlers (kept original behaviour, plus DB writes) ---------- */

  const handleSave = () => {
    setSavedCard(editingCard);
    toast.success('Fight card saved successfully!');
  };

  // Register boxer locally and persist to CosmosDB
  const handleRegisterBoxer = async (boxer: Boxer) => {
    // keep local behaviour
    setBoxers((current) => [...(current || []), boxer]);
    
    if (boxer.sponsor) {
      setSponsors((current) => {
        const updated = [...(current || [])];
        const sponsorIndex = updated.findIndex(s => s.name.toLowerCase() === boxer.sponsor.toLowerCase());
        
        if (sponsorIndex !== -1) {
          const currentSponsored = updated[sponsorIndex].boxersSponsored || [];
          updated[sponsorIndex].boxersSponsored = [
            ...currentSponsored,
            boxer.id
          ];
        }
        
        return updated;
      });
    }

    // persist to CosmosDB (non-blocking, but errors logged)
    try {
      const returned = await syncBoxerToDb(boxer);
      if (!returned) {
        toast.error('Saved locally but failed to persist boxer to DB (check console)');
      } else {
        // ensure local KV matches DB normalized row (replace)
        setBoxers((current = []) => [...(current || []).filter(b => b.id !== returned.id), returned]);
        toast.success(`${boxer.firstName} saved to DB`);
      }
    } catch (err) {
      console.error('handleRegisterBoxer error', err);
      toast.error('Failed to persist boxer to DB (see console)');
    }
  };

  // Register sponsor locally and persist
  const handleRegisterSponsor = async (sponsor: Sponsor) => {
    setSponsors((current) => [...(current || []), sponsor]);

    try {
      const returned = await syncSponsorToDb(sponsor);
      if (!returned) {
        toast.error('Saved sponsor locally but failed to persist to DB (check console)');
      } else {
        setSponsors((current = []) => [...(current || []).filter(s => s.id !== returned.id), returned]);
        toast.success('Sponsor registered');
      }
    } catch (err) {
      console.error('register sponsor error', err);
      toast.error('Failed to persist sponsor');
    }
  };

  // Update boxer locally and persist (keeps original sponsor handling)
  const handleUpdateBoxer = async (updatedBoxer: Boxer) => {
    const oldBoxer = boxersList.find(b => b.id === updatedBoxer.id);
    
    setBoxers((current) =>
      (current || []).map((b) => (b.id === updatedBoxer.id ? updatedBoxer : b))
    );
    setSelectedBoxer(updatedBoxer);
    
    if (oldBoxer && oldBoxer.sponsor !== updatedBoxer.sponsor) {
      setSponsors((current) => {
        const updated = [...(current || [])];
        
        if (oldBoxer.sponsor) {
          const oldSponsorIndex = updated.findIndex(s => s.name.toLowerCase() === oldBoxer.sponsor.toLowerCase());
          if (oldSponsorIndex !== -1) {
            const currentSponsored = updated[oldSponsorIndex].boxersSponsored || [];
            updated[oldSponsorIndex].boxersSponsored = currentSponsored.filter(
              id => id !== updatedBoxer.id
            );
          }
        }
        
        if (updatedBoxer.sponsor) {
          const newSponsorIndex = updated.findIndex(s => s.name.toLowerCase() === updatedBoxer.sponsor.toLowerCase());
          if (newSponsorIndex !== -1) {
            const currentSponsored = updated[newSponsorIndex].boxersSponsored || [];
            if (!currentSponsored.includes(updatedBoxer.id)) {
              updated[newSponsorIndex].boxersSponsored = [
                ...currentSponsored,
                updatedBoxer.id
              ];
            }
          }
        }
        
        return updated;
      });
    }

    // Persist to CosmosDB (attempt upsert so new or existing record is saved)
    try {
      const returned = await syncBoxerToDb(updatedBoxer);
      if (returned) {
        setBoxers((current = []) => current.map(b => b.id === returned.id ? returned : b));
        toast.success('Boxer updated (persisted)');
      } else {
        toast.error('Boxer updated locally but failed to persist');
      }
    } catch (err) {
      console.error('handleUpdateBoxer sync error', err);
      toast.error('Failed to persist boxer update (see console)');
    }
  };

  // Delete boxer locally and attempt DB delete
  const handleDeleteBoxer = async (boxerId: string) => {
    const boxer = boxersList.find(b => b.id === boxerId);
    
    setBoxers((current) => (current || []).filter((b) => b.id !== boxerId));
    
    if (boxer?.sponsor) {
      setSponsors((current) => {
        const updated = [...(current || [])];
        const sponsorIndex = updated.findIndex(s => s.name.toLowerCase() === boxer.sponsor.toLowerCase());
        
        if (sponsorIndex !== -1) {
          const currentSponsored = updated[sponsorIndex].boxersSponsored || [];
          updated[sponsorIndex].boxersSponsored = currentSponsored.filter(
            id => id !== boxerId
          );
        }
        
        return updated;
      });
    }
    
    toast.success("Fighter profile deleted successfully");

    try {
      await cosmosDB.delete('boxers', boxerId);
      toast.success('Deleted from DB');
    } catch (err) {
      console.error('handleDeleteBoxer CosmosDB error', err);
      toast.error('Failed to delete boxer from DB (see console)');
    }
  };

  // Generate fight card (local logic kept), also persist fight card to DB
  const handleGenerateFightCard = async (fightCard: FightCard, boxerIds: string[]) => {
    setEditingCard(fightCard);
    setSavedCard(fightCard);
    
    setFightCards((current) => [...(current || []), fightCard]);
    
    const eventName = fightCard.mainEvent.title || `LSBA Event - ${fightCard.eventDate}`;
    const eventDate = fightCard.createdDate || new Date().toISOString();
    
    const matchedPairs: Array<[string, string]> = [];
    for (let i = 0; i < boxerIds.length; i += 2) {
      if (i + 1 < boxerIds.length) {
        matchedPairs.push([boxerIds[i], boxerIds[i + 1]]);
      }
    }
    
    setBoxers((current) => {
      const updated = [...(current || [])];
      matchedPairs.forEach(([fighterId1, fighterId2]) => {
        const boxer1Index = updated.findIndex(b => b.id === fighterId1);
        const boxer2Index = updated.findIndex(b => b.id === fighterId2);
        
        if (boxer1Index !== -1) {
          const opponent = updated[boxer2Index];
          updated[boxer1Index].fightHistory = [
            {
              id: `fight-${Date.now()}-${fighterId1}`,
              opponent: opponent ? `${opponent.firstName} ${opponent.lastName}` : 'TBD',
              date: eventDate,
              result: 'pending',
              eventName,
              fightCardId: fightCard.id,
            },
            ...updated[boxer1Index].fightHistory,
          ];
        }
        
        if (boxer2Index !== -1) {
          const opponent = updated[boxer1Index];
          updated[boxer2Index].fightHistory = [
            {
              id: `fight-${Date.now()}-${fighterId2}`,
              opponent: opponent ? `${opponent.firstName} ${opponent.lastName}` : 'TBD',
              date: eventDate,
              result: 'pending',
              eventName,
              fightCardId: fightCard.id,
            },
            ...updated[boxer2Index].fightHistory,
          ];
        }
      });
      return updated;
    });
    
    setActiveTab('upcoming-fights');
    toast.success('Fight card generated! View upcoming fights.');

    // Persist fight card to CosmosDB (best-effort)
    try {
      // Ensure fightCard has an ID
      if (!fightCard.id) {
        fightCard.id = crypto.randomUUID();
      }
      
      // Try to update first, if not found then create
      const existingCard = await cosmosDB.read<FightCard>('fights', fightCard.id);
      let persistedCard;
      if (existingCard) {
        persistedCard = await cosmosDB.update<FightCard>('fights', fightCard.id, fightCard);
      } else {
        persistedCard = await cosmosDB.create<FightCard>('fights', fightCard);
      }
      
      // replace local fightCards with DB version to keep consistent data
      setFightCards((current = []) => {
        if (!persistedCard) return current;
        return [persistedCard, ...current.filter(fc => fc.id !== persistedCard.id)];
      });
    } catch (err) {
      console.error('persist fight card error', err);
      toast.error('Fight card saved locally but failed to persist (see console)');
    }
  };

  // Declare results and update boxers locally and persist changed boxers
  const handleDeclareResults = async (updatedCard: FightCard, boxerUpdates: Map<string, Partial<Boxer>>) => {
    setFightCards((current) =>
      (current || []).map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );

    setBoxers((current) => {
      const updated = [...(current || [])];
      
      const allBouts = [
        updatedCard.mainEvent,
        ...(updatedCard.coMainEvent ? [updatedCard.coMainEvent] : []),
        ...updatedCard.otherBouts,
      ];

      allBouts.forEach((bout) => {
        if (bout.winner && bout.fighter1Id && bout.fighter2Id) {
          const winnerIndex = updated.findIndex((b) => 
            b.id === (bout.winner === 'fighter1' ? bout.fighter1Id : bout.fighter2Id)
          );
          const loserIndex = updated.findIndex((b) => 
            b.id === (bout.winner === 'fighter1' ? bout.fighter2Id : bout.fighter1Id)
          );

          if (winnerIndex !== -1 && loserIndex !== -1) {
            const winner = updated[winnerIndex];
            const loser = updated[loserIndex];
            const knockout = bout.knockout || false;

            const { winnerPoints, loserPoints } = calculatePointsForFight(
              winner,
              loser,
              knockout,
              updated,
              currentSettings
            );

            updated[winnerIndex].rankingPoints += winnerPoints;
            updated[loserIndex].rankingPoints = Math.max(0, updated[loserIndex].rankingPoints + loserPoints);

            updated[winnerIndex].fightHistory = updated[winnerIndex].fightHistory.map((fight) => {
              if (fight.fightCardId === updatedCard.id && fight.result === 'pending') {
                return {
                  ...fight,
                  result: knockout ? 'knockout' : 'win',
                  pointsChange: winnerPoints,
                };
              }
              return fight;
            });

            updated[loserIndex].fightHistory = updated[loserIndex].fightHistory.map((fight) => {
              if (fight.fightCardId === updatedCard.id && fight.result === 'pending') {
                return {
                  ...fight,
                  result: 'loss',
                  pointsChange: loserPoints,
                };
              }
              return fight;
            });
          }
        }
      });

      boxerUpdates.forEach((updates, boxerId) => {
        const index = updated.findIndex((b) => b.id === boxerId);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            wins: updates.wins ?? updated[index].wins,
            losses: updates.losses ?? updated[index].losses,
            knockouts: updates.knockouts ?? updated[index].knockouts,
          };
        }
      });

      return updated;
    });

    // Persist boxer updates to CosmosDB (in parallel)
    try {
      const promises: Promise<any>[] = [];
      boxerUpdates.forEach((updates, boxerId) => {
        promises.push(cosmosDB.update('boxers', boxerId, updates));
      });
      await Promise.all(promises);
    } catch (err) {
      console.error('Failed to persist boxer updates after declaring results', err);
    }

    // persist fight card changes
    try {
      if (updatedCard.id) {
        await cosmosDB.update('fights', updatedCard.id, updatedCard);
      }
    } catch (err) {
      console.error('persist updatedCard error', err);
    }

    toast.success('Fight results declared! Rankings updated. Bets remain pending for manual settlement.');
  };

  const handleResetSeason = () => {
    setBoxers((current) =>
      (current || []).map((boxer) => ({
        ...boxer,
        rankingPoints: 0,
        fightHistory: [],
      }))
    );
    toast.success('Season reset! All ranking points and fight history cleared.');
  };

  const handleClearAll = () => {
    setBoxers([]);
    setFightCards([]);
    setSavedCard(defaultFightCard);
    setEditingCard(defaultFightCard);
    toast.success('All data cleared. Starting fresh!');
  };

  const handleSaveSettings = (settings: RankingSettings) => {
    setRankingSettings(settings);
  };

  const handleUpdateSponsor = async (updatedSponsor: Sponsor) => {
    setSponsors((current) =>
      (current || []).map((s) => (s.id === updatedSponsor.id ? updatedSponsor : s))
    );
    setSelectedSponsor(updatedSponsor);
    toast.success('Sponsor updated successfully!');

    try {
      const returned = await syncSponsorToDb(updatedSponsor);
      if (!returned) {
        toast.error('Sponsor updated locally but failed to persist to DB (see console)');
      } else {
        setSponsors((current = []) => current.map(s => s.id === returned.id ? returned : s));
      }
    } catch (err) {
      console.error('update sponsor error', err);
      toast.error('Failed to persist sponsor (see console)');
    }
  };

  const handleCreateTournament = (tournament: Tournament) => {
    setTournaments((current) => [...(current || []), tournament]);
  };

  const handleUpdateTournament = (tournament: Tournament) => {
    setTournaments((current) =>
      (current || []).map((t) => (t.id === tournament.id ? tournament : t))
    );
  };

  const handlePlaceBet = (bet: Bet) => {
    setBets((current) => [...(current || []), bet]);
  };

  const handleUpdatePool = (pool: BettingPool) => {
    setBettingPools((current) => {
      const existing = (current || []).find(p => p.fightCardId === pool.fightCardId);
      if (existing) {
        return (current || []).map(p => p.fightCardId === pool.fightCardId ? pool : p);
      }
      return [...(current || []), pool];
    });
  };

  const handleSettleBets = (settledBets: Array<{ bet: Bet; winnerId: string; note: string }>) => {
    setBets((currentBets) => {
      const updatedBets = [...(currentBets || [])];
      
      settledBets.forEach(({ bet, winnerId, note }) => {
        const index = updatedBets.findIndex(b => b.id === bet.id);
        if (index !== -1) {
          updatedBets[index] = settleBet(bet, winnerId, note, payoutSettings || DEFAULT_PAYOUT_SETTINGS);
        }
      });
      
      return updatedBets;
    });
  };

  const hasChanges = JSON.stringify(currentCard) !== JSON.stringify(editingCard);

  /* ---------- Render logic (kept exactly as original) ---------- */

  if (selectedSponsor) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <SponsorProfile
                sponsor={selectedSponsor}
                boxers={boxersList}
                onBack={() => setSelectedSponsor(null)}
                onUpdateSponsor={handleUpdateSponsor}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (selectedBoxer) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-6">
              <BoxerProfile
                boxer={selectedBoxer}
                allBoxers={boxersList}
                onBack={() => setSelectedBoxer(null)}
                onUpdateBoxer={handleUpdateBoxer}
              />
              <FighterOddsDisplay
                boxer={selectedBoxer}
                bettingPools={bettingPoolsList}
                fightCards={fightCardsList}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      
      <div className="min-h-screen bg-background">
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
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2">
                <TabsList className="flex-1 bg-transparent h-auto">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-accent">
                    <SquaresFour className="w-4 h-4" />
                    <span className="hidden md:inline">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="upcoming-fights" className="flex items-center gap-2 data-[state=active]:bg-accent">
                    <Calendar className="w-4 h-4" />
                    <span className="hidden md:inline">Upcoming</span>
                  </TabsTrigger>
                  <TabsTrigger value="licenses" className="flex items-center gap-2 data-[state=active]:bg-accent">
                    <IdentificationCard className="w-4 h-4" />
                    <span className="hidden md:inline">Licenses</span>
                  </TabsTrigger>
                  <TabsTrigger value="betting" className="flex items-center gap-2 data-[state=active]:bg-accent">
                    <CurrencyDollar className="w-4 h-4" />
                    <span className="hidden md:inline">Betting</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <AddressBook className="w-4 h-4" />
                        <span className="hidden sm:inline">Fighters</span>
                        <CaretDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setActiveTab('directory')}>
                        <AddressBook className="w-4 h-4 mr-2" />
                        Directory
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('register')}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Register Fighter
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setActiveTab('sponsors')}>
                        <Briefcase className="w-4 h-4 mr-2" />
                        Sponsors
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Sparkle className="w-4 h-4" />
                        <span className="hidden sm:inline">Events</span>
                        <CaretDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setActiveTab('generator')}>
                        <Sparkle className="w-4 h-4 mr-2" />
                        Card Generator
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('fight-card')}>
                        <PencilSimple className="w-4 h-4 mr-2" />
                        Fight Card Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('tournament')}>
                        <Trophy className="w-4 h-4 mr-2" />
                        Tournament
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Sliders className="w-4 h-4" />
                        <span className="hidden sm:inline">Admin</span>
                        <CaretDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setActiveTab('help')}>
                        <Book className="w-4 h-4 mr-2" />
                        Help Guide
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                        <Sliders className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('faq')}>
                        <Info className="w-4 h-4 mr-2" />
                        FAQ
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setActiveTab('season')}>
                        <ArrowsClockwise className="w-4 h-4 mr-2" />
                        Season Reset
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <TabsContent value="dashboard" className="mt-6">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <ChartLine className="w-8 h-8 text-primary" weight="bold" />
                        <div className="text-4xl font-display font-bold text-primary">
                          {getSortedBoxers(boxersList).length}
                        </div>
                      </div>
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Ranked Fighters
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-8 h-8 text-secondary" weight="bold" />
                        <div className="text-4xl font-display font-bold text-secondary">
                          {fightCardsList.filter(card => card.status === 'upcoming').length}
                        </div>
                      </div>
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Upcoming Events
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkle className="w-8 h-8 text-accent" weight="fill" />
                        <div className="text-4xl font-display font-bold text-accent">
                          {boxersList.length}
                        </div>
                      </div>
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Total Registered
                      </div>
                    </div>
                  </div>

                  <UpcomingFights fightCards={fightCardsList} boxers={boxersList} />

                  <BoxerLeaderboard boxers={boxersList} onSelectBoxer={setSelectedBoxer} />
                </div>
              </TabsContent>

              <TabsContent value="licenses" className="mt-6">
                <LicenseManager
                  boxers={boxersList}
                  onUpdateBoxer={handleUpdateBoxer}
                />
              </TabsContent>

              <TabsContent value="betting" className="mt-6">
                <BettingManager
                  fightCards={fightCardsList}
                  boxers={boxersList}
                  bets={betsList}
                  bettingPools={bettingPoolsList}
                  onPlaceBet={handlePlaceBet}
                  onUpdatePool={handleUpdatePool}
                  onSettleBets={handleSettleBets}
                  payoutSettings={payoutSettings}
                  setPayoutSettings={setPayoutSettings}
                  bettingConfig={bettingConfig}
                  setBettingConfig={setBettingConfig}
                />
              </TabsContent>

              <TabsContent value="upcoming-fights" className="mt-6">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
                        Upcoming Fights
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Scheduled bouts awaiting results
                      </p>
                    </div>
                  </div>

                  <UpcomingFights fightCards={fightCardsList} boxers={boxersList} />

                  {fightCardsList.filter(card => card.status === 'upcoming').length > 0 && (
                    <>
                      <div className="mt-8">
                        <h3 className="font-display text-2xl uppercase text-secondary tracking-wide mb-4">
                          Declare Results
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Select a fight card below to declare winners and update fighter records
                        </p>
                      </div>
                      {fightCardsList.filter(card => card.status === 'upcoming').map((card) => (
                        <FightResultsManager
                          key={card.id}
                          fightCard={card}
                          boxers={boxersList}
                          onDeclareResults={handleDeclareResults}
                        />
                      ))}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tournament" className="mt-6">
                <TournamentBracket
                  boxers={boxersList}
                  tournaments={tournamentsList}
                  onCreateTournament={handleCreateTournament}
                  onUpdateTournament={handleUpdateTournament}
                />
              </TabsContent>

              <TabsContent value="directory" className="mt-6">
                <BoxerDirectory 
                  boxers={boxersList} 
                  sponsors={sponsorsList}
                  onUpdateBoxer={handleUpdateBoxer}
                  onDeleteBoxer={handleDeleteBoxer}
                  onViewProfile={setSelectedBoxer}
                  onViewSponsorProfile={setSelectedSponsor}
                />
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <BoxerRegistration 
                  onRegister={handleRegisterBoxer} 
                  existingBoxers={boxersList}
                  existingSponsors={sponsorsList}
                />
              </TabsContent>

              <TabsContent value="generator" className="mt-6">
                <FightCardGenerator boxers={boxersList} allBoxers={boxersList} onGenerate={handleGenerateFightCard} />
              </TabsContent>

              <TabsContent value="sponsors" className="mt-6">
                <div className="flex flex-col gap-6">
                  <SponsorRegistration 
                    onRegister={handleRegisterSponsor} 
                    existingSponsors={sponsorsList}
                  />
                  <SponsorList 
                    sponsors={sponsorsList} 
                    onViewProfile={setSelectedSponsor}
                  />
                </div>
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

              <TabsContent value="help" className="mt-6">
                <HelpGuide />
              </TabsContent>

              <TabsContent value="faq" className="mt-6">
                <RankingFAQ settings={currentSettings} />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Settings />
              </TabsContent>

              <TabsContent value="season" className="mt-6">
                <SeasonReset 
                  boxers={boxersList} 
                  onResetSeason={handleResetSeason}
                  onClearAll={handleClearAll}
                />
              </TabsContent>
            </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;