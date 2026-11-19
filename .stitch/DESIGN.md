# Design System: Perfume Shop — Refined Dark Luxury

**Project ID:** 2470844449027809469

## 1. Visual Theme & Atmosphere

A **nocturnal fragrance house**: quiet, confident, and editorial. The interface behaves like a printed lookbook after dark — deep warm-black paper, ivory type, and a single restrained champagne accent. Nothing glows, nothing shouts; luxury is communicated through **space, proportion, and restraint**.

The mood is **intimate and tactile**, closer to a private atelier than a department store. Photography leads, typography supports, and every rule is hairline-thin. Motion is slow and minimal, reserved for revealing content rather than decorating it.

**Key Characteristics:**
- Warm near-black canvas rather than pure black, so surfaces feel like fabric, not screens
- One accent only — muted champagne — used sparingly for action and emphasis
- Serif display type paired with a neutral sans for a fashion-editorial voice
- Hairline borders instead of heavy shadows; depth comes from tone shifts
- Generous, asymmetric spacing with a strong left-aligned reading rhythm
- Small, tailored corner radii — refined, never playful

## 2. Color Palette & Roles

### Foundation
- **Obsidian Noir (#0B0A08)** — Primary page canvas. A warm, almost-black brown-black that reads as expensive and softens the contrast against ivory text.
- **Charcoal Velvet (#14120F)** — Elevated surfaces: cards, panels, dropdowns, the navigation bar. Distinguishes layers through tone, not shadow.
- **Smoke Graphite (#1E1B17)** — Hairline borders, dividers, and input strokes. Visible only on close inspection.

### Accent & Interactive
- **Champagne Gold (#C6A664)** — The single brand accent. Primary calls to action, active navigation state, price emphasis, focus rings, and small editorial markers. Muted and metallic, never yellow.
- **Antique Brass (#8A7340)** — Hover and pressed states for champagne elements. Deepens rather than brightens on interaction.
- **Rose Clay (#B98A7A)** — Tertiary accent reserved for feminine collections, "new" markers, and warm secondary highlights. Used at most once per view.

### Typography & Text
- **Ivory Silk (#F5F0E6)** — Primary text: headlines, product names, body copy. Warm white that avoids clinical contrast.
- **Warm Ash (#A79E8F)** — Secondary text: descriptions, metadata, captions, inactive navigation.
- **Muted Taupe (#6F675B)** — Disabled text, placeholders, and the quietest labels.

### Functional States (used sparingly)
- **Verdant Sage (#6E8B6A)** — In stock, order confirmed, success feedback.
- **Burnt Sienna (#B4634F)** — Errors, out of stock, destructive actions.

## 3. Typography Rules

**Display Font Family:** Newsreader — an editorial serif with high contrast and a literary, fashion-house character.
**Body Font Family:** Inter — a neutral grotesque that stays quiet beneath the serif.
**Label Font Family:** Inter, uppercase, widely tracked.

### Hierarchy & Weights
- **Display Headlines (H1):** Newsreader, regular-to-medium weight (400–500), tight tracking (-0.02em), 3.5–5rem, line-height 1.02. Reserved for the hero and major statements.
- **Section Headers (H2):** Newsreader, medium weight (500), -0.01em tracking, 2–2.75rem. Introduces editorial sections.
- **Card Titles / H3:** Newsreader, medium (500), 1.25–1.5rem. Product and collection names.
- **Body Text:** Inter, regular (400), 1rem, line-height 1.7, Warm Ash. Comfortable, never dense.
- **Small Text / Meta:** Inter, regular (400), 0.8125rem, Warm Ash. Sizes, concentrations, shipping notes.
- **Labels & Eyebrows:** Inter, medium (500), 0.6875rem, uppercase, letter-spacing 0.18em. Used above sections and on badges.
- **Buttons:** Inter, medium (500), 0.875rem, letter-spacing 0.02em.

### Typographic Principles
- Serif carries emotion; sans carries information. Never mix roles.
- Maximum two weights per screen region.
- Uppercase labels are always tracked wide (0.16–0.20em); never uppercase body copy.
- Numerals in prices use tabular figures for clean alignment.

## 4. Component Stylings

### Buttons
- **Shape:** Subtly rounded, tailored corners (4px) — crisp, not pill-shaped.
- **Primary CTA:** Champagne Gold (#C6A664) fill with Obsidian Noir (#0B0A08) text. Comfortable padding (0.875rem vertical, 2rem horizontal).
- **Hover:** Fill deepens to Antique Brass (#8A7340) over 250ms; no glow, no scale.
- **Secondary CTA:** Transparent fill, 1px Smoke Graphite border, Ivory text. Hover raises the border to 20% ivory and warms the text to champagne.
- **Focus:** 1px champagne outline offset 2px, always visible for keyboard users.
- **Text link:** Ivory with a champagne underline that grows on hover.

### Cards & Product Containers
- **Corner Style:** Subtly rounded (4px), consistent with buttons.
- **Background:** Charcoal Velvet (#14120F) on the Obsidian canvas.
- **Border:** 1px Smoke Graphite hairline; on hover the border warms to 30% champagne.
- **Shadow:** None at rest. Hover adds a whisper-soft warm shadow (`0 18px 40px rgba(0,0,0,0.45)`) and a 4px lift.
- **Image Treatment:** Full-bleed square image, edge to edge, with a slow 500ms scale to 1.04 on hover.
- **Content Padding:** 1.25rem below the image; brand label above the product name, price anchored at the bottom.

### Navigation
- **Style:** Slim horizontal bar, 64px tall, Charcoal Velvet at 80% with backdrop blur, hairline bottom border.
- **Brand:** Small champagne dot paired with a tracked uppercase wordmark.
- **Links:** Inter 0.8125rem, Warm Ash by default, Ivory on hover, with a 1px champagne underline for the active route.
- **Right cluster:** Account, wishlist, cart count, and a two-letter locale switch separated by generous spacing.
- **Mobile:** Collapses to a full-screen drawer with large serif links.

### Inputs & Forms
- **Stroke:** 1px Smoke Graphite on a Charcoal Velvet fill.
- **Corner:** 4px, matching buttons.
- **Focus:** Border shifts to champagne with a 1px outer ring at 25% opacity.
- **Padding:** 0.75rem vertical, 1rem horizontal.
- **Placeholder:** Muted Taupe (#6F675B), never italic.

### Editorial Details
- **Section eyebrows:** `01 — COLLECTION` in tracked champagne uppercase.
- **Dividers:** 1px Smoke Graphite, full-bleed or inset to the grid.
- **Badges:** Outlined, uppercase, 0.625rem, champagne or Warm Ash text; never filled with loud color.

## 5. Layout Principles

### Grid & Structure
- **Max Content Width:** 1280px; reading columns capped at 68 characters.
- **Grid:** 12-column, 24px gutters mobile and 32px desktop.
- **Product Grid:** 4 columns large desktop, 3 desktop, 2 tablet, 2 mobile (compact).
- **Breakpoints:** Mobile <768px, Tablet 768–1024px, Desktop 1024–1440px, Wide >1440px.

### Whitespace Strategy
- **Base Unit:** 8px.
- **Section Padding:** 96px vertical mobile, 128px desktop — dramatic breathing room is the primary luxury signal.
- **Edge Padding:** 24px mobile, 48px desktop.
- **Hero:** Asymmetric split — 55% type, 45% product imagery — with 160px top padding and a single champagne hairline beneath.
- **Component Rhythm:** 16px within a group, 32px between groups, 64px+ between sections.

### Alignment & Visual Balance
- Left-aligned type for a confident editorial voice; centered only for the closing CTA band.
- Asymmetry over symmetry: offset image blocks and unequal column spans.
- Visual weight concentrated at the top-left of each section, with negative space trailing right.
- One focal point per viewport — never two competing CTAs.

### Responsive Behavior
- Mobile-first; serif display sizes scale down to 2.5rem.
- Filters collapse into a single "Filter" drawer on mobile.
- Sticky buy panel on product detail becomes a bottom bar on mobile.
- Touch targets minimum 44×44px.

## 6. Design System Notes for Stitch Generation

### Language to Use
- **Atmosphere:** "quiet nocturnal luxury, editorial restraint, private atelier"
- **Buttons:** "subtly rounded tailored corners" (not "rounded-md")
- **Shadows:** "hairline borders and tone shifts; whisper-soft warm shadow only on hover"
- **Spacing:** "generous breathing room", "asymmetric editorial layout"

### Color References
- Canvas: "Obsidian Noir (#0B0A08)"
- Surfaces: "Charcoal Velvet (#14120F)"
- Accent: "Champagne Gold (#C6A664)"
- Text: "Ivory Silk (#F5F0E6)" / "Warm Ash (#A79E8F)"

### Component Prompts
- "Create a product card with subtly rounded corners, a full-bleed square product image, a hairline border, and a whisper-soft warm shadow on hover"
- "Design a primary button in Champagne Gold (#C6A664) with Obsidian Noir text and subtly rounded corners"
- "Add a slim navigation bar in Charcoal Velvet with a tracked uppercase wordmark and generous spacing between links"
