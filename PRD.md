# Planning Guide

A comprehensive boxing association management system for LSBA (Los Santos Boxing Association) that handles boxer registration, leaderboard rankings, fighter profiles, stat tracking, and automated fight card generation—all integrated into one cohesive application.

**Experience Qualities**:
1. **Professional** - The interface should feel like a legitimate sports organization management platform with polished displays and data-driven insights
2. **Comprehensive** - All aspects of boxing management in one place: from registering new fighters to generating event posters
3. **Dynamic** - Auto-calculated rankings, real-time stat updates, and intelligent fight card generation that responds to the current roster

**Complexity Level**: Complex Application (advanced functionality, integrated modules)
This is a full-featured management system with multiple interconnected modules: boxer registry, profile management, leaderboard calculations, fight history tracking, and automated fight card creation with persistent state across all features.

## Essential Features

**Boxer Registration Module**
- Functionality: Form-based interface to register new boxers with State ID, name, phone, sponsor, and optional profile photo
- Purpose: Onboard new fighters into the LSBA system with all required licensing information
- Trigger: User navigates to Register tab and fills out registration form
- Progression: Enter boxer details → Submit form → Boxer added to system → Appears on leaderboard → Profile created
- Success criteria: All required fields validated; unique ID generated; boxer immediately appears in leaderboard; confirmation toast shown

**Dynamic Leaderboard**
- Functionality: Auto-sorted list of all registered boxers ranked by win rate and total wins, displaying W-L-K records and stats
- Purpose: Provide competitive rankings that motivate fighters and showcase top performers
- Trigger: User opens Dashboard tab or when boxer stats are updated
- Progression: Load boxers → Calculate win rates → Sort by performance → Display ranked list → Click boxer for profile
- Success criteria: Rankings update automatically when stats change; top 3 get special visual treatment; win rate and record display accurately

**Boxer Profile & Stats Management**
- Functionality: Detailed profile page for each boxer with editable W/L/K stats, fight history, and visual stat tracking
- Purpose: Manage individual fighter records and maintain comprehensive fight histories
- Trigger: User clicks on a boxer from leaderboard
- Progression: Select boxer → View profile → Adjust stats with +/- buttons → Add fight results → Stats update → Rank recalculates
- Success criteria: Stats persist correctly; rank updates reflect new stats; fight history logs all results; quick add buttons for Win/Loss/KO work correctly

**Fight History Tracking**
- Functionality: Chronological log of all fights for each boxer with results, dates, and opponent names
- Purpose: Maintain complete fight records for transparency and historical reference
- Trigger: User adds fight result through quick buttons or manual stat adjustment
- Progression: Add result → Opponent auto-set to TBD → Entry appears in history → Can be edited later
- Success criteria: All fights logged with timestamps; results categorized properly; history displays in reverse chronological order

**Auto-Generate Fight Card**
- Functionality: Select multiple boxers from roster and automatically generate fight card with matchups
- Purpose: Streamline event creation by intelligently pairing fighters based on selection order
- Trigger: User navigates to Generator tab, selects boxers, enters event details, clicks generate
- Progression: Select boxers → Set date/location → Preview matchups → Generate → Fight card created with all boxer data → Navigates to editor
- Success criteria: Pairs fighters sequentially; first pair becomes main event; includes fighter photos and records automatically; preview shows bout structure

**Integrated Fight Card Editor**
- Functionality: Full fight card editing system (existing feature) now integrated with boxer database
- Purpose: Manual creation and editing of fight cards with option to pull from registered boxers or enter custom fighters
- Trigger: User navigates to Fight Card tab or generates card from Generator
- Progression: Edit card fields → Save → Preview → Share
- Success criteria: Works seamlessly with auto-generated cards; can override or manually create cards; all existing editor features remain functional

**Dashboard Overview**
- Functionality: At-a-glance statistics showing total registered boxers, active fight cards, and possible match combinations
- Purpose: Provide quick system status and encourage engagement with different modules
- Trigger: User opens application (default view)
- Progression: Load data → Display stats → Show leaderboard → Navigate to desired module
- Success criteria: Stats update in real-time; leaderboard immediately visible; quick navigation to all modules

**Boxer Directory & Search**
- Functionality: Searchable phonebook-style directory with real-time filtering, full profile editing, and deletion with confirmation
- Purpose: Provide quick access to all registered fighters with powerful search and management capabilities
- Trigger: User navigates to Directory tab
- Progression: View all boxers → Type search query → Results filter instantly → Select edit or delete → Make changes → Confirm action
- Success criteria: Search updates on every keystroke; filters by name, ID, phone, sponsor; edit dialog validates sponsor against registered list; deletion requires confirmation; all changes persist correctly

## Edge Case Handling

- **No boxers registered** - Show empty state with prompt to register first boxer
- **Odd number selected in generator** - Handle gracefully by leaving last boxer unmatched with notification
- **Boxer with no fights** - Display 0-0-0 record and 0% win rate; show empty fight history message
- **Duplicate State IDs** - Accept duplicates (boxers can have same ID in different jurisdictions)
- **Very long names** - Truncate with ellipsis in leaderboard; full display in profiles
- **Missing profile images** - Show initials in avatar fallback with consistent styling
- **Zero total fights** - Handle win rate calculation (0/0) as 0% without errors
- **Deleting boxer stats** - Can reduce to 0 but not negative values
- **Many registered boxers** - Leaderboard scrolls; maintain performance with 100+ boxers
- **Broken image URLs** - Fallback to initials in fight card generator and profiles
- **Empty search query** - Display all boxers in directory
- **No search results** - Show helpful empty state with suggestion to adjust search
- **Sponsor selection in edit** - Only allow registered sponsors from dropdown; prevent manual text entry
- **Knockouts exceeding wins** - Validate that KO count cannot exceed total wins
- **Profile deletion confirmation** - Require explicit "Are you sure?" dialog before permanent deletion

