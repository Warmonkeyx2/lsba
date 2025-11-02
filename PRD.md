# Planning Guide

A dynamic fight card management system for GTA FiveM Boxing Association organizers to create, edit, and display professional boxing event posters with real-time updates.

**Experience Qualities**:
1. **Professional** - The interface should feel like a legitimate sports promotion tool with polished, broadcast-quality fight card displays
2. **Efficient** - Quick editing and instant preview allows organizers to make last-minute changes without technical friction
3. **Empowering** - Non-technical users can produce visually stunning fight cards that match the prestige of their in-game events

**Complexity Level**: Light Application (multiple features with basic state)
This is a focused tool with clear edit/preview modes, persistent data storage, and straightforward CRUD operations for fight card management.

## Essential Features

**Fight Card Editor**
- Functionality: Form-based interface to input all fight card details (date, location, fighters, titles, sponsors)
- Purpose: Enables quick creation and modification of event information without design skills
- Trigger: User opens the app or clicks "Edit Card" button
- Progression: Open form → Fill/update fields → Save → View generated card
- Success criteria: All fields save correctly and persist between sessions; validation prevents empty critical fields

**Fight Card Display**
- Functionality: Professional poster-style display showing the complete fight card with visual hierarchy
- Purpose: Creates shareable, screenshot-ready promotional material for Discord, forums, in-game
- Trigger: User saves fight card data or toggles to preview mode
- Progression: Save data → Render poster → Adjust if needed → Screenshot/share
- Success criteria: Card displays clearly with proper typography, fighter names prominent, all info legible

**Multiple Bouts Support**
- Functionality: Add/remove multiple fights beyond main/co-main events
- Purpose: Showcase full fight cards with undercard and preliminary bouts
- Trigger: User clicks "Add Bout" or delete button on existing bout
- Progression: Click add → Enter fighter names and bout type → Save → Appears on card
- Success criteria: Dynamically adds/removes bouts; maintains visual hierarchy (main event most prominent)

**Sponsor Management**
- Functionality: Add sponsor names/text that appear on the fight card
- Purpose: Acknowledge in-game businesses and partners supporting the event
- Trigger: User enters sponsor names in dedicated field
- Progression: Type sponsor names → Position on card → Display on poster
- Success criteria: Sponsors appear in designated area without cluttering main content

## Edge Case Handling

- **Empty fields** - Display placeholder text or hide sections when optional fields are empty
- **Long names** - Automatically scale font size or wrap text for exceptionally long fighter/location names
- **No bouts added** - Show helpful prompt to add at least a main event
- **Data persistence failure** - Gracefully handle with toast notification and retry mechanism
- **Many sponsors** - Wrap or truncate sponsor list if it exceeds available space

## Design Direction

The design should evoke the high-energy, bold aesthetic of professional boxing promotions—think UFC/boxing PPV posters with dramatic typography, strong contrast, and unmistakable visual hierarchy. A rich interface serves the core purpose better than minimal, as this is about creating excitement and prestige for in-game events.

## Color Selection

Triadic color scheme (red, gold, black) creating a championship, premium boxing aesthetic that signals importance and excitement.

- **Primary Color**: Deep Crimson Red (oklch(0.45 0.21 25)) - Represents the intensity and drama of boxing, used for main event emphasis and action elements
- **Secondary Colors**: Championship Gold (oklch(0.80 0.15 85)) for titles and highlights; Pure Black (oklch(0.15 0 0)) for backgrounds and grounding elements
- **Accent Color**: Electric Gold (oklch(0.85 0.18 90)) - High-impact highlight for championship belts, CTAs, and main fighter names
- **Foreground/Background Pairings**:
  - Background (Black oklch(0.15 0 0)): White text (oklch(0.98 0 0)) - Ratio 15.2:1 ✓
  - Card (Dark Charcoal oklch(0.20 0 0)): White text (oklch(0.98 0 0)) - Ratio 13.8:1 ✓
  - Primary (Crimson oklch(0.45 0.21 25)): White text (oklch(0.98 0 0)) - Ratio 5.8:1 ✓
  - Secondary (Gold oklch(0.80 0.15 85)): Black text (oklch(0.15 0 0)) - Ratio 9.2:1 ✓
  - Accent (Electric Gold oklch(0.85 0.18 90)): Black text (oklch(0.15 0 0)) - Ratio 10.8:1 ✓
  - Muted (oklch(0.35 0 0)): Light Gray text (oklch(0.85 0 0)) - Ratio 6.1:1 ✓

## Font Selection

Typography should convey power, prestige, and athletic authority—combining bold condensed display fonts for fighter names with clean sans-serifs for supporting information.

- **Typographic Hierarchy**:
  - H1 (Main Event Fighters): Bebas Neue Bold / 48px / Tight letter spacing / Uppercase
  - H2 (Event Title/Championship): Bebas Neue Regular / 32px / Normal spacing / Uppercase
  - H3 (Co-Main/Other Bouts): Bebas Neue Regular / 28px / Tight spacing
  - Body (Date/Location): Inter Medium / 16px / Normal spacing
  - Small (Sponsors): Inter Regular / 14px / Relaxed spacing

## Animations

Animations should be minimal and functional—subtle transitions between edit/preview modes and smooth form interactions that maintain focus on content creation over flashy effects.

- **Purposeful Meaning**: Quick fade transitions communicate mode switching; form field highlights guide input focus
- **Hierarchy of Movement**: Save button gets satisfying scale feedback; bout additions slide in smoothly; no distracting motion on the poster display itself

## Component Selection

- **Components**: 
  - Card (main fight card display with dramatic styling)
  - Input (all text fields with boxing-themed styling)
  - Button (primary for save, secondary for add bout, destructive for delete)
  - Separator (dividing bouts and sections)
  - Badge (for bout types: "Main Event", "Co-Main Event", "Undercard")
  - ScrollArea (for managing many bouts in editor)
  - Tabs (switching between Edit and Preview modes)
  - Label (form field labels)
  - Textarea (multi-line fields for sponsors or notes)

- **Customizations**: 
  - Custom fight card poster component with dramatic gradient backgrounds
  - Fighter name display with VS separator graphic
  - Championship belt icon/graphic for title fights
  - Sponsor footer section with subtle styling

- **States**: 
  - Buttons: Bold hover states with scale transforms; disabled state for save when no changes
  - Inputs: Strong focus rings in accent color; error states for validation
  - Bouts: Hover state shows edit controls; selected state for active editing

- **Icon Selection**: 
  - Plus (add bout)
  - Trash (remove bout) 
  - FloppyDisk (save)
  - Eye (preview mode)
  - PencilSimple (edit mode)
  - Trophy (championship indicator)

- **Spacing**: Generous padding on card (p-8), consistent gaps between form fields (gap-4), tight spacing for fighter names to create drama (gap-2)

- **Mobile**: 
  - Stack form fields vertically
  - Reduce fight card poster font sizes proportionally
  - Make tabs full-width
  - Collapse sponsor section to single column
  - Maintain readability of fighter names as top priority
