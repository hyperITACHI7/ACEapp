---
name: extract-portfolio
description: Convert a pre-built portfolio folder (Figma Make / Vite+React export) into a native template (theme) + bundled widgets, with size variants and a blueprint that reproduces the reference exactly. Use when asked to "extract this portfolio/template/reference folder", "convert this Figma export into a theme", or "turn this reference into widgets".
---

# Extract a pre-built portfolio into a template + widgets

You are converting a **reference portfolio** — a self-contained exported web app sitting in a
folder — into this product's native format: one **theme** (called a "template" in user-facing
language) under `packages/themes/<theme-id>/`, plus a set of **widgets** under
`packages/widgets/<widget-key>/`, plus a **blueprint** so that a user opening a new portfolio
with this template sees *exactly* what the reference looks like — same widgets, same sizes, same
positions, same sample content — and the editor's left Outline sidebar mirrors those exact
footprints and positions.

**Input**: a path to the reference folder. Convention: reference folders live at
`references/<name>/` in the repo root. (`references/` should be in `.gitignore` — add it if
missing; these are third-party exports, potentially large, and never ship.) A reference may also
be pointed at anywhere else (e.g. the legacy `Login Page/` folder at the repo root) — the path is
an argument, the convention is just where new ones should go.

**Output**:
- `packages/themes/<theme-id>/` — manifest, component, palettes, colocated CSS, `blueprint.ts`
- `packages/widgets/<widget-key>/` × N — one per extracted widget, each with manifest,
  server-safe index, client component, colocated CSS
- Registry entries in `packages/widgets/registry.ts` and `packages/themes/registry.ts`
- Sample images in `apps/web/public/templates/<theme-id>/`
- New CSS `@import` lines in `apps/web/src/app/globals.css`
- Possibly new section entries in `apps/web/src/app/(app)/editor/sectionMeta.ts`

Work through the phases below **in order**. Phase 0 is platform plumbing that only needs to be
built once — check whether it already exists before building it.

---

## Non-negotiable invariants (read before anything else)

These come from the codebase's architecture and hard-won debugging. Violating any of them
produces a template that breaks in ways you won't see until runtime.

1. **One renderer, WYSIWYG.** `apps/web/src/lib/portfolioRenderer.tsx` is the single render
   function used by BOTH the editor's live preview and the public `/[username]` page. You never
   write editor-specific or public-specific render paths for a widget or theme.

2. **Widgets are theme-agnostic.** Every registered widget must render acceptably under every
   theme, not just the one it was extracted from. Style with the palette CSS variables
   (`--bg`, `--fg`, `--accent`, `--accent-2`, `--muted`, `--border`, `--card`, `--font-heading`,
   `--font-body`, `--font-mono`) with graceful fallbacks (`var(--font-mono, monospace)`), never
   hardcoded colors for anything palette-like.

3. **Widgets never throw and never render blank on empty data.** Missing profile fields, empty
   arrays, absent config — all must degrade to placeholders or empty states. The renderer wraps
   every widget in an ErrorBoundary, but a boundary firing means a broken widget, not a handled
   case.

4. **`index.tsx` must NOT be `"use client"`.** `packages/widgets/registry.ts` reads
   `manifest.key`/`manifest.section` from a Server Component. Anything needing hooks,
   `EditableText`, `useEditorMode`, or browser APIs goes in a **separate client component file**
   (`"use client"` at the top) that `index.tsx` imports. Copy the structure of any existing
   widget (e.g. `packages/widgets/about-animated/` — `index.tsx` + `AboutAnimatedComponent.tsx`).

5. **All responsive CSS is container-relative, never viewport-relative.** The portfolio renders
   inside the editor's preview panel at far less than viewport width. Use
   `@container (min-width/max-width: Npx)` — never `@media (min-width: ...)` for size-based
   rules — and `cqw`/`cqh` units, never `vw`/`vh`, for anything that must scale with the
   portfolio's own rendered size. The container context is `.theme`
   (`container-type: inline-size` in `packages/themes/_shared/shared-themes.css`), plus
   `.portfolio-canvas` (`container-type: size`, editor-only) for the height axis.
   Non-size media features (`prefers-reduced-motion`, `pointer: coarse`) stay as `@media`.

