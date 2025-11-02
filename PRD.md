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
- Functionality: Professional poster-style display showing the complete fight card with visual hierarchy, optional background images, and fighter photos
- Purpose: Creates shareable, screenshot-ready promotional material for Discord, forums, in-game with customizable visuals
- Trigger: User saves fight card data or toggles to preview mode
- Progression: Save data → Render poster → Adjust if needed → Screenshot/share
- Success criteria: Card displays clearly with proper typography, fighter names prominent, all info legible; background images blend well with text; fighter photos display properly without breaking layout

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

**Background Image Customization**
- Functionality: Add custom background image URL (Imgur, Discord CDN, etc.) to personalize fight card poster
- Purpose: Allow organizers to brand events with venue photos, logos, or thematic imagery
- Trigger: User enters image URL in background image field
- Progression: Paste URL → Image loads as background → Adjusts opacity for text readability
- Success criteria: Background displays without breaking layout; text remains legible with automatic overlay; handles broken image URLs gracefully

**Fighter Photos**
- Functionality: Add individual fighter photos via image URLs for main event and co-main event fighters
- Purpose: Increase visual appeal and professionalism by showcasing fighter faces/poses
- Trigger: User enters image URLs for fighter 1 and/or fighter 2 in bout fields
- Progression: Enter URL → Photo displays beside fighter name → Scales appropriately → Falls back gracefully if image fails
- Success criteria: Photos display in consistent sizes; handle both portrait and landscape images; don't break layout if one fighter has photo and other doesn't

## Edge Case Handling

- **Empty fields** - Display placeholder text or hide sections when optional fields are empty
- **Long names** - Automatically scale font size or wrap text for exceptionally long fighter/location names
- **No bouts added** - Show helpful prompt to add at least a main event
- **Data persistence failure** - Gracefully handle with toast notification and retry mechanism
- **Many sponsors** - Wrap or truncate sponsor list if it exceeds available space
- **Invalid image URLs** - Hide broken images gracefully with error handling; show fighter names without disruption
- **Large background images** - Apply opacity overlay to ensure text readability regardless of image brightness
- **Mixed image availability** - Handle cases where only one fighter has a photo while the other doesn't; maintain layout symmetry

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
