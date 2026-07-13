---
name: Aether Portfolio Builder — Stitch Design Brief
purpose: Full UI + image generation brief for Google Stitch, covering every screen in the app
version: 1.0
companion_docs:
  - ethereal_portfolio_system/DESIGN.md (source design tokens — this file expands on it)
  - project_scope_document.txt (original product scope)
---

# Aether — Portfolio Builder Design Brief

This document is a complete, screen-by-screen generation brief for **Stitch**. It consolidates the
existing "Ethereal Portfolio System" design tokens with a full inventory of every screen the product
needs — including screens that have no prior mockup (Explore, Jobs, Profile, 404). Follow it literally:
exact hex values, exact copy, exact component states. Where a screen already has a reference mockup in
this folder, it's named explicitly so Stitch can use it as a style anchor; where none exists, this brief
is the sole source of truth.

Generate one image/frame per screen listed in Section 4, at both **desktop (1440×fit)** and **mobile
(390×fit)** widths, plus every named state (empty, loading, error, hover/active where noted).

---

## 1. Brand & Product Overview

**Product**: Aether — a portfolio builder for creators and developers. Users pick a premium theme, drop
in their work (optionally auto-imported from a resume or GitHub), and publish a shareable site. The
product also surfaces a "portfolio health score" and AI-matched job suggestions based on the finished
portfolio.

**Personality**: sophisticated, silent, architectural. A blank, premium canvas that recedes so the
user's own work is the visual hero. Calm confidence, professional speed — never loud, never playful.

**Visual style**: a fusion of **minimalism** and **subtle glassmorphism**. Extreme whitespace for
breathing room and luxury. Thin 1px borders, low-opacity fills, crisp geometric arrangements. Interfaces
should feel "lightweight" despite the dark palette — no heavy shadows, no gradients except the
atmospheric background auroras described in Section 3.6.

**Primary user**: designers, developers, photographers, writers, architects — anyone assembling a
professional portfolio to land clients, jobs, or freelance work.

---

## 2. Design Tokens (authoritative — do not deviate)

### 2.1 Color — Material-3-style token set (used for all semantic surfaces/text)

| Token | Hex | Usage |
|---|---|---|
| `surface` / `surface-dim` / `background` | `#16111b` | Base canvas (token value; see 2.2 for the literal body bg used in practice) |
| `surface-bright` | `#3d3741` | Elevated hover surfaces |
| `surface-container-lowest` | `#110c15` | Deepest recess (input wells) |
| `surface-container-low` | `#1f1a23` | Subtle containers |
| `surface-container` | `#231e27` | Standard containers |
| `surface-container-high` | `#2e2832` | Cards, active nav items |
| `surface-container-highest` | `#39323d` | Highest-emphasis containers |
| `on-surface` | `#eadfed` | Primary text on dark surfaces |
| `on-surface-variant` | `#cfc2d6` | Secondary/muted text |
| `outline` | `#988d9f` | Default borders on M3 surfaces |
| `outline-variant` | `#4d4354` | Subtle dividers |
| `primary` | `#ddb7ff` | M3 "primary" token (light lavender — used for on-dark accents, NOT the main CTA color, see 2.2) |
| `on-primary` | `#490080` | Text on primary-filled elements |
| `primary-container` | `#b76dff` | Mid-tone primary container |
| `secondary` | `#4cd7f6` | Cyan accent — focus rings, active nav, info cues |
| `on-secondary` | `#003640` | |
| `secondary-container` | `#03b5d3` | |
| `tertiary` | `#4edea3` | Emerald accent — success, health score, "Live" status |
| `on-tertiary` | `#003824` | |
| `tertiary-container` | `#00a572` | |
| `error` | `#ffb4ab` | Error text/icons |
| `error-container` | `#93000a` | Error fills |

### 2.2 Color — Literal flat palette (used for concrete UI elements — buttons, borders, chips, canvas)

