# Planning Guide

A comprehensive boxing association management system for LSBA (Los Santos Boxing Association) that handles boxer registration, leaderboard rankings, fighter profiles, stat tracking, and automated fight card generation—presented as a desktop application with native window controls and full-screen application experience.

**Experience Qualities**:
1. **Professional** - The interface should feel like a legitimate desktop sports management application with native window chrome, polished displays and data-driven insights
2. **Comprehensive** - All aspects of boxing management in one place: from registering new fighters to generating event posters
3. **Dynamic** - Auto-calculated rankings, real-time stat updates, and intelligent fight card generation that responds to the current roster

**Complexity Level**: Complex Application (advanced functionality, integrated modules)
This is a full-featured management system with multiple interconnected modules: boxer registry, profile management, leaderboard calculations, fight history tracking, and automated fight card creation with persistent state across all features.

## Essential Features

**Desktop Application Frame**
- Functionality: Native-style window frame with titlebar, app icon, window controls (minimize, maximize, close)
- Purpose: Provide authentic desktop application experience with familiar window management
- Trigger: Application loads with desktop chrome immediately visible
- Progression: Launch app → Desktop frame renders → Window controls functional → Content scrollable within frame
- Success criteria: Titlebar displays app name and icon; minimize/maximize/close buttons work; fullscreen toggle functional; frame persists across all views

**Boxer Registration Module**
- Functionality: Form-based interface to register new boxers with State ID, name, phone, sponsor, and optional profile photo; automatic $10,000 monthly license fee assignment
- Purpose: Onboard new fighters into the LSBA system with all required licensing information and payment tracking
- Trigger: User navigates to Register tab and fills out registration form
- Progression: Enter boxer details → Submit form → $10,000 license fee assigned → Boxer added to system → Appears on leaderboard → Profile created
- Success criteria: All required fields validated; unique ID generated; boxer immediately appears in leaderboard; confirmation toast shown; license status set to active with current date as first payment date

**Dynamic Leaderboard**
- Functionality: Auto-sorted list of all registered boxers ranked by win rate and total wins, displaying W-L-K records and stats
- Purpose: Provide competitive rankings that motivate fighters and showcase top performers
- Trigger: User opens Dashboard tab or when boxer stats are updated
- Progression: Load boxers → Calculate win rates → Sort by performance → Display ranked list → Click boxer for profile
- Success criteria: Rankings update automatically when stats change; top 3 get special visual treatment; win rate and record display accurately

**Boxer Profile & Stats Management**
- Functionality: Detailed profile page for each boxer with editable W/L/K stats, fight history, license status with payment tracking, and visual stat tracking
- Purpose: Manage individual fighter records, maintain comprehensive fight histories, and track license payments
- Trigger: User clicks on a boxer from leaderboard
- Progression: Select boxer → View profile with license status → Adjust stats with +/- buttons → Process license payment if needed → Add fight results → Stats update → Rank recalculates
- Success criteria: Stats persist correctly; rank updates reflect new stats; fight history logs all results; quick add buttons for Win/Loss/KO work correctly; license status displays with days until due; payment processing updates license validity

**Fight History Tracking**
- Functionality: Chronological log of all fights for each boxer with results, dates, and opponent names
- Purpose: Maintain complete fight records for transparency and historical reference
- Trigger: User adds fight result through quick buttons or manual stat adjustment
- Progression: Add result → Opponent auto-set to TBD → Entry appears in history → Can be edited later
- Success criteria: All fights logged with timestamps; results categorized properly; history displays in reverse chronological order

**Auto-Generate Fight Card**
- Functionality: Select multiple boxers from roster and automatically generate fight card with matchups; only fighters with valid licenses (paid within last 30 days) can be selected
- Purpose: Streamline event creation by intelligently pairing fighters based on selection order while enforcing license requirements
- Trigger: User navigates to Generator tab, selects boxers with valid licenses, enters event details, clicks generate
- Progression: Select boxers → System validates licenses → Set date/location → Preview matchups → Generate → Fight card created with all boxer data → Navigates to editor
- Success criteria: Pairs fighters sequentially; first pair becomes main event; includes fighter photos and records automatically; preview shows bout structure; expired license boxers are visually disabled and cannot be selected; toast notification explains why boxer cannot be added

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

**Comprehensive Betting System**
- Functionality: Full sports betting platform with dynamic odds calculation based on fighter records, rankings, and betting pool activity; fair and legal payout structure
- Purpose: Enable wagering on fights with real-time odds that adjust based on fighter statistics and betting activity; LSBA receives 10% fee on all bets, booker (1068 Casino) profits from remaining amount
- Trigger: User navigates to Betting tab and selects fight card and specific bout
- Progression: Select event type (regular/special/tournament) → Choose odds format (American/Decimal/Fractional) → Select fight → View live odds for both fighters → Enter bettor's State ID and name → Place bet → Track active bets → View betting history with payouts
- Success criteria: Odds calculate accurately using fighter strength algorithm (30% rank, 25% win rate, 20% ranking points, 10% KO rate, 10% experience, 5% recent form); minimum bet enforcement ($2k regular, $5k special, $5k tournament); pool adjusts odds dynamically; bets auto-settle when results declared; LSBA always receives 10% of original bet regardless of outcome; winning bettor receives total winnings minus LSBA fee; booker profits from bet amount minus payouts and LSBA fee; no sponsor or fighter cuts from betting revenue