6. **`position: fixed` elements must portal to `document.body`.** `.theme`'s container-query
   containment (`contain: layout`) makes it the containing block for fixed descendants — a
   fixed element left inside the tree gets positioned relative to `.theme`'s box, not the
   viewport. Precedent: `CustomCursor` in
   `packages/themes/animated-motion/AnimatedMotionComponent.tsx` uses
   `createPortal(..., document.body)` with an SSR-safe `mounted` state guard. Copy that pattern
   for any cursor/overlay/floating element.

7. **Prefer shrinking over restyling.** When a widget must fit a narrower space, its existing
   layout should shrink fluidly first (flexbox with basis-at-minimum + grow, or
   `repeat(auto-fit, minmax(Npx, 1fr))` grids) and only change form (stack, hide elements) when
   the minimums genuinely no longer fit. Avoid hand-picked pixel breakpoints where a fluid
   technique works. House-style examples: `packages/widgets/about-animated/about-animated.css`
   (flex shrink-then-wrap with documented `min-width`/`minmax(0,1fr)` reasoning) and
   `packages/widgets/gallery-animated/gallery-animated.css` (`auto-fit` grid).

8. **The 2-column grid is fixed; heights are open integers.** Widget footprints are `w×h` with
   `w ∈ {1,2}` and `h` an integer row count (schema caps at 12). One grid row ≈ **330px of
   rendered desktop height** — this is a *proportion convention*, not a pixel constraint: the
   renderer's rows are `grid-auto-rows: auto` (always sized to content), so `h` drives the
   Outline sidebar's card proportions and row-sharing granularity, never a hard height.
   Rules: a widget's **native footprint** (the one reproducing the reference) gets
   `h = round(measured natural height / 330)` and may be as tall as the reference needs; every
   **alternate variant stays within 2x2** (the registry validator enforces "at most one entry
   taller than 2 rows"). Never leave a visually large section at `h: 1` — a 1300px About at
   `h: 1` renders fine but shows as a tiny sidebar card identical to a 400px Contact, which
   reads as a bug to users. Do not invent finer grids (no 3+ columns, no fractional units).

---

## Phase 0 — platform capabilities (build once, skip if present)

Check for each of these; implement any that are missing **before** starting extraction. All of
them are additive and zero-DB-migration (`Portfolio.data` is a schemaless Prisma `Json` column).

### 0.1 Template blueprint

**What exists today**: a theme manifest only has `defaultWidgetKeys` (section id → widget key).
New portfolios are seeded essentially empty — `emptyPortfolioData(themeId, palette)` in
`packages/portfolio-schema/src/index.ts` — at two sites:
- `apps/web/src/app/api/portfolios/route.ts` (POST — "add another portfolio")
- `apps/web/src/app/api/onboarding/complete/route.ts` (first portfolio; seeds widgets from
  `defaultWidgetKeys` in a hardcoded section order, every instance `config: {}`, no `grid`)

**What to build**: an optional `blueprint` carried by the theme module.

1. Define the type in `packages/themes/types.ts`:

```ts
/** A complete starting portfolio for this theme — widgets with exact grid placements and
 *  pre-filled sample content, nav groups, and sample profile data, so a new portfolio opens
 *  looking exactly like the reference this theme was extracted from. All fields the user then
 *  edits/replaces as their own. */
export interface TemplateBlueprint {
  widgets: Array<{
    key: string;
    order: number;
    visible: boolean;
    config: Record<string, unknown>;
    grid?: { x: 0 | 1; y: number; w: 1 | 2; h: number }; // h = integer row count, see invariant 8
    groupId: string; // REQUIRED in blueprints — see Phase 6 (ungrouped widgets break the sidebar)
  }>;
  navGroups: Array<{ id: string; name: string; order: number; showInNav: boolean }>;
  profile?: Partial<ProfileShape>; // sample name/headline/bio/photoUrl/location/socialLinks
  projects?: unknown[];            // match packages/portfolio-schema/src/project.ts
  experience?: unknown[];          // match packages/portfolio-schema/src/experience.ts
  skills?: string[];
  palette?: string;                // defaults to manifest.defaultPalette
}
```

   Add `blueprint?: TemplateBlueprint` to the `ThemeModule` type (alongside `manifest`,
   `Component`, `palettes`) — NOT to `manifest.json` (blueprints contain long content and
   sometimes computed values; they live in a `blueprint.ts` file exporting the object, imported
   by the theme's `index.tsx` and included in its default export).

2. Consume it at both seeding sites: where the route currently builds
   `emptyPortfolioData(...)` / the `defaultWidgetKeys` fallback list, first check
   `theme.blueprint` — if present, deep-merge it over `emptyPortfolioData(themeId, palette)`
   (blueprint's widgets/navGroups/profile/etc. win; `meta` stays from `emptyPortfolioData`).
   Run the result through `validatePortfolioData` before persisting — a blueprint that fails
   schema validation is an authoring bug that must fail loudly at development time.

3. **Why this satisfies "the sidebar reflects the reference exactly"**: the Outline sidebar
   (`apps/web/src/app/(app)/editor/OutlineSidebar.tsx`) and the renderer both compute layout via
   `resolveGridLayout(widgets, navGroups)` from each widget's stored `grid` — so a blueprint
   with explicit `grid: {x,y,w,h}` values makes both the preview AND the sidebar cards appear at
   exactly those footprints and positions, with zero sidebar changes. A widget whose reference
   appearance is the 1x1 variant is stored as `grid: {..., w: 1, h: 1}` and the sidebar card is
   small; nothing anywhere labels it "default" — it simply *is* the starting state.

### 0.2 `bundledWith` on the widget manifest (monetization data)

Business rule: **buying a template unlocks all widgets bundled with it, and those widgets are
then usable in any template.**

- Add to `WidgetManifest` in `packages/widgets/types.ts`:

```ts
/** Theme id whose purchase unlocks this widget (widgets travel with the template they were
 *  extracted from, but once unlocked are usable under ANY theme). Absent = core widget,
 *  free for everyone. */
bundledWith?: string;
```

- Every extracted widget's `manifest.json` sets `"bundledWith": "<theme-id>"`. The 20
  pre-existing widgets get nothing (core/free).
- **Do not implement drawer enforcement now.** Record the association only. The future
  enforcement point (document this in code comments): `apps/web/src/app/(app)/editor/
  WidgetDrawer.tsx` filters `listWidgets()` to `manifest.bundledWith === undefined ||
  ownedThemeIds.includes(manifest.bundledWith)`, with ownership from the existing
  `userOwnsTheme()` in `apps/web/src/server/payments/ownership.ts` (respects the
  `DEV_UNLOCK_ALL_THEMES` env flag).

### 0.3 `sizes` on the widget manifest (supported footprints)

Generalizes the existing `lockedWidth: true` flag (used by `about-animated`, `skills-marquee`).

- Add to `WidgetManifest`:

```ts
/** Which grid footprints this widget has a designed rendering for, as "WxH" strings — W ∈ {1,2},
 *  H an integer 1..12 (one row ≈ 330px rendered desktop height, see invariant 8). List the
 *  NATIVE footprint (the reference's own proportions) first; at most that one entry may have
 *  H > 2 — alternates stay within 2x2. The editor's resize handle is constrained to the min/max
 *  of each dimension across entries, so intermediate heights between designed variants are
 *  reachable (they render the nearest designed variant — harmless, rows are auto-height) but
 *  nothing beyond the native footprint is. Absent = all of 1x1/1x2/2x1/2x2 (legacy).
 *  `lockedWidth: true` remains supported and means "w is always 2". */
sizes?: Array<`${1 | 2}x${number}`>;
```

- In `OutlineSidebar.tsx`, `widgetSizeConstraints` derives `minW/maxW/minH/maxH` from `sizes`.
  **Parse with `s.split("x")`, never by character index** — `Number(s[2])` reads `"2x10"` as
  height 1 (this was a real bug). The min/max bounding box means an L-shaped set like
  `{1x1, 2x2}` technically permits 1x2 via the handle; accept and note it.
- `packages/widgets/scripts/validateRegistry.ts` asserts: `sizes`, when present, is non-empty,
  every entry matches `/^[12]x(1[0-2]|[1-9])$/`, and **at most one entry has H > 2**.
- `updateGridPositions` in `apps/web/src/app/(app)/editor/sectionOps.ts` must NOT clamp `h` to 2
  (`clampSpan` is for `w` only) — a silent clamp there destroys tall native placements on the
  first sidebar drag.

### 0.4 `hero` and `cursor-effect` sections

The hero/name block and any custom mouse cursor **are widgets** in extracted templates (they are
NOT in the 6 existing themes — do not retrofit those; that's separately-tracked future work).

- Add `hero` and `cursor-effect` to the three maps in
  `apps/web/src/app/(app)/editor/sectionMeta.ts` (`SECTION_LABELS`, `SECTION_ICONS`,
  `SECTION_COLORS`) — pick lucide icons (e.g. `Crown`/`Sparkle` for hero, `MousePointer2` for
  cursor-effect) and distinct colors consistent with the existing set.
- The theme scaffold rule ("shell header renders before slots so a zero-widget portfolio is
  never blank", `packages/themes/_theme-template/index.tsx`) is **amended for blueprint
  themes**: the shell renders its minimal name-header **only when no hero-section widget is
  visible** — check
  `data.widgets.some(w => w.visible && getWidget(w.key)?.manifest.section === "hero")`.
  A blueprint theme normally ships a hero widget, so the shell header stays dormant; if the
  user deletes the hero widget, the minimal header reappears rather than a blank page.
- A cursor-effect widget renders nothing in normal flow — it portals its DOM to `document.body`
  (invariant 6) and should render `null` while unmounted/SSR. In the editor it should also
  render `null` when `useEditorMode().editing` is true if the effect would fight the editor's
  own cursor (follow `animated-motion`'s `{!editing && <CustomCursor />}` precedent).

### 0.5 Assets convention

Sample images from the reference are copied to `apps/web/public/templates/<theme-id>/<file>` and
referenced by absolute URL path (`/templates/<theme-id>/<file>`) in blueprint config/profile
values. Optimize before committing: re-encode to reasonable web sizes (≲300KB each; the repo
has `sharp` available in `apps/web` if scripted resizing is needed). Never hotlink the
reference's original remote URLs.

---

## Phase 1 — survey the reference

Goal: a complete visual + technical inventory before any code is written.

1. **Identify the export type.** A Figma Make export looks like: `package.json` with name
   `@figma/my-make-file`, Vite (`vite.config.ts`, scripts `dev`/`build` = `vite`), React 18 as
   peer dep, Tailwind v4 via `@tailwindcss/vite`, a `src/app/App.tsx` monolith (often 500+
   lines, all content hardcoded), `src/app/components/ui/` full of ~50 shadcn components (mostly
   unused — check actual imports in App.tsx before assuming any is needed), `src/styles/*.css`,
   sometimes `guidelines/Guidelines.md` and `ATTRIBUTIONS.md`. The repo's `Login Page/` folder
   is a live example of this exact anatomy.

2. **Run it.** `cd <folder> && npm install && npx vite --port 5199`, open it with Playwright
   (Chromium is installed in the session scratchpad from prior sessions, or install fresh), and
   capture:
   - Full-page screenshot at ~1440px wide and at ~390px wide.
   - One cropped screenshot per distinct visual section (hero, about, skills, projects, etc.).
   - A short screen-interaction pass: hover states, scroll-triggered animations, the cursor
     behavior, nav clicking.
   Save all screenshots to the session scratchpad — they are your ground truth for "pixel-close"
   in Phase 7.

3. **Inventory, in writing** (a scratchpad notes file):
   - Palette: every distinct color used, mapped to candidate roles (`--bg`, `--fg`, `--accent`,
     `--accent-2`, `--muted`, `--border`, `--card`).
   - Fonts: families and where each is used (heading/body/mono roles).
   - Sections top-to-bottom with their content type and approximate proportions.
   - Animations: what animates, on what trigger (mount, scroll-into-view, hover, infinite).
     The monorepo uses `motion/react` (framer-motion) — Figma Make exports usually do too, so
     animation code often ports nearly verbatim.
   - Nav: what links exist, what they scroll to.
   - Cursor: default, or custom (dot/blend-mode/scale-on-hover etc.).
   - Assets: every image/SVG and where it's used.

---

## Phase 2 — segmentation: deciding what is a widget

Apply these rules to the section inventory. When in doubt, fewer, richer widgets beat many
fragmentary ones.

| Reference element | Becomes |
|---|---|
| Name/hero/intro block (big name, tagline, CTA buttons) | **A widget**, `section: "hero"` |
| Custom mouse cursor / pointer effect | **A widget**, `section: "cursor-effect"` (portaled, see 0.4) |
| Nav header | **Theme shell** — it is generated from `navGroups`, never a widget |
| Footer | **Theme shell** |
| Ambient background (orbs, grids, gradients, noise) | **Theme shell** (positioned `absolute` within the theme root, never `fixed`) |
| About/bio section | Widget, `section: "about"` |
| Skills list/cloud/marquee/bars | Widget, `section: "skills"` |
| Projects/work grid or list | Widget, `section: "gallery"` |
| Work history/timeline | Widget, `section: "experience-timeline"` |
| Education, awards, testimonials/quote, stats, contact | Widgets, matching existing section ids |
| A section with no semantic match to any existing id | Widget with a **new section id** — sparingly, and register it in `sectionMeta.ts` (0.4 shows how) |

Additional rules:

- **Repeated cards are ONE widget.** A grid of 6 project cards is one gallery widget, not six.
  The items come from either **schema data** (`data.projects`, `data.experience`,
  `data.skills`, `data.profile.*`) when the content semantically matches those shapes — this is
  strongly preferred, because then the user's own data flows in — or from **`config` arrays**
  (declared in `configSchema`) for content with no schema home (stat numbers, testimonial
  quotes, service lists). Mixing is normal: `about-animated` renders `data.profile.bio` +
  `config.stats`.
- **Existing section = user's data slots continue to work.** Reusing `gallery` for the projects
  widget means GitHub-imported projects appear in it automatically. This is why matching
  existing sections matters more than inventing precise new ones.
- **Widget key naming**: `<theme-id>-<section>` (e.g. `neon-folio-hero`,
  `neon-folio-gallery`). If a theme needs two widgets in one section, add a discriminator
  (`neon-folio-gallery-strip`).
- **Label naming**: follow the existing convention `"<Thing> (<Theme flavor>)"`, e.g.
  `"Gallery (Neon Grid)"` — the drawer groups by section and shows labels as style choices.

Record the segmentation as a table in your notes: reference section → widget key → section id →
data source (schema fields / config fields) → which theme-shell parts absorb the rest.

---

## Phase 3 — size-variant design (per widget)

For each widget, decide its supported footprints and design each one **before** writing code.

1. **Measure, then derive the native footprint.** With the reference running (Phase 1), measure
   each section's rendered height at ~1440px viewport (`getBoundingClientRect()` via the
   Playwright page — script it once for all sections). The native footprint is
   `w = 2` (or 1 for genuinely half-column sections) and `h = round(height / 330)`, min 1.
   A 660px hero → `2x2`; a 1320px about → `2x4`; a 430px contact → `2x1`. This value goes into
   the blueprint's `grid.w/h` AND is listed first in `sizes` — that is the entire "default"
   mechanism. No UI labeling. Do NOT flatten everything to `h: 1` (invariant 8: the sidebar's
   card proportions come from `h`).

2. **For each alternate footprint (all within 2x2 — see invariant 8), make an explicit
   keep/drop decision.** A footprint is supported only if a *good* design exists for it — not a
   squashed version of the big one. Heuristics for deriving smaller variants:
   - Reduce item counts: 4 cards → 2 → 1 (see `sizeConfig` in
     `packages/widgets/gallery-animated/GalleryAnimatedComponent.tsx`: 2x2 → 4 slots+scroll,
     2x1 → 2 slots, 1x2 → 2 slots stacked+scroll, 1x1 → 1 slot).
   - Side-by-side → stacked (image beside text → image above text).
   - Drop tertiary content first (tags, dates, decorative counters), then secondary
     (descriptions), never primary (title/name).
   - Text sizes may step down but stay readable; prefer `clamp(min, Ncqw, max)`.
   - A widget that genuinely has one shape (a full-bleed marquee, a hero) gets
     `sizes: ["2x1"]` or similar — a single entry is fine and correct.
   - A cursor-effect widget renders nothing in-flow: give it `sizes: ["1x1"]` and a minimal
     in-editor placeholder card appearance (its sidebar card is how the user toggles/removes it).

3. **Implementation pattern — every declared size MUST have an implemented variant.** This is a
   hard rule: a `sizes` entry with no corresponding rendering/CSS behind it produces the classic
   "resize → text overlaps / crams" bug, because the full-width design just gets squeezed. The
   component finds its own current footprint at render time (copy from `gallery-animated`):

```ts
const grid = resolveGridLayout(data.widgets.filter(w => w.visible), data.navGroups ?? [])
  .find(g => g.key === instanceKey);
const variant = sizeConfig(grid?.w ?? 2, grid?.h ?? 1); // defaults = the native footprint
```

   — then renders variant-specific structure and/or sets modifier classes
   (`widget-x--narrow` when `w === 1`, `widget-x--compact` when `h === 1`, the
   `gallery-animated-grid--narrow` precedent). Since heights between designed variants are
   reachable via the resize handle, write thresholds as ranges (`h >= 3` full, `h === 2` mid,
   `h === 1` compact), never exact-match ladders. When a variant caps item counts, cap ONLY on
   the public page (`!editing`) so content never becomes unreachable in the editor.
   There is no `grid` prop on `WidgetProps` (`data`, `config`, `instanceKey` only) — this
   lookup IS the mechanism.

   **`@container` queries CANNOT drive footprint variants.** The container root is `.theme`
   (the whole portfolio's width), so a half-width widget still matches wide breakpoints — an
   `@container (min-width: 640px)` side-by-side rule crams into a 1-column cell. Use
   `@container` ONLY for whole-portfolio narrowness (the mobile fallback); use the JS lookup
   for anything that depends on the widget's own `w`/`h`.

   **Layout-safety rules for widget CSS** (each of these caused a real overlap bug):
   - No fixed `height`/`min-height` on containers whose content can exceed them, and no
     `position: absolute` on text content — an absolutely-positioned block doesn't grow its
     box, so overflowing text bleeds straight into the next grid row.
   - Never use negative margins on the widget root to fake full-bleed: the widget grid has no
     padding to offset, so they bleed into the adjacent rows. The grid is already edge-to-edge.
   - Never `cqh`/`min-height: Ncqh`: `.theme` is an inline-size container, so `cqh` falls back
     to viewport units on the public page but resolves against `.portfolio-canvas` in the
     editor — the two surfaces render different heights (WYSIWYG breach). Use `cqw`/`rem`
     clamps instead.
   - Internal multi-column grids: `repeat(auto-fit, minmax(Npx, 1fr))`, never a hardcoded
     column count; unconditional `grid-column: span 2` on children forces a phantom column
     into single-column layouts (guard spans behind an `@container (min-width: ...)`).

4. Record per widget in your notes: `sizes`, default footprint, and one line per variant
   describing what changes. This table goes into the widget folder as a comment block in the
   component file (the codebase's style is heavy top-of-file design comments, not separate
   READMEs).

---

## Phase 4 — extract the theme shell

1. Copy `packages/themes/_theme-template/` → `packages/themes/<theme-id>/`. Read the scaffold's
   comments in full; they are the authoring contract.
2. `manifest.json`: unique `id` (kebab-case), display `name`, honest `domainTags`,
   `defaultWidgetKeys` mapping every section this template ships to its bundled widget key
   (this still matters for cross-theme switching — when a user switches AN EXISTING portfolio to
   this theme, `normalizeWidgetsForTheme` in `apps/web/src/app/(app)/editor/EditorClient.tsx`
   appends this theme's default widget for any section the user lacks), `palettes` +
   `defaultPalette` from the reference's palette (start with one `"default"` palette; add
   alternates only if the reference has real variants), and `isPremium: true` with a
   placeholder `priceInPaise` — **flag the price to the user at the end; do not decide pricing.**
3. `palettes.ts`: the Phase 1 color inventory mapped onto the CSS-var roles.
4. Shell component: root element MUST be `<div className={"theme theme-<id>"}>` (the shared
   `.theme` class is the container-query root and background owner). Port nav (driven by
   `navGroups` → anchor links to `#portfolio-section-<key>`, following
   `AnimatedMotionComponent.tsx`), footer, ambient background (`position: absolute; inset: 0`
   inside the theme root — the animated-motion CSS documents why never `fixed`), fonts, and the
   scroll/reveal animation wrappers around `slots`.
5. Shell header: dormant-when-hero-widget-present rule from Phase 0.4.
6. CSS colocated at `packages/themes/<theme-id>/<theme-id>.css`, `@import`ed in
   `apps/web/src/app/globals.css` — **inside the top import block only** (CSS spec: all
   `@import` before any other rule; the block has a comment saying exactly this).
   All size-based rules `@container`; scale-with-portfolio values in `cqw`.
7. Register in `packages/themes/registry.ts`.

## Phase 5 — extract each widget

For each widget from the Phase 2 table:

1. Copy `packages/widgets/_widget-template/` → `packages/widgets/<widget-key>/`.
2. `manifest.json`: `key`, `label`, `section`, `configSchema` (every text knob the user should
   tweak that has no schema home — heading, eyebrow, CTA label...), `bundledWith: "<theme-id>"`,
   `sizes: [...]` from Phase 3, `lockedWidth: true` only if the legacy flag is genuinely the
   right constraint.
3. `index.tsx` (server-safe, no `"use client"`) + `<Name>Component.tsx` (`"use client"` if it
   uses hooks/EditableText — nearly always). Port the reference's JSX/animation for each
   designed variant. Inline editing: every user-visible text renders through `EditableText`
   with an `onCommit` that writes to the right home (`updateDraft` for profile/schema fields,
   `updateWidgetConfig(instanceKey, {...})` for config fields) — copy `about-animated`'s
   wiring.
4. Empty-data behavior per invariant 3: placeholders in editing mode
   (`useEditorMode().editing`), graceful hiding on the public page.
5. Colocated `<widget-key>.css`, imported in `globals.css`'s import block. Container-relative
   sizing throughout (invariants 5–7).
6. Register in `packages/widgets/registry.ts` (import + `register(...)` — duplicate keys throw
   at build time, which is your uniqueness check).

## Phase 6 — author the blueprint

`packages/themes/<theme-id>/blueprint.ts`, exported via the theme's `index.tsx` default export.

1. `navGroups`: one per nav link in the reference (`name` matching the reference's nav labels,
   `showInNav: true`), PLUS hidden **structural groups** (`showInNav: false`, e.g. "Intro",
   "Spotlight") for every widget the nav doesn't link to. Sequential `order` matching visual
   top-to-bottom order.
2. `widgets`: one entry per extracted widget, in reference top-to-bottom order:
   - `key`, sequential `order`, `visible: true`
   - **`groupId` on EVERY widget — no ungrouped widgets in a blueprint.** The Outline sidebar
     renders one mini-grid per group; an ungrouped widget whose stored rows interleave with
     grouped ones makes the "Ungrouped" bucket display phantom empty rows where the other
     groups' widgets live. Corollary: **widgets that share a grid row must share a group**
     (e.g. Awards ∥ Skills side by side), or the sidebar can't display the pairing at all.
   - **`grid`: the exact placement reproducing the reference** — `y` counts rows from 0 in the
     shared 2-column space, `h` is the Phase-3 measured native height in rows, and each next
     widget's `y` = previous `y + h` (multi-row spans consume rows — hero `y:0 h:2` puts about
     at `y:2`). Two half-width widgets side by side share a `y` with `x: 0` and `x: 1`. Sketch
     the whole grid (with spans) on paper first; `resolveGridLayout` resolves stored placements
     verbatim (only gap-filling is automatic), so what you write is what renders — in the
     preview AND as the sidebar card sizes/positions.
   - `config`: the reference's actual text/numbers for every configSchema field.
3. `profile` / `projects` / `experience` / `skills`: the reference's sample content mapped into
   the schema shapes (`packages/portfolio-schema/src/{profile,project,experience}.ts`). Images
   → `/templates/<theme-id>/...` per Phase 0.5.
4. Sanity-check the whole assembled object against `validatePortfolioData` in a quick script —
   a failing blueprint must not ship.

## Phase 7 — validate & verify

Static gates:
- `npm run validate:registries`
- `npx tsc --noEmit -p apps/web`

Runtime verification (Playwright against the dev server; the flow used across this codebase's
sessions: sign up a throwaway user via `/signup`, `POST /api/portfolios` with
`{"themeId": "<theme-id>"}`, open `/editor/<id>`):

1. **Reference match**: screenshot the editor preview (desktop 16:9 frame) and compare
   side-by-side with the Phase 1 reference screenshots. Same sections, same order, same
   proportions, same sample content. Not byte-identical — "a user would say it's the same
   design".
2. **Sidebar mirror + proportions**: assert each Outline sidebar card sits in the
   section/position/footprint the blueprint specifies, that card heights are proportional to
   the blueprint's `h` values (a `2x4` About card must be visibly taller than a `2x1` Contact
   card), that NO section shows phantom empty rows (each section's grid height ≈ its cards),
   and that the "Ungrouped" bucket is empty.
3. **Variants — mandatory, every footprint** (this catches the resize-overlap class of bug):
   for each widget, render every supported footprint and screenshot it. Scriptable approach:
   GET the portfolio, rewrite that widget's `grid` to the target footprint (moved to a clean
   bottom row so nothing collides), PATCH with `expectedVersion`, reload the editor — this
   exercises the exact `resolveGridLayout` lookup the widget uses. On every screenshot ALSO run
   a **bounding-rect overlap assertion**: no two `.theme-widget-grid-item`s may intersect by
   more than ~2px in both axes, and no item's first child (the widget itself) may extend
   outside its grid item's rect (catches negative-margin/absolute-position bleed). Confirm
   unsupported footprints are unreachable via the resize handle.
4. **Mobile frame**: toggle the editor's Desktop/Mobile switch; confirm single-column sanity
   and `document.documentElement.scrollWidth <= clientWidth` (no horizontal overflow) at
   ~390px.
5. **Publish**: publish and load `/{username}` at wide and ~390px viewports; confirm both look
   right and match the preview (WYSIWYG check), re-running the overlap assertion from step 3.
   When inspecting via SQL, note the DB row has `data` (draft, what the editor shows) AND
   `publishedData` (the snapshot the public page renders) — check/update the right one.
6. **Cursor widget** (if any): on the public page, move the mouse and confirm the effect tracks
   the real pointer with zero offset while scrolled to top AND scrolled mid-page (this is the
   containing-block regression test), and that its DOM node's parent is `document.body`.
7. **Cross-theme spot check**: switch the portfolio to `developer-minimal`; confirm the
   extracted widgets still render acceptably (invariant 2).
8. Report to the user: what was extracted (widget table), the price placeholder that needs a
   real value, and screenshots.

---

## Appendix — known gotchas (each of these caused a real bug in this repo)

- **`container-type: size` makes height content-independent** — a background on that element
  paints only the fixed height; content scrolls past it unpainted. Keep size containment on a
  background-less wrapper (`.portfolio-canvas`), never on `.theme`.
- **`contain: layout` (implied by any `container-type`) captures `position: fixed`
  descendants.** Portal them to `document.body` (SSR-guard with a `mounted` state).
- **Flexbox `min-width: auto`** stops items shrinking below content size; fix with
  `min-width: 0` (or the element's own `overflow: hidden`, which resets the automatic minimum).
- **`1fr` in grid = `minmax(auto, 1fr)`** — the `auto` floor causes blowout in tight parents;
  use `minmax(0, 1fr)` when the track must be compressible.
- **flex-wrap decides on flex-BASIS, before shrinking** — a large basis wraps far too early.
  Basis = the column's minimum; let `flex-grow` (ratioed like the old `fr` split) fill upward.
- **Zod convention**: new WidgetInstance/PortfolioData fields are `.optional()` (never
  `.default()`) so "absent" stays meaningful and old stored rows parse unchanged. No DB
  migration is ever needed for `data`-shape changes (`Json` column).
- **PATCH `/api/portfolios/[id]` requires `expectedVersion`** and 409s on mismatch — scripted
  edits must GET → mutate → PATCH with the fetched `version`.
- **`@import` placement**: all CSS imports in `globals.css` must stay in the single top block or
  they are silently ignored.
- **Widget `index.tsx` must stay server-safe** — a stray `"use client"` there breaks the
  registry from Server Components with a confusing error far from the cause.
- **Negative margins on a widget root bleed into adjacent grid rows.** The widget grid has no
  padding, so `margin: -1.5rem` doesn't reveal hidden gutter — it paints the widget on top of
  its neighbors. (There are also no `--spacing-*` CSS variables in this codebase; a
  `var(--spacing-md, 1.5rem)` fallback silently always used the fallback.)
- **`cqh` renders differently in the editor vs the public page.** `.theme` is an inline-size
  container (width axis only); `cqh` resolves against the editor-only `.portfolio-canvas`
  (`container-type: size`) in the editor but falls back to viewport units publicly. Only `cqw`
  and `rem` are WYSIWYG-safe for size clamps.
- **react-grid-layout `compactType` must stay `null` in the Outline sidebar.** RGL's vertical
  auto-compaction "fixes" any layout with row gaps on mount and fires `onLayoutChange`, which
  autosaves the rewritten positions — it silently corrupted stored blueprint placements before
  being disabled. `resolveGridLayout` is the single source of truth for placement.
- **Size strings parse by `split("x")`, never character index** — `Number(s[2])` reads `"2x10"`
  as height 1.
- **Two seeding sites** consume the blueprint (`POST /api/portfolios` and
  `/api/onboarding/complete`) and the public page renders `publishedData`, not `data` — verify
  all three when debugging "my blueprint change isn't showing".
- **Kill stale `.next` cache after workspace-package changes** (`rm -rf apps/web/.next` +
  restart dev server): the dev server can keep serving an old compiled copy of
  `packages/*` code — seeded data reflecting an old blueprint while `tsx` scripts show the new
  one is the signature of this.