This is the palette that actually renders in every screen; treat it as the primary palette and the M3
table above as the secondary/semantic layer underneath it.

| Role | Hex | Usage |
|---|---|---|
| Base canvas | `#0a0a0a` | `<body>` background, the true "black" of the app |
| Card / panel surface | `#171717` | Flat cards (Level 1) |
| Glass card fill | `rgba(23,23,23,0.6)` + `24px` backdrop-blur | Cards over the aurora background (Landing, auth, onboarding) |
| Glass panel fill | `rgba(23,23,23,0.7)` + `24px` backdrop-blur + `0px 10px 30px rgba(0,0,0,0.5)` shadow | Modals, elevated overlays (Level 2) |
| Border (standard) | `#262626` | 1px borders on all cards, inputs, dividers |
| Border (hover/focus) | `#06b6d4` (cyan) | Hover state on ghost buttons, focus rings on inputs |
| Primary action | `#a855f7` (violet/purple) | Solid fill for THE ONE critical action per screen: "Publish", "Get started", "Sign up", "Use this template" |
| Primary action hover | same hex, `opacity: 0.9` | |
| Secondary/info accent | `#06b6d4` / `#4cd7f6` | Links, focus states, secondary icons |
| Success / health | `#10b981` (emerald) — note: this is the flat token; `#4edea3`/`#00a572` are the M3 equivalents | Health score ring, "Live"/"Published" status, match-score badges |
| Chip background | `#262626` | Tag pills ("Draft", "React", "Minimal") |
| Chip text | `#a3a3a3` | |
| Muted text | `#a3a3a3` | Secondary copy, timestamps |

**Rule of thumb for Stitch**: canvas is `#0a0a0a`, cards are `#171717` or the glass variants, borders are
always `#262626` unless hovered/focused (then cyan), and there is exactly **one** `#a855f7` filled button
visible per screen — never two competing primary actions.

### 2.3 Typography

Dual-font strategy:
- **Plus Jakarta Sans** — all headlines, display type, section titles. Geometric, modern, tech-forward.
- **Inter** — all body copy, labels, form inputs, buttons, nav items. Optimized for legibility at small sizes.

| Style | Font | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Display | Plus Jakarta Sans | 48px | 700 | 1.1 | -0.02em |
| Headline LG | Plus Jakarta Sans | 32px | 600 | 1.2 | -0.01em |
| Headline LG (mobile) | Plus Jakarta Sans | 24px | 600 | 1.2 | — |
| Headline MD | Plus Jakarta Sans | 24px | 600 | 1.3 | — |
| Body LG | Inter | 18px | 400 | 1.6 | — |
| Body MD | Inter | 16px | 400 | 1.6 | — |
| Label MD | Inter | 14px | 500 | 1.4 | 0.01em |
| Label SM | Inter | 12px | 600 | 1.2 | 0.05em (uppercase, used for eyebrows/section labels) |

### 2.4 Spacing, radii, grid

- Base unit: **8px**. All internal padding favors `12px` (sm) or `24px` (md); never go below 8px or the
  UI reads "cramped."
- Section rhythm: **80px** vertical gap between major landing-page sections.
- Desktop grid: 12 columns, 24px gutters, content capped at **1200–1240px** max-width, centered.
- Mobile grid: 4 columns, 16px margins.
- Radii: standard components (buttons, inputs) = **8px** (`0.5rem`); cards/sections = **12px**
  (`0.75rem`); large hero containers = **24px** (`1.5rem`); pills/chips/status badges = **fully rounded**
  (9999px).

### 2.5 Elevation

No heavy drop shadows anywhere — depth comes from tonal layering + borders only.