**Fighter Odds Display**
- Functionality: Shows current betting odds for each fighter on their profile page with auto-updates when odds change
- Purpose: Provide transparency on betting markets and fighter value perception
- Trigger: View any fighter profile with upcoming fights
- Progression: Open profile → Odds card displays if fighter has upcoming bouts → Shows event, opponent, current odds, win probability, favorite/underdog status
- Success criteria: Odds update automatically when betting pool changes; displays for all upcoming fights; shows probability percentages; indicates favorite vs underdog; updates immediately after new bets placed

**Dynamic Odds Calculation**
- Functionality: Sophisticated algorithm combining fighter statistics, rankings, head-to-head factors, and betting pool activity
- Purpose: Create fair, accurate odds that reflect true fight probabilities while incorporating betting market forces
- Trigger: When fight card betting pool is created or new bet is placed
- Progression: Calculate base fighter strength → Determine implied probability → Adjust for betting pool activity → Apply 5% vig → Display in selected format
- Success criteria: Favorites show negative American odds or odds below 2.0 decimal; underdogs show positive odds; probabilities sum to ~105% (with vig); odds shift toward heavily bet fighter; maintains mathematical accuracy

**Boxer Directory & Search**
- Functionality: Searchable phonebook-style directory with real-time filtering, full profile editing, and deletion with confirmation
- Purpose: Provide quick access to all registered fighters with powerful search and management capabilities
- Trigger: User navigates to Directory tab
- Progression: View all boxers → Type search query → Results filter instantly → Select edit or delete → Make changes → Confirm action
- Success criteria: Search updates on every keystroke; filters by name, ID, phone, sponsor; edit dialog validates sponsor against registered list; deletion requires confirmation; all changes persist correctly

**License Management System**
- Functionality: Comprehensive license tracking dashboard showing all fighters' payment status with filters for active, due soon (7 days), and expired licenses; one-click payment processing
- Purpose: Ensure all fighters maintain valid licenses to compete; track monthly $10,000 fees; prevent expired fighters from being added to fight cards
- Trigger: User navigates to Licenses tab or needs to process monthly payments
- Progression: View dashboard with status stats → Filter by license status → Select fighter → Process payment → License renewed for 30 days → Fighter becomes eligible for fight cards
- Success criteria: Dashboard displays accurate counts of active/due/expired licenses; filters work correctly; payment processing updates last payment date and extends validity by 30 days; expired fighters cannot be selected in fight card generator; visual indicators (badges, colors) clearly show license status throughout app

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
- **No upcoming fights for betting** - Show empty state in betting tab with prompt to generate fight cards
- **Bet below minimum** - Validate and display error with specific minimum for event type
- **Equal fighter strength** - Handle edge case where both fighters have identical stats (50/50 odds)
- **Zero betting pool** - Display base odds calculated from fighter statistics only
- **Heavy one-sided betting** - Allow odds to shift but cap maximum adjustment to prevent unrealistic lines
- **Fighter with no ranking** - Use default strength score based on record and experience only
- **Bet settlement with cancelled fight** - Provide mechanism to refund bets for cancelled bouts
- **Multiple active bets on same fight** - Track and display all bets separately with individual potential payouts
- **Negative booker profit** - When total payouts exceed bet amounts, booker takes loss while LSBA still receives fixed 10% fee
- **Expired fighter license** - Fighters with licenses past 30 days cannot be added to fight cards; visual warning shows in generator and profiles
- **License payment on exact 30-day boundary** - Payment extends for full 30 days from payment date, not from expiry
- **Multiple payments in same month** - System allows but only extends from latest payment date
- **License status during active fight** - Fighter can complete scheduled fight even if license expires between scheduling and fight date (grace period)

## Design Direction

The design should evoke the professional, data-driven aesthetic of modern desktop sports management applications (think ESPN stats pages, UFC rankings software) while maintaining the bold, high-energy boxing promotion feel. A rich desktop interface with native window chrome and clear information hierarchy serves the core purpose of managing a complete boxing organization.

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
  - Custom DesktopFrame (window titlebar with controls)
  - Card (profiles, registration forms, leaderboard containers)
  - Input (all form fields with consistent styling)
  - Button (primary actions, stat adjustments, navigation, window controls)
  - Tabs (main navigation between modules)
  - Avatar (boxer profile images with fallback)
  - Badge (bout types, rankings, status indicators)
  - Checkbox (multi-select in fight card generator)
  - Separator (section dividers)
  - ScrollArea (leaderboard, fight history)
  - Label (form labels throughout)

- **Customizations**: 
  - Desktop window frame with native-style titlebar and controls
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
  - X/Minus/Square (window controls)
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
  - IdentificationCard (State ID, license management)
  - Briefcase (sponsor)
  - CurrencyDollar (betting, payments)
  - TrendUp/TrendDown (odds movement, favorites/underdogs)
  - Lock/LockOpen (betting pool status)
  - Lightning (ranking points, bet bonuses)
  - CheckCircle (active license)
  - WarningCircle (license due soon)
  - XCircle (expired license)
  - Warning (general warnings)

- **Spacing**: 
  - Consistent gap-4 between form elements
  - gap-6 between major sections
  - p-6 for card padding
  - Generous spacing in stat displays for readability

- **Mobile**: 
  - Desktop application is designed for larger screens (minimum 1024px recommended)
  - Window frame remains fixed at top
  - Tab labels hide text on smallest screens, show icons only
  - Content area scrolls independently within desktop frame
  - All interactive elements maintain touch-friendly sizes for touchscreen displays
