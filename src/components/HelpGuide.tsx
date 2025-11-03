import { useState } from "react";
import { 
  Book, 
  MagnifyingGlass,
  Users,
  Calendar,
  Trophy,
  CurrencyDollar,
  IdentificationCard,
  Sparkle,
  ChartLine,
  UserCircleGear,
  Sliders,
  CaretRight,
  ListBullets,
  CheckCircle
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: string;
  content: {
    overview: string;
    steps?: string[];
    tips?: string[];
    relatedSections?: string[];
  };
}

const helpSections: HelpSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Book className="w-5 h-5" />,
    category: "basics",
    content: {
      overview: "Welcome to LSBA Manager! This comprehensive management system helps you organize boxing events, manage fighters, track rankings, and handle betting operations for the Los Santos Boxing Association.",
      steps: [
        "Start by registering fighters in the 'Register Fighter' section",
        "Optionally register sponsors to support your fighters",
        "Use the Fight Card Generator to automatically create balanced matchups",
        "Review upcoming fights and declare results after events",
        "Monitor the leaderboard to track fighter rankings"
      ],
      tips: [
        "Register multiple fighters before generating your first fight card",
        "Keep fighter licenses up to date to ensure they can compete",
        "Use the Dashboard for a quick overview of your organization"
      ],
      relatedSections: ["fighters", "fight-cards", "dashboard"]
    }
  },
  {
    id: "dashboard",
    title: "Dashboard Overview",
    icon: <ListBullets className="w-5 h-5" />,
    category: "basics",
    content: {
      overview: "The Dashboard provides a high-level view of your LSBA organization with key metrics and quick access to important information.",
      steps: [
        "View total number of ranked fighters",
        "See upcoming events count",
        "Check total registered fighters",
        "Review upcoming fights schedule",
        "Monitor current leaderboard standings"
      ],
      tips: [
        "Check the dashboard daily to stay updated on organization status",
        "Use the stats cards to quickly assess organizational health"
      ],
      relatedSections: ["fighters", "upcoming-fights", "leaderboard"]
    }
  },
  {
    id: "fighters",
    title: "Fighter Management",
    icon: <Users className="w-5 h-5" />,
    category: "fighters",
    content: {
      overview: "Register and manage your fighters. Track their profiles, fight history, rankings, and personal information including contact details and timezones.",
      steps: [
        "Navigate to Fighters → Register Fighter",
        "Fill in fighter details: name, alias, weight class, age, timezone",
        "Add contact information (Discord ID, phone number)",
        "Optionally assign a sponsor",
        "Submit to create the fighter profile",
        "View all fighters in the Directory",
        "Click on any fighter to view their detailed profile"
      ],
      tips: [
        "Fighter aliases are displayed prominently on fight cards",
        "Timezone information helps coordinate international fighters",
        "Accurate weight classes ensure fair matchmaking",
        "Discord IDs enable quick communication with fighters"
      ],
      relatedSections: ["sponsors", "weight-classes", "fight-cards"]
    }
  },
  {
    id: "sponsors",
    title: "Sponsor Management",
    icon: <Sparkle className="w-5 h-5" />,
    category: "fighters",
    content: {
      overview: "Register companies and individuals who sponsor fighters. Track sponsor relationships and their sponsored fighters.",
      steps: [
        "Go to Fighters → Sponsors",
        "Click 'Register New Sponsor'",
        "Enter sponsor name and contact information",
        "Add primary contact and additional contacts if needed",
        "Submit to create the sponsor profile",
        "Assign sponsors to fighters during registration or editing"
      ],
      tips: [
        "Sponsors can support multiple fighters",
        "Sponsor information appears on fighter profiles",
        "Keep contact information updated for communication"
      ],
      relatedSections: ["fighters", "fight-cards"]
    }
  },
  {
    id: "weight-classes",
    title: "Weight Classes",
    icon: <ChartLine className="w-5 h-5" />,
    category: "fighters",
    content: {
      overview: "LSBA uses standard boxing weight classes to ensure fair competition. Fighters compete against others in their weight division.",
      steps: [
        "Flyweight: Up to 112 lbs",
        "Bantamweight: 112-118 lbs",
        "Featherweight: 118-126 lbs",
        "Lightweight: 126-135 lbs",
        "Welterweight: 135-147 lbs",
        "Middleweight: 147-160 lbs",
        "Light Heavyweight: 160-175 lbs",
        "Cruiserweight: 175-200 lbs",
        "Heavyweight: 200+ lbs"
      ],
      tips: [
        "The Fight Card Generator respects weight classes when creating matchups",
        "Cross-weight class fights can be manually created in the Fight Card Editor",
        "Rankings are tracked across all weight classes combined"
      ],
      relatedSections: ["fighters", "fight-cards", "rankings"]
    }
  },
  {
    id: "fight-cards",
    title: "Fight Card Generation",
    icon: <Sparkle className="w-5 h-5" />,
    category: "events",
    content: {
      overview: "Automatically generate balanced fight cards using the AI-powered generator, or manually create custom cards with the Fight Card Editor.",
      steps: [
        "Navigate to Events → Card Generator",
        "Enter event details (name, date, location)",
        "Specify number of fights desired",
        "Choose matchmaking strategy: balanced, title eliminator, or random",
        "Select fighters to include (or use all available)",
        "Click Generate to create the card",
        "Review generated matchups",
        "Card is automatically saved to Upcoming Fights"
      ],
      tips: [
        "Balanced strategy creates competitive matchups based on rankings",
        "Title eliminator mode matches top-ranked fighters",
        "Generated cards respect weight classes for fairness",
        "You can manually edit any generated card using the Fight Card Editor"
      ],
      relatedSections: ["upcoming-fights", "fight-results", "fighters"]
    }
  },
  {
    id: "fight-card-editor",
    title: "Fight Card Editor",
    icon: <Sparkle className="w-5 h-5" />,
    category: "events",
    content: {
      overview: "Manually create or edit fight cards with full control over matchups, bout types, and event details.",
      steps: [
        "Go to Events → Fight Card Editor",
        "Set event date and location",
        "Create Main Event bout",
        "Optionally add Co-Main Event",
        "Add additional bouts as needed",
        "Select fighters for each bout",
        "Choose bout types (title, championship, etc.)",
        "Add sponsor information",
        "Save the card"
      ],
      tips: [
        "Preview your card before saving",
        "Main Event should feature your top fighters",
        "Use the Preview tab to see how the card will look"
      ],
      relatedSections: ["fight-cards", "upcoming-fights"]
    }
  },
  {
    id: "upcoming-fights",
    title: "Upcoming Fights",
    icon: <Calendar className="w-5 h-5" />,
    category: "events",
    content: {
      overview: "View all scheduled fights that haven't been completed yet. This section displays fight cards awaiting results.",
      steps: [
        "Click 'Upcoming' in the main navigation",
        "View all scheduled fight cards",
        "See fighters matched in each bout",
        "Check event dates and locations",
        "Scroll down to declare results when fights complete"
      ],
      tips: [
        "Fight cards remain here until results are declared",
        "Use this to track your event schedule",
        "Betting pools are linked to upcoming fights"
      ],
      relatedSections: ["fight-results", "fight-cards", "betting"]
    }
  },
  {
    id: "fight-results",
    title: "Declaring Fight Results",
    icon: <CheckCircle className="w-5 h-5" />,
    category: "events",
    content: {
      overview: "After fights conclude, declare winners to update fighter records and rankings. This is crucial for maintaining accurate statistics.",
      steps: [
        "Navigate to Upcoming Fights",
        "Find the completed fight card",
        "Click 'Declare Results' on the card",
        "For each bout, select the winner",
        "Choose if it was a knockout",
        "Click 'Save Results'",
        "Fighter records and rankings update automatically"
      ],
      tips: [
        "Knockout victories award bonus ranking points",
        "Results immediately update the leaderboard",
        "Fight history is added to both fighters' profiles",
        "Betting pools must be settled separately after declaring results"
      ],
      relatedSections: ["rankings", "fighters", "betting"]
    }
  },
  {
    id: "rankings",
    title: "Ranking System",
    icon: <Trophy className="w-5 h-5" />,
    category: "rankings",
    content: {
      overview: "LSBA uses a point-based ranking system that rewards wins and high-profile victories while managing losses fairly.",
      steps: [
        "New fighters start with 0 ranking points",
        "Win against lower-ranked opponent: +50 points",
        "Win against higher-ranked opponent: +75 points",
        "Knockout victory: Additional +25 bonus points",
        "Loss: -25 points (cannot go below 0)",
        "Rankings update immediately after fight results"
      ],
      tips: [
        "Strategic matchmaking helps fighters climb rankings",
        "Upset victories (lower rank beats higher) award more points",
        "Knockouts are rewarded to encourage exciting fights",
        "View detailed ranking calculations in Admin → FAQ"
      ],
      relatedSections: ["fight-results", "leaderboard", "settings"]
    }
  },
  {
    id: "leaderboard",
    title: "Fighter Leaderboard",
    icon: <ChartLine className="w-5 h-5" />,
    category: "rankings",
    content: {
      overview: "The leaderboard displays all fighters ranked by their total ranking points. It updates in real-time after fight results are declared.",
      steps: [
        "View leaderboard on Dashboard",
        "Fighters sorted by ranking points (highest to lowest)",
        "See rank number, name, record, and points",
        "Click any fighter to view their full profile",
        "Monitor changes after each event"
      ],
      tips: [
        "Top fighters are prime candidates for title fights",
        "Use rankings to create competitive matchups",
        "Inactive fighters maintain their ranking until they fight again"
      ],
      relatedSections: ["rankings", "fighters", "fight-results"]
    }
  },
  {
    id: "licenses",
    title: "License Management",
    icon: <IdentificationCard className="w-5 h-5" />,
    category: "licensing",
    content: {
      overview: "All fighters must maintain an active LSBA license to compete. Manage license statuses, payments, and suspensions.",
      steps: [
        "Click 'Licenses' in main navigation",
        "View all fighters with their license status",
        "See payment dates and fee amounts",
        "Mark fees as paid/unpaid",
        "Suspend or reinstate fighter licenses",
        "Add notes for suspended licenses"
      ],
      tips: [
        "Default license fee is $50 (configurable in settings)",
        "Suspended fighters should not be included in fight cards",
        "Track payment dates to identify overdue licenses",
        "License status shown with color-coded badges"
      ],
      relatedSections: ["fighters", "settings"]
    }
  },
  {
    id: "betting",
    title: "Betting System",
    icon: <CurrencyDollar className="w-5 h-5" />,
    category: "betting",
    content: {
      overview: "Manage betting pools for fights. Track bets placed on fighters, calculate odds, and settle payouts after results are declared.",
      steps: [
        "Navigate to Betting section",
        "Select a fight card to enable betting",
        "System creates betting pool for each bout",
        "Users place bets on fighters (tracked separately)",
        "View odds calculated from bet distribution",
        "After fight results declared, settle bets manually",
        "Payouts calculated based on configured percentages"
      ],
      tips: [
        "Odds update dynamically as bets are placed",
        "Betting pool must be created before accepting bets",
        "Settlement is separate from declaring fight results",
        "Default house take is 10% (configurable)",
        "Check payout settings in Admin → Settings"
      ],
      relatedSections: ["upcoming-fights", "fight-results", "settings"]
    }
  },
  {
    id: "tournaments",
    title: "Tournament Brackets",
    icon: <Trophy className="w-5 h-5" />,
    category: "events",
    content: {
      overview: "Create single-elimination tournament brackets with automatic advancement and winner tracking.",
      steps: [
        "Go to Events → Tournament",
        "Click 'Create New Tournament'",
        "Enter tournament name and description",
        "Select participating fighters",
        "Choose bracket size (4, 8, or 16 fighters)",
        "System generates seeded bracket",
        "Advance winners after each round",
        "Track tournament progress"
      ],
      tips: [
        "Fighters are seeded by ranking points",
        "Bracket sizes must be power of 2 (4, 8, 16)",
        "Byes are given to top seeds if not enough fighters",
        "Tournament results don't affect regular rankings"
      ],
      relatedSections: ["fighters", "rankings"]
    }
  },
  {
    id: "roles",
    title: "Roles & Permissions",
    icon: <UserCircleGear className="w-5 h-5" />,
    category: "admin",
    content: {
      overview: "Define custom roles with specific permissions to control what different users can access and modify in the application.",
      steps: [
        "Navigate to Admin → Roles & Permissions",
        "View existing roles (Commissioner, Manager, Viewer)",
        "Click 'Create New Role' to add custom role",
        "Set role name, color, and description",
        "Toggle permissions for each feature area",
        "Preview application with role permissions",
        "Save role for assignment to users"
      ],
      tips: [
        "Commissioner role has all permissions by default",
        "Viewer role is read-only with no edit capabilities",
        "Create specialized roles for specific tasks (e.g., 'Event Coordinator')",
        "Use role preview to verify permissions before assigning",
        "Color-code roles for quick visual identification"
      ],
      relatedSections: ["settings"]
    }
  },
  {
    id: "settings",
    title: "Ranking & System Settings",
    icon: <Sliders className="w-5 h-5" />,
    category: "admin",
    content: {
      overview: "Customize ranking point values, licensing fees, and other system-wide settings to match your organization's needs.",
      steps: [
        "Go to Admin → Settings",
        "Adjust ranking points for different scenarios",
        "Modify knockout bonus points",
        "Set license fee amounts",
        "Configure betting payout percentages",
        "Update house take percentage",
        "Save changes to apply across system"
      ],
      tips: [
        "Higher point differentials create more competitive pressure",
        "Knockout bonuses encourage exciting finishes",
        "Review FAQ section to understand point calculations",
        "Changes affect future fights only, not historical data"
      ],
      relatedSections: ["rankings", "licenses", "betting"]
    }
  },
  {
    id: "season-reset",
    title: "Season Reset",
    icon: <ChartLine className="w-5 h-5" />,
    category: "admin",
    content: {
      overview: "Start a new season by resetting ranking points and fight history, or completely clear all data to start fresh.",
      steps: [
        "Navigate to Admin → Season Reset",
        "Choose 'Reset Season' to clear rankings only",
        "Or choose 'Clear All Data' for complete wipe",
        "Confirm action (cannot be undone)",
        "Season reset clears points and history but keeps fighters",
        "Clear all removes fighters, sponsors, fights, and bets"
      ],
      tips: [
        "Use season reset at the end of a competition period",
        "Consider exporting data before major resets",
        "Clear all is useful for testing or complete restarts",
        "Fighters keep their registration info after season reset"
      ],
      relatedSections: ["rankings", "fighters"]
    }
  }
];