## Design Direction

The design should evoke the professional, data-driven aesthetic of modern sports management platforms (think ESPN stats pages, UFC rankings) while maintaining the bold, high-energy boxing promotion feel. A rich interface with clear information hierarchy serves the core purpose of managing a complete boxing organization.

## Color Selection

Triadic color scheme (red, gold, black) creating a championship, premium boxing aesthetic that signals importance and excitement while maintaining data readability.

- **Primary Color**: Deep Crimson Red (oklch(0.45 0.21 25)) - Represents the intensity and drama of boxing, used for main actions and key stats
- **Secondary Colors**: Championship Gold (oklch(0.80 0.15 85)) for achievements, rankings, and highlights; Pure Black (oklch(0.15 0 0)) for backgrounds
- **Accent Color**: Electric Gold (oklch(0.85 0.18 90)) - High-impact highlight for top rankings, CTAs, and special indicators
- **Foreground/Background Pairings**:
  - Background (Black oklch(0.15 0 0)): White text (oklch(0.98 0 0)) - Ratio 15.2:1 ✓
  - Card (Dark Charcoal oklch(0.20 0 0)): White text (oklch(0.98 0 0)) - Ratio 13.8:1 ✓
  - Primary (Crimson oklch(0.45 0.21 25)): White text (oklch(0.98 0 0)) - Ratio 5.8:1 ✓
  - Secondary (Gold oklch(0.80 0.15 85)): Black text (oklch(0.15 0 0)) - Ratio 9.2:1 ✓
  - Accent (Electric Gold oklch(0.85 0.18 90)): Black text (oklch(0.15 0 0)) - Ratio 10.8:1 ✓
  - Muted (oklch(0.35 0 0)): Light Gray text (oklch(0.85 0 0)) - Ratio 6.1:1 ✓

## Font Selection

Typography should convey power, prestige, and athletic authority while maintaining excellent readability for data-heavy displays combining bold condensed display fonts with clean sans-serifs.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Bebas Neue Bold / 56px / Wide letter spacing / Uppercase
  - H2 (Section Headers): Bebas Neue Regular / 32px / Normal spacing / Uppercase
  - Fighter Names (Display): Teko Bold / 32px / Tight spacing / Uppercase
  - Body (Data/Forms): Inter Medium / 16px / Normal spacing
  - Small (Labels/Meta): Inter Regular / 14px / Relaxed spacing
  - Stats (Numbers): Bebas Neue / 36px / Tight spacing

## Animations

Animations should be purposeful and enhance data comprehension—smooth transitions between modules, satisfying feedback on stat updates, and subtle hover states that guide interaction.

- **Purposeful Meaning**: Tab transitions fade content; stat increments scale briefly; rank changes highlight temporarily; form submissions show success state
- **Hierarchy of Movement**: Critical actions (register boxer, save card) get prominent feedback; stat adjustments feel responsive; leaderboard updates smoothly

## Component Selection

- **Components**: 
  - Card (profiles, registration forms, leaderboard containers)
  - Input (all form fields with consistent styling)
  - Button (primary actions, stat adjustments, navigation)
  - Tabs (main navigation between modules)
  - Avatar (boxer profile images with fallback)
  - Badge (bout types, rankings, status indicators)
  - Checkbox (multi-select in fight card generator)
  - Separator (section dividers)
  - ScrollArea (leaderboard, fight history)
  - Label (form labels throughout)

- **Customizations**: 
  - Custom leaderboard card with rank indicators and trophy icons for top 3
  - Stat adjustment interface with +/- buttons
  - Fight card generator with selection preview
  - Profile page with comprehensive stat display
  - Dashboard stat cards with gradient backgrounds

- **States**: 
  - Buttons: Bold hover with scale; disabled for invalid actions; loading for submissions
  - List items: Hover shows interactivity; selected state for fight card generator
  - Inputs: Strong focus rings; validation feedback; success confirmation
  - Stats: Brief highlight animation when updated

- **Icon Selection**: 
  - UserPlus (register)
  - ChartLine (leaderboard/stats)
  - Sparkle (auto-generate)
  - Trophy (rankings)
  - Plus/Minus (stat adjustments)
  - Target (stat management)
  - SquaresFour (dashboard)
  - ArrowLeft (back navigation)
  - AddressBook (directory)
  - MagnifyingGlass (search)
  - PencilSimple (edit)
  - Trash (delete)
  - Phone (contact info)
  - IdentificationCard (State ID)
  - Briefcase (sponsor)

- **Spacing**: 
  - Consistent gap-4 between form elements
  - gap-6 between major sections
  - p-6 for card padding
  - Generous spacing in stat displays for readability

- **Mobile**: 
  - Stack all form fields vertically
  - Collapse leaderboard to single column
  - Tab labels hide text on smallest screens, show icons only
  - Profile stats grid adjusts to 2 columns
  - Stat adjustment buttons remain touch-friendly (44px minimum)