- **Level 0** (canvas): `#0a0a0a`, no border.
- **Level 1** (cards, sidebar, static panels): `#171717` fill, `1px solid #262626` border, **no shadow**.
- **Level 2** (modals, dropdowns, the editor's floating toolbar): glass fill
  `rgba(23,23,23,0.8)` + `24px` backdrop-blur, `0px 10px 30px rgba(0,0,0,0.5)` shadow — the *only* place
  a shadow should appear.

### 2.6 Iconography

**Material Symbols Outlined** exclusively (weight 400, fill 0, grade 0, optical size 24 by default;
scale down to 20px inline in body text/buttons). Never mix in a different icon set. Common icons used
across the app: `dashboard`, `grid_view`, `work`, `settings`, `add`, `logout`, `arrow_back`, `close`,
`drag_indicator`, `article`, `view_carousel`, `smart_button`, `play_circle`, `alternate_email`, `forum`,
`stars`, `star`, `link`, `desktop_windows`, `phone_iphone`, `upload_file`, `error`, `photo_camera`,
`description`, `bolt`, `palette`, `insights`, `code`, `add_circle`.

### 2.7 Background treatment — "aurora" shader

Landing, auth (Login/Signup), Onboarding, and the 404 page use a soft, blurred, animated multi-blob
gradient glow behind the glass content — never sharp gradients, never full-saturation color, always
heavily blurred (100–140px blur) at 30–40% opacity so it reads as atmosphere, not decoration. Four named
color moods to rotate across these screens:

| Preset | Colors (in order) | Used on |
|---|---|---|
| Aurora | `#842bd2` → `#03b5d3` → `#00a572` (violet → cyan → emerald) | Landing page |
| Deep Sea | `#003640` → `#004e5c` → `#00424e` (teal/navy family) | Login |
| Neon Pulse | `#b76dff` → `#4cd7f6` → `#490080` (magenta/cyan/deep violet) | Signup, Onboarding |
| Solar Flare | `#00a572` → `#03b5d3` → `#842bd2` (emerald → cyan → violet, warmer overall mix) | 404 page |

Each preset renders as 3 large soft circular glows positioned off-canvas-corner (top-left, mid-right,
bottom-left), overlapping subtly, always beneath a `#0a0a0a` base layer so the very edges of the frame
stay near-black.

---

## 3. Global Components (reused across screens)

### 3.1 Logo
Small **24×24px rounded square**, solid `#a855f7` fill, white bold "A" centered, next to wordmark
"Aether" in Plus Jakarta Sans semibold, `on-surface` color. Always top-left.

### 3.2 Primary button
Solid `#a855f7` fill, white text, Inter semibold 14–15px, fully-rounded pill (marketing/auth contexts)
or `8px` radius rectangle (in-app contexts like Editor/Dashboard). Hover: same fill, translateY(-1px),
opacity 0.9. Always exactly one per screen.

### 3.3 Secondary / ghost button
Transparent fill, `1px solid #262626` border, `on-surface` text. Hover: border transitions to `#06b6d4`.
Same radius rules as primary (pill in marketing contexts, 8px in-app).

### 3.4 Input field
`#0a0a0a` background nested inside a `#171717`/glass surface, `1px solid #262626` border, `8px` radius,
12–14px internal padding, Inter 14–16px text, placeholder in `on-surface-variant`. Focus: border → cyan
`#06b6d4`, no glow/shadow.

### 3.5 Card
`#171717` (or glass-card over aurora backgrounds) fill, `1px solid #262626` border, `12px` radius, `24px`
internal padding. No shadow. Optional hover: border → `#06b6d4`.

### 3.6 Chips / tags / status pills
Fully rounded, `#262626` background, `#a3a3a3` text, 11–12px, semibold, uppercase for status labels
("SOON", "DRAFT"), sentence-case for content tags ("React", "Minimal"). "Live"/"Published" status pill
uses emerald tint instead: `rgba(16,185,129,0.15)` background, `#10b981` text.

### 3.7 Match-score / health-score badge
Small pill, emerald `#10b981` text on a low-opacity emerald background, bold percentage or numeric value
(e.g. "98% match", "78"). The full Portfolio Health Score is a **circular progress ring**: `#262626`
track, `#10b981` progress arc, rounded line caps, bold percentage centered inside in Plus Jakarta Sans.

### 3.8 Top navigation bar (public/marketing pages)
Sticky, `#0a0a0a` at 80% opacity + blur when scrolled, `1px solid #262626` bottom border. Left: Logo.
Center (desktop only): text nav links in `on-surface-variant`, hover → `on-surface`. Right: "Log In" text
button + "Sign Up" solid pill button.

### 3.9 App sidebar (authenticated pages: Dashboard, Explore, Jobs, Profile)
Fixed-width **256px** left rail, `1px solid #262626` right border, full viewport height. Top-to-bottom:
Logo → "+ Create New" solid primary button (full width) → nav list (Dashboard/Explore/Jobs/Settings, each
with a Material Symbol + label, active state = `#2e2832` background + `on-surface` text, inactive =
muted text) → spacer → divider → user row (circular avatar-initial badge + name + email, truncated) →
"Sign Out" ghost row with `logout` icon. This sidebar does **not** appear on Editor or Preview — those
are full-bleed distraction-free workspaces with their own top bar only.

### 3.10 Workspace top bar (Editor / Preview only)
Full-width bar, `1px solid #262626` bottom border, no sidebar beside it. Left: back-arrow + document
title (Editor) or "Back to editor" label (Preview). Center: contextual info (share URL + copy button on
Preview). Right: secondary actions (Import from GitHub, Preview, device toggle) then exactly one primary
button (Publish).

### 3.11 Modal
Centered, `rgba(0,0,0,0.6)` scrim with blur, glass-panel card (Level 2 elevation) max-width ~420px, `24px`
padding, close (`close` icon) top-right, title in Headline MD.

### 3.12 Loading skeleton
Same card footprint as the real content, `surface-container-high` fill, soft pulse animation (opacity
40%→70%→40%, ~1.5s loop). No shimmer sweep — a plain pulse is enough to keep it subtle.

### 3.13 "Soon" badge
Tiny pill, top-right corner overlay on a disabled card/widget, `10px` uppercase text, `#262626`/`#a3a3a3`,
paired with reduced opacity (50%) on the parent element.

---

## 4. Screens — full generation list

Generate each of the following as its own frame. Reference mockup files are named where they exist in
this folder; use them as the literal layout anchor. Where marked **(no reference — original design)**,
this brief's Layout/Content sections are authoritative.

### 4.1 Landing Page
*Reference: `aether_landing_page/code.html` (desktop), `aether_landing_page_mobile/code.html` (mobile)*

**Purpose**: convert a cold visitor into a signup.

**Layout (top to bottom)**:
1. Top nav (3.8) — links: Features, Templates, Pricing.
2. Hero, centered text over the Aurora background (2.7): small uppercase eyebrow pill "PORTFOLIOS FOR
   CREATORS & DEVELOPERS" (cyan tint) → Display headline "Build a portfolio worth bookmarking" → Body-LG
   subhead "A blank, premium canvas. Choose a theme, drop in your work, and publish a site that looks
   like you hired a studio." → two buttons side-by-side: primary "Get started free", ghost "Log in".
3. Three-column benefit cards (3.5), each: Material icon (`bolt`, `palette`, `insights`) in primary
   lavender, Headline-MD title, Body-MD description. Titles: "Publish in minutes", "Premium, minimal
   themes", "Know what is working".
4. "Theme showcase" section: Headline-LG title, 3-column grid of Template Cards (3.5 variant — see 4.4
   Explore for the card anatomy) showing Developer Minimal / Photographer Grid / Architect Showcase.
5. Two testimonial glass-cards side by side, large serif-feeling quote (still Plus Jakarta Sans, just
   larger/looser), attribution line below in muted text.
6. Closing CTA: a large glass-panel (Level 2) block, centered text, Headline-LG "Ready to build yours?",
   muted subtext "Free to start. No credit card required.", one primary button "Get started free".
7. Footer: 3-column — logo+tagline, Product links, Company/auth links, `1px` top border separating from
   page content.

**States**: none beyond default (static marketing page).

**Imagery needs**: no photography — purely typographic + the aurora background + flat template-card
thumbnails (abstract gradient placeholders, see 4.4).

### 4.2 Login Page
*Reference: `login_page_1/code.html`*

**Purpose**: returning-user auth.

**Layout**: Deep Sea aurora background full-bleed. Centered glass-panel card, max-width ~420px:
Headline-MD "Welcome back", muted subtext "Log in to keep building your portfolio.", then a form: Email
label+input, Password label+input, small right-aligned "Forgot password?" text link, primary button "Log
in" (full width). Below: a horizontal divider with centered "or continue with" label. Below that: two
ghost buttons side by side, Google and LinkedIn (each with their icon + label). Footer line: "Don't have
an account? Sign up" (Sign up as cyan link).

**States**: default; focused input (cyan border); (optional) inline error text in `#ffb4ab` under a field
if validation fails.

### 4.3 Signup Page
*Reference: `login_page_1/code.html` or `login_page_2/code.html`, extended*

**Purpose**: new-user registration, entry point into onboarding.

**Layout**: identical chrome to Login but Neon Pulse aurora, Headline-MD "Create your account", subtext
"Start building your portfolio in minutes.", four fields (Name, Email, Password, Confirm password),
primary button "Sign up", same social-login row, footer link reversed ("Already have an account? Log
in"). Inline error text under Confirm Password if passwords mismatch: "Passwords do not match" in
`#ffb4ab`.

### 4.4 Onboarding — Quiz
*Reference: `onboarding_quiz/code.html`*

**Purpose**: capture role/domain/goal to drive template recommendations.

**Layout**: minimal chrome — just the Logo top-left over the Neon Pulse aurora, no nav. Centered content,
max-width ~640px: a thin **3-segment progress bar** at top (filled segments = `primary` lavender, unfilled
= `#262626`). Below, a glass-panel card: small uppercase muted "Step X of 3", Headline-LG question text,
then a **wrapped row of pill choice-buttons** (not a list) — unselected: `#262626` border + muted text;
selected: `primary` border + 10%-opacity primary fill + `on-surface` text. Clicking a pill auto-advances
to the next step (no explicit "Next" button).

**The 3 steps** (exact copy):
1. "What's your role?" → Developer, Designer, Photographer, Writer, Architect
2. "What domain best describes your work?" → Product, Web, Mobile, Brand, Editorial
3. "What's your main goal?" → Land a job, Attract clients, Showcase side projects, Build my personal brand

### 4.5 Onboarding — Resume Upload
*Reference: `resume_upload_error_state/code.html`*

**Purpose**: optional resume ingestion to pre-fill the portfolio.

**Layout**: same minimal chrome as 4.4. Glass-panel card, centered text: Headline-LG "Upload your
resume", muted body explaining it pre-fills content and recommends a theme, and that it can be skipped.
Below: a large **dashed-border drop zone** (`2px dashed #262626`, `12px` radius, generous padding),
centered icon + short instruction "Drag & drop your resume, or" + a ghost "Browse files" button. Below
the drop zone: two actions — muted text button "Skip for now" and a primary "Continue" button (disabled/
40%-opacity until a file is present).

**Error state** (this is the variant this reference mockup exists specifically to show): drop zone border
turns `error` red, the icon swaps to `error` (red), and a red inline message appears below the zone —
either "Only PDF files are supported. Please upload a .pdf resume." or "File is too large. Please keep it
under 5MB." Generate this as its own explicit frame.

### 4.6 Onboarding — Template Recommendations
*Reference: `template_recommendations/code.html`*

**Purpose**: close out onboarding by picking a starting theme.

**Layout**: Headline-LG "Recommended for you" centered, muted subtext "Based on your answers, these
themes are the best fit." Below: a 3-column grid of Template Cards (see 4.9 for card anatomy) — Developer
Minimal (98% match), Photographer Grid (91% match), Architect Showcase (87% match). Below the grid: a
muted text link "Skip, I'll choose later".

### 4.7 Dashboard
*Reference: `creator_dashboard/code.html`*

**Purpose**: authenticated home base.

**Layout**: App sidebar (3.9, active item = Dashboard) + main content area, `32px` padding, max content
width ~1100px:
1. Greeting: Headline-MD "Welcome back, {Name}" + muted subtext "Here's how your portfolios are doing."
2. Three-card stat row: "Views (30d)" big number + green "+18%" delta; "Visitors (30d)" big number +
   green "+9%" delta; a compact card showing the Portfolio Health circular badge (value ~78) beside
   "Portfolio health" label + "N tips to improve" muted subtext.
3. "Boost your score" card: a stacked list of tip rows, each: Material icon (cyan) + label text on the
   left, a bold emerald "+N pts" value on the right. Example tips: "Add a profile photo" (+5 pts),
   "Connect your GitHub" (+8 pts), "Write a longer bio" (+4 pts).
4. "Your portfolios" section header with a "+ New portfolio" cyan text-link on the right. Below: a
   2-column grid of portfolio cards — each a clickable card showing title, a status pill top-right
   ("Live" emerald-tinted or "Draft" gray), and muted "Edited {time}" caption.

**States**: loading (skeleton cards in place of the portfolio grid), empty (no portfolios yet — show a
single dashed-border prompt card: "Create your first portfolio" + primary button).

### 4.8 Explore **(no reference — original design)**
**Purpose**: browse all available themes/templates by category.

**Layout**: App sidebar (active = Explore) + main content: Headline-MD "Explore templates" + muted
subtext "Browse themes and widgets by profession or style." Below: a horizontal row of rounded filter
pill-buttons (All, Developer, Photographer, Architect, Writer, Motion, Generalist) — selected pill uses
the `primary`-tinted active style from 4.4's quiz pills. Below: a responsive 3-column grid of Template
Cards (see 4.9).

**Template Card anatomy** (reused on Landing, Explore, Onboarding Recommendations):
Card (3.5), top: a **16:9 gradient thumbnail** (abstract dark-to-darker diagonal gradient, no photography
— e.g. `#231e27` → `#16111b`) with `12px` top-corner radius only. Below, `24px` padding: title
(Headline-MD scaled down, ~18px) + a small match/relevance badge top-right of the title row; a one-line
muted tagline; a row of small tag chips (3.6); a full-width primary button "Use this template" pinned to
the card bottom.

**States**: empty-filter state (no cards match) — centered muted text "No templates in this category yet."

### 4.9 Editor — Workspace
*Reference: `portfolio_editor_workspace_1/code.html` (primary), `portfolio_editor_workspace_2/code.html`
(tabbed right panel + device toggle variant)*

**Purpose**: the core building tool — no app sidebar, full-bleed 3-pane workspace.

**Layout**:
- **Top bar** (3.10): left — back-arrow + portfolio title ("Untitled Portfolio"); center-right cluster —
  small circular Portfolio Health badge (compact, ~40px), ghost button "Import from GitHub", ghost button
  "Preview"; far right — solid primary "Publish" button.
- **Left pane** (~256px, `1px solid #262626` right border): uppercase muted label "SECTIONS", then a
  vertical list of section rows — each row: a `drag_indicator` handle icon (cursor-grab) + section-type
  label (capitalized: Hero, Projects, Contact, Text…) + a small `close` icon to delete, right-aligned.
  Active/selected row gets `surface-container-high` background.
- **Center canvas** (flexible width, scrollable, `32px` padding, content capped ~640px centered): stacked
  section preview blocks, each a bordered card showing the section-type as a small uppercase label plus
  its main content line (e.g. "Hero" / "Your Name" / "What you build"); the currently-selected section
  gets a `primary`-colored border ring. Below the last section: a **dashed drop-zone** card with an
  `add_circle` icon and the text "Drag a widget here to add a section" — this zone highlights with a
  cyan border + faint cyan tint when a widget is being dragged over it.
- **Right pane** (~288px, `1px solid #262626` left border): two-tab header, "Widgets" (active by default)
  and "Theme". **Widgets tab**: grouped by category label (Essential / Social & Media / Experimental),
  each a 2-column grid of small draggable widget cards (icon + label): Text Block, Image Grid, Project
  List, CTA Button, Carousel, Video Player, Social Icons, then the disabled/greyed pair Blog and Reviews
  each carrying a "SOON" badge (3.13). **Theme tab**: a vertical list of theme-option rows (name + short
  tagline), the currently-applied theme highlighted with a `primary` border + tinted fill.

**GitHub Import modal** (3.11): title "Import repositories", a scrollable list of repo rows — each: repo
name (bold) + a `star` icon with count on the right, description line below in muted text. Clicking a row
imports it and closes the modal.

**States**: dragging (a semi-transparent duplicate of the dragged widget/section follows the cursor;
the valid drop target highlights); empty canvas (should not really occur since a new portfolio seeds 3
default sections, but if all sections are removed, show the same dashed drop-zone alone, centered
vertically).

### 4.10 Preview **(no reference — derive from Editor's canvas, stripped of edit chrome)**
**Purpose**: distraction-free, near-final look at the portfolio before publishing.

**Layout**: full-bleed, no sidebar. Top bar only: left — back-arrow + "Back to editor" label; center —
a `link` icon + the fake shareable URL text (`aether.app/p/{id}`) + a small cyan "Copy" text button
(swaps to "Copied" briefly on click); right — a small two-button desktop/mobile device toggle (icon-only
segmented control) + solid primary "Publish" button. Below the bar: the rendered portfolio itself,
centered, capped at a max width that shrinks to a **375px** phone-sized column when the mobile toggle is
active — each section renders as a bordered block (same visual language as the Editor canvas, just
without the selection ring or drag handles) stacked vertically.

**States**: desktop-width vs. mobile-width toggle (generate both as separate frames).

### 4.11 Jobs **(no reference — original design)**
**Purpose**: AI-matched job/internship suggestions based on the user's portfolio.

**Layout**: App sidebar (active = Jobs) + main content: Headline-MD "Job suggestions" + muted subtext
"Matched to your portfolio and goals." Below: a responsive 2-column grid of Job Cards. **Job Card**:
card (3.5), top row — bold title + company/location muted line on the left, match-score badge (3.7,
emerald, e.g. "94% match") top-right; a 2-line muted description; a row of skill/context tag chips
(3.6, e.g. "React", "TypeScript", "Remote"); a full-width button at the bottom — primary "Apply with
portfolio" by default, which **transforms in place** into an outlined emerald pill reading "Applied"
(border + text in emerald, no fill) once clicked — generate both states as separate card variants.
Bottom of the page: two small muted text links, "Back to dashboard" and "Update profile".

**States**: loading (skeleton cards, taller aspect than Dashboard's skeletons — roughly 176px tall);
empty ("No matches yet — finish your portfolio to unlock job suggestions.").

### 4.12 Profile & Settings **(no reference — original design)**
**Purpose**: manage personal info, integrations, notification preferences.

**Layout**: App sidebar (active = Settings) + main content, narrower column (~700px max):
Headline-MD "Profile & settings" + muted subtext. Three stacked cards:
1. **Personal info**: Headline-MD "Personal info" (smaller, ~20px), Name field, Email field, primary
   button "Save changes" (left-aligned, not full width) that briefly reads "Saved" after submit.
2. **Integrations**: Headline-MD "Integrations", then rows — each: provider icon (`code` for GitHub,
   `palette` for Behance) + provider name on the left; on the right, a status chip ("Connected" emerald-
   tinted or "Not connected" gray) + a cyan text action ("Disconnect" / "Connect"). Divider between rows.
3. **Notifications**: Headline-MD "Notifications", then rows — label text on the left, a **pill toggle
   switch** on the right (on = `#a855f7` filled track with white knob at the right edge; off = `#262626`
   track with white knob at the left edge). Example rows: "Weekly analytics summary" (on), "New job
   matches" (on), "Product updates" (off).

### 4.13 404 — Not Found **(no reference — original design, "branded 404" per scope doc)**
**Purpose**: soften a broken/unknown route.

**Layout**: full-bleed Solar Flare aurora background, no sidebar/nav except the Logo top-left (or simply
centered above the content). Centered vertically and horizontally: Logo, then a **huge Display-weight
"404"** (scale it up beyond the normal 48px display size — this is the one place oversized type is
allowed, treat it as ~96–128px), muted body text "This page drifted off canvas. Let's get you back
somewhere useful.", then one primary pill button — "Back to dashboard" if the visitor is logged in, "Back
home" if not (generate both copy variants, same visual frame).

---

## 5. Responsive rules

- Breakpoint: collapse to mobile layout under **768px**.
- Public top nav (3.8): center link group hides; keep Logo + Log In + Sign Up only (consider collapsing
  "Log In" to icon-only or a hamburger menu if width is tight).
- App sidebar (3.9): on mobile, collapse to a bottom tab bar or an off-canvas drawer triggered by a
  hamburger icon in a thin top bar — do not attempt to render the full 256px rail on a 390px frame.
  Generate the mobile Dashboard as its own frame using this collapsed nav.
- All multi-column grids (stat rows, template/job card grids, benefit cards) collapse to a single column.
  Aurora blobs shrink proportionally but keep the same blur/opacity ratios, and all `max-width` content
  containers become full-bleed with 16px side margins.

---

## 6. Image & asset generation notes (for Stitch's image outputs specifically)

- **No stock photography anywhere.** Every "image" in this product is either: (a) an abstract dark
  gradient thumbnail placeholder for a template/theme, (b) a user's own uploaded content (never
  fabricate a face or project screenshot as if it were real user content), or (c) the atmospheric aurora
  background blobs.
- **Template/theme thumbnails**: generate as abstract 16:9 gradient tiles, each using a two-stop diagonal
  gradient drawn from the surface-container palette (`#231e27` → `#16111b`, or a subtly tinted variant
  per category — e.g. a faint violet cast for "Developer", a faint cyan cast for "Photographer", a faint
  emerald cast for "Architect" — keep the tint under 10% saturation so it stays premium/muted, never a
  loud colored image).
- **Avatars**: single-letter initial badges only (circular, `surface-container-high` fill, `on-surface`
  bold letter centered) — never generate a human face for a user avatar.
- **Aurora backgrounds**: render as three overlapping soft-edged circular glows per the presets in 2.7,
  each blurred 100–140px, 30–40% opacity, positioned so they bleed off at least one frame edge (never a
  centered, symmetric glow — it should feel like ambient light leaking in from a corner).
- **Icons**: always Material Symbols Outlined at consistent stroke weight; never generate custom
  illustrated icons or filled/duotone icon styles.
- **Empty-state art**: if an empty state needs a supporting visual (e.g., "no portfolios yet"), keep it to
  a single large outlined Material icon in muted `on-surface-variant` color, centered above the text —
  not a custom illustration.

---

## 7. Naming convention for generated frames

Export each frame as `{screen-number}-{screen-slug}-{variant}.png`, e.g.:
`4.5-onboarding-resume-upload-error.png`, `4.9-editor-workspace-dragging.png`,
`4.11-jobs-card-applied.png`. This keeps generated assets traceable back to the exact section of this
brief that specified them.