const categories = [
  { id: "all", name: "All Topics", icon: <Book className="w-4 h-4" /> },
  { id: "basics", name: "Getting Started", icon: <Book className="w-4 h-4" /> },
  { id: "fighters", name: "Fighters & Sponsors", icon: <Users className="w-4 h-4" /> },
  { id: "events", name: "Events & Fight Cards", icon: <Calendar className="w-4 h-4" /> },
  { id: "rankings", name: "Rankings & Leaderboard", icon: <Trophy className="w-4 h-4" /> },
  { id: "licensing", name: "License Management", icon: <IdentificationCard className="w-4 h-4" /> },
  { id: "betting", name: "Betting System", icon: <CurrencyDollar className="w-4 h-4" /> },
  { id: "admin", name: "Administration", icon: <UserCircleGear className="w-4 h-4" /> },
];

export function HelpGuide() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSection, setSelectedSection] = useState<string | null>("getting-started");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = helpSections.filter((section) => {
    const matchesCategory = selectedCategory === "all" || section.category === selectedCategory;
    const matchesSearch = 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.overview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentSection = helpSections.find((s) => s.id === selectedSection);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
          Help & Documentation
        </h2>
        <p className="text-muted-foreground">
          Learn how to use LSBA Manager effectively
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Topics</CardTitle>
              <div className="relative mt-2">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="flex flex-col gap-1 px-4 pb-4">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "secondary" : "ghost"}
                      className="justify-start gap-2 h-9"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSearchQuery("");
                      }}
                    >
                      {category.icon}
                      <span className="text-sm">{category.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {category.id === "all" 
                          ? helpSections.length 
                          : helpSections.filter(s => s.category === category.id).length}
                      </Badge>
                    </Button>
                  ))}
                  
                  <Separator className="my-2" />
                  
                  {filteredSections.map((section) => (
                    <Button
                      key={section.id}
                      variant={selectedSection === section.id ? "secondary" : "ghost"}
                      className="justify-start gap-2 h-9 text-left"
                      onClick={() => setSelectedSection(section.id)}
                    >
                      {section.icon}
                      <span className="text-sm truncate">{section.title}</span>
                    </Button>
                  ))}
                  
                  {filteredSections.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No topics found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          <Card className="border-border">
            <CardContent className="p-6">
              <ScrollArea className="h-[600px] pr-4">
                {currentSection ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        {currentSection.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-2xl uppercase text-foreground tracking-wide mb-2">
                          {currentSection.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {categories.find(c => c.id === currentSection.category)?.name}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-foreground">Overview</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {currentSection.content.overview}
                      </p>
                    </div>

                    {currentSection.content.steps && currentSection.content.steps.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
                          <ListBullets className="w-5 h-5" />
                          How It Works
                        </h4>
                        <div className="flex flex-col gap-3">
                          {currentSection.content.steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <p className="text-muted-foreground leading-relaxed flex-1">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentSection.content.tips && currentSection.content.tips.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Sparkle className="w-5 h-5" />
                          Tips & Best Practices
                        </h4>
                        <div className="flex flex-col gap-2">
                          {currentSection.content.tips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <CaretRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <p className="text-muted-foreground leading-relaxed flex-1">
                                {tip}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentSection.content.relatedSections && currentSection.content.relatedSections.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-3 text-foreground">Related Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentSection.content.relatedSections.map((relatedId) => {
                            const related = helpSections.find(s => s.id === relatedId);
                            if (!related) return null;
                            return (
                              <Button
                                key={relatedId}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => setSelectedSection(relatedId)}
                              >
                                {related.icon}
                                {related.title}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Book className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a Topic</h3>
                    <p className="text-muted-foreground">
                      Choose a topic from the sidebar to view detailed documentation
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
