import { useState } from "react";
import {
  SquaresFour,
  Calendar,
  IdentificationCard,
  CurrencyDollar,
  AddressBook,
  CaretDown,
  Sparkle,
  PencilSimple,
  Trophy,
  UserCircleGear,
  Sliders,
  Info,
  ArrowsClockwise,
  Briefcase,
  UserPlus,
  ChartLine,
  Eye,
} from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Role } from "@/types/permissions";

interface RolePreviewAppProps {
  role: Role;
}

export function RolePreviewApp({ role }: RolePreviewAppProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const permissions = new Set(role.permissions);

  const hasPermission = (permission: string) => permissions.has(permission as any);

  const canViewDashboard = hasPermission("view_dashboard");
  const canViewUpcoming = hasPermission("view_fight_cards");
  const canViewLicenses = hasPermission("view_licenses");
  const canViewBetting = hasPermission("view_betting");
  const canViewFighters = hasPermission("view_fighters");
  const canRegisterFighters = hasPermission("register_fighters");
  const canViewSponsors = hasPermission("view_sponsors");
  const canCreateFightCards = hasPermission("create_fight_cards");
  const canEditFightCards = hasPermission("edit_fight_cards");
  const canManageTournaments = hasPermission("manage_tournaments");
  const canManageRoles = hasPermission("manage_roles");
  const canManageSettings = hasPermission("manage_app_settings");
  const canSeasonReset = hasPermission("season_reset");

  const showFightersMenu = canViewFighters || canRegisterFighters || canViewSponsors;
  const showEventsMenu = canCreateFightCards || canEditFightCards || canManageTournaments;
  const showAdminMenu = canManageRoles || canManageSettings || canSeasonReset;

  const DisabledWrapper = ({ children, reason }: { children: React.ReactNode; reason: string }) => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="opacity-40 cursor-not-allowed">{children}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs">
            <span className="font-semibold">Permission Required:</span> {reason}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
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
                  {canViewDashboard ? (
                    <TabsTrigger
                      value="dashboard"
                      className="flex items-center gap-2 data-[state=active]:bg-accent"
                    >
                      <SquaresFour className="w-4 h-4" />
                      <span className="hidden md:inline">Dashboard</span>
                    </TabsTrigger>
                  ) : (
                    <DisabledWrapper reason="View Dashboard">
                      <div className="flex items-center gap-2 px-3 py-1.5 text-sm">
                        <SquaresFour className="w-4 h-4" />
                        <span className="hidden md:inline">Dashboard</span>
                      </div>
                    </DisabledWrapper>
                  )}

                  {canViewUpcoming ? (
                    <TabsTrigger
                      value="upcoming-fights"
                      className="flex items-center gap-2 data-[state=active]:bg-accent"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="hidden md:inline">Upcoming</span>
                    </TabsTrigger>
                  ) : (
                    <DisabledWrapper reason="View Fight Cards">
                      <div className="flex items-center gap-2 px-3 py-1.5 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span className="hidden md:inline">Upcoming</span>
                      </div>
                    </DisabledWrapper>
                  )}

                  {canViewLicenses ? (
                    <TabsTrigger
                      value="licenses"
                      className="flex items-center gap-2 data-[state=active]:bg-accent"
                    >
                      <IdentificationCard className="w-4 h-4" />
                      <span className="hidden md:inline">Licenses</span>
                    </TabsTrigger>
                  ) : (
                    <DisabledWrapper reason="View Licenses">
                      <div className="flex items-center gap-2 px-3 py-1.5 text-sm">
                        <IdentificationCard className="w-4 h-4" />
                        <span className="hidden md:inline">Licenses</span>
                      </div>
                    </DisabledWrapper>
                  )}

                  {canViewBetting ? (
                    <TabsTrigger
                      value="betting"
                      className="flex items-center gap-2 data-[state=active]:bg-accent"
                    >
                      <CurrencyDollar className="w-4 h-4" />
                      <span className="hidden md:inline">Betting</span>
                    </TabsTrigger>
                  ) : (
                    <DisabledWrapper reason="View Betting">
                      <div className="flex items-center gap-2 px-3 py-1.5 text-sm">
                        <CurrencyDollar className="w-4 h-4" />
                        <span className="hidden md:inline">Betting</span>
                      </div>
                    </DisabledWrapper>
                  )}
                </TabsList>

                <div className="flex items-center gap-2">
                  {showFightersMenu ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <AddressBook className="w-4 h-4" />
                          <span className="hidden sm:inline">Fighters</span>
                          <CaretDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {canViewFighters ? (
                          <DropdownMenuItem>
                            <AddressBook className="w-4 h-4 mr-2" />
                            Directory
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <AddressBook className="w-4 h-4 mr-2 opacity-40" />
                            <span className="opacity-40">Directory</span>
                          </DropdownMenuItem>
                        )}
                        {canRegisterFighters ? (
                          <DropdownMenuItem>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Register Fighter
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <UserPlus className="w-4 h-4 mr-2 opacity-40" />
                            <span className="opacity-40">Register Fighter</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {canViewSponsors ? (
                          <DropdownMenuItem>
                            <Briefcase className="w-4 h-4 mr-2" />
                            Sponsors
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <Briefcase className="w-4 h-4 mr-2 opacity-40" />
                            <span className="opacity-40">Sponsors</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <DisabledWrapper reason="View Fighters, Register Fighters, or View Sponsors">
                      <Button variant="outline" size="sm" className="gap-2">
                        <AddressBook className="w-4 h-4" />
                        <span className="hidden sm:inline">Fighters</span>
                        <CaretDown className="w-3 h-3" />
                      </Button>
                    </DisabledWrapper>
                  )}

                  {showEventsMenu ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Sparkle className="w-4 h-4" />
                          <span className="hidden sm:inline">Events</span>
                          <CaretDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {canCreateFightCards ? (
                          <DropdownMenuItem>
                            <Sparkle className="w-4 h-4 mr-2" />
                            Card Generator
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <Sparkle className="w-4 h-4 mr-2 opacity-40" />
                            <span className="opacity-40">Card Generator</span>
                          </DropdownMenuItem>
                        )}
                        {canEditFightCards ? (
                          <DropdownMenuItem>
                            <PencilSimple className="w-4 h-4 mr-2" />
                            Fight Card Editor
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <PencilSimple className="w-4 h-4 mr-2 opacity-40" />
                            <span className="opacity-40">Fight Card Editor</span>
                          </DropdownMenuItem>
                        )}
                        {canManageTournaments ? (
                          <DropdownMenuItem>
                            <Trophy className="w-4 h-4 mr-2" />
                            Tournament
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <Trophy className="w-4 h-4 mr-2 opacity-40" />
                            <span className="opacity-40">Tournament</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <DisabledWrapper reason="Create Fight Cards, Edit Fight Cards, or Manage Tournaments">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Sparkle className="w-4 h-4" />
                        <span className="hidden sm:inline">Events</span>
                        <CaretDown className="w-3 h-3" />
                      </Button>
                    </DisabledWrapper>
                  )}

                  {showAdminMenu ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Sliders className="w-4 h-4" />
                          <span className="hidden sm:inline">Admin</span>
                          <CaretDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {canManageRoles ? (
                          <DropdownMenuItem>
                            <UserCircleGear className="w-4 h-4 mr-2" />
                            Roles & Permissions
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <UserCircleGear className="w-4 h-4 mr-2 opacity-40" />
                            <span className="opacity-40">Roles & Permissions</span>
                          </DropdownMenuItem>
                        )}
                        {canManageSettings ? (
                          <DropdownMenuItem>
                            <Sliders className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <Sliders className="w-4 h-4 mr-2 opacity-40" />
                            <span className="opacity-40">Settings</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Info className="w-4 h-4 mr-2" />
                          FAQ
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {canSeasonReset ? (
                          <DropdownMenuItem>
                            <ArrowsClockwise className="w-4 h-4 mr-2" />
                            Season Reset
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <ArrowsClockwise className="w-4 h-4 mr-2 opacity-40" />
                            <span className="opacity-40">Season Reset</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <DisabledWrapper reason="Manage Roles, Manage Settings, or Season Reset">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Sliders className="w-4 h-4" />
                        <span className="hidden sm:inline">Admin</span>
                        <CaretDown className="w-3 h-3" />
                      </Button>
                    </DisabledWrapper>
                  )}
                </div>
              </div>

              <TabsContent value="dashboard" className="mt-6">
                {canViewDashboard ? (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <ChartLine className="w-8 h-8 text-primary" weight="bold" />
                          <div className="text-4xl font-display font-bold text-primary">24</div>
                        </div>
                        <div className="text-sm uppercase tracking-wide text-muted-foreground">
                          Ranked Fighters
                        </div>
                      </Card>

                      <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-8 h-8 text-secondary" weight="bold" />
                          <div className="text-4xl font-display font-bold text-secondary">3</div>
                        </div>
                        <div className="text-sm uppercase tracking-wide text-muted-foreground">
                          Upcoming Events
                        </div>
                      </Card>

                      <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Sparkle className="w-8 h-8 text-accent" weight="fill" />
                          <div className="text-4xl font-display font-bold text-accent">32</div>
                        </div>
                        <div className="text-sm uppercase tracking-wide text-muted-foreground">
                          Total Registered
                        </div>
                      </Card>
                    </div>

                    <Card className="bg-card border border-border p-8 text-center">
                      <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Dashboard content would display here based on permissions
                      </p>
                    </Card>
                  </div>
                ) : (
                  <PermissionDeniedCard permission="View Dashboard" />
                )}
              </TabsContent>

              <TabsContent value="upcoming-fights" className="mt-6">
                {canViewUpcoming ? (
                  <Card className="bg-card border border-border p-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Upcoming fights content would display here
                    </p>
                  </Card>
                ) : (
                  <PermissionDeniedCard permission="View Fight Cards" />
                )}
              </TabsContent>

              <TabsContent value="licenses" className="mt-6">
                {canViewLicenses ? (
                  <Card className="bg-card border border-border p-8 text-center">
                    <IdentificationCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      License management content would display here
                    </p>
                  </Card>
                ) : (
                  <PermissionDeniedCard permission="View Licenses" />
                )}
              </TabsContent>

              <TabsContent value="betting" className="mt-6">
                {canViewBetting ? (
                  <Card className="bg-card border border-border p-8 text-center">
                    <CurrencyDollar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Betting system content would display here
                    </p>
                  </Card>
                ) : (
                  <PermissionDeniedCard permission="View Betting" />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function PermissionDeniedCard({ permission }: { permission: string }) {
  return (
    <Card className="bg-destructive/5 border border-destructive/30 p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Eye className="w-8 h-8 text-destructive" weight="duotone" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1 text-destructive">Access Denied</h3>
          <p className="text-sm text-muted-foreground">
            This role does not have the "{permission}" permission
          </p>
        </div>
      </div>
    </Card>
  );
}
