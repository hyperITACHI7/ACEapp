# Phased Architecture: AI-Assisted Portfolio Builder

Companion to [problem_statement.md](problem_statement.md). This document defines **what gets built when**, and the **module boundaries** that let later phases slot in without rewriting earlier ones.

Guiding rule: **every deferred feature still gets its UI slot now** (nav item, card, toggle, button) — rendered visibly but `disabled` with a "Coming soon" affordance — so the product feels complete and phases ship as unlocks, not redesigns.

---

## 1. Phasing Summary

| Phase | Scope | Status in UI |
|---|---|---|
| **MVP (Phase 0)** | Onboarding, 3–5 templates, widget system, GitHub integration, drag-and-drop editor, basic dashboard (traffic + health score), ₹50 template payment, referral credit | Fully functional |
| **Phase 1 (post-MVP)** | Notion, Behance, Figma integrations; LinkedIn public-URL fallback; expanded template/widget library; deeper analytics (engagement, traffic sources) | UI visible, buttons **disabled** with "Coming soon" |
| **v1.0** | Automated Job Finder: job scraping, keyword matching, AI resume/cover-letter generation, apply flow | UI stubbed only (e.g. single disabled nav item), no backend |

A feature not yet built is never *hidden* — it's *disabled* — so users see the product roadmap and we validate demand by tracking clicks on disabled elements (a proto-analytics signal for prioritizing Phase 1 order).

---

## 2. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           Client (SPA)                          │
│  Onboarding · Editor · Dashboard · Public Portfolio Renderer     │
└───────────────┬───────────────────────────────┬─────────────────┘
                │ REST/JSON                     │ SSR/static render
┌───────────────▼───────────────┐   ┌───────────▼───────────────┐
│           API Server           │   │   Portfolio Render Server  │
│  Auth · Users · Portfolios     │   │  theme + widget injection  │
│  Templates · Widgets · Payments│   │  (public, no-auth routes)  │
│  Analytics · Integrations      │   └───────────┬───────────────┘
└───────────────┬────────────────┘               │
                │                                │
        ┌───────▼────────┐              ┌────────▼────────┐
        │   Database      │              │  Object Storage  │
        │ users, portfolios,│            │  (images, resumes,│
        │ templates, widgets,│           │   exported assets)│
        │ analytics_events, │            └──────────────────┘
        │ payments, referrals│
        └───────┬────────┘
                │
     ┌──────────▼───────────┐
     │  Integrations Layer   │   (MVP: GitHub only; Phase 1 adds the rest)
     │  github/  notion/     │
     │  behance/ figma/      │
     │  linkedin/            │
     └───────────────────────┘
```

Two render paths matter architecturally:
- **Editor path** (authenticated): user edits the JSON portfolio record; client re-renders live using the same theme components as production.
- **Public path** (unauthenticated): anyone visiting `username.domain.tld` hits the render server, which loads the user's portfolio JSON + selected theme ID and server-renders it. This path must stay fast and cheap since it's the highest-traffic, credential-free surface.

---

## 3. Repository / Folder Structure

The core requirement driving this layout: **themes and widgets are independently addable** without touching editor, dashboard, or integration code.

```
/portfolioBuilder_v0.1
├── apps/
│   ├── web/                        # Editor, dashboard, onboarding, auth (authenticated SPA)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── onboarding/
│   │   │   │   ├── editor/
│   │   │   │   ├── dashboard/
│   │   │   │   └── settings/
│   │   │   ├── components/         # app-shell UI only, NOT theme/widget UI
│   │   │   └── lib/
│   │   └── ...
│   └── render/                     # Public, unauthenticated portfolio renderer (SSR)
│       └── src/
│           └── [username]/page.*   # loads portfolio JSON + theme, renders
│
├── packages/
│   ├── themes/                     # ← ALL templates live here, one folder per theme
│   │   ├── registry.ts             # theme ID -> component map (single source of truth)
│   │   ├── _theme-template/        # scaffold: copy this to add a new theme
│   │   │   ├── manifest.json       # id, name, domain tags, palette options, default widget slots
│   │   │   ├── index.tsx           # layout shell; consumes PortfolioData + widget slots
│   │   │   └── palettes.ts
│   │   ├── developer-minimal/
│   │   │   ├── manifest.json
│   │   │   ├── index.tsx
│   │   │   └── palettes.ts
│   │   ├── photographer-grid/
│   │   ├── architect-showcase/
│   │   └── writer-editorial/
│   │
│   ├── widgets/                    # ← ALL widgets live here, one folder per widget
│   │   ├── registry.ts             # widget key -> component map
│   │   ├── _widget-template/       # scaffold: copy this to add a new widget
│   │   │   ├── manifest.json       # key, label, domain relevance tags, config schema
│   │   │   └── index.tsx
│   │   ├── about/
│   │   ├── skills/
│   │   ├── gallery/
│   │   ├── experience-timeline/
│   │   ├── testimonials/           # Phase 1
│   │   ├── blog-feed/              # Phase 1
│   │   └── figma-embed/            # Phase 1 (ships disabled until Figma integration lands)
│   │
│   ├── portfolio-schema/           # shared TS types + JSON schema for PortfolioData
│   │   └── index.ts                # single contract themes + widgets + editor + API all import
│   │
│   ├── integrations/                # one subfolder per external source, common interface
│   │   ├── registry.ts             # source key -> { sync(), authUrl(), status }
│   │   ├── github/                 # MVP
│   │   ├── notion/                 # Phase 1 (disabled)
│   │   ├── behance/                # Phase 1 (disabled)
│   │   ├── figma/                  # Phase 1 (disabled)
│   │   ├── linkedin/               # Phase 1, fallback-only (disabled)
│   │   └── job-finder/             # v1.0 stub only, no implementation
│   │
│   └── ui-kit/                     # shared buttons, disabled-state components, cards, badges
│       └── DisabledFeature.tsx     # standard "Coming soon" wrapper used everywhere
│
├── services/
│   ├── api/                        # auth, users, portfolios, payments, referrals, analytics ingest
│   └── jobs/                       # scheduled sync jobs (integration refresh), analytics rollups
│
├── problem_statement.md
└── phased_architecture.md
```

**Why this shape works:**
- Adding theme #6 = new folder under `themes/`, register it in `registry.ts`, no other file touched.
- Adding widget #9 = new folder under `widgets/`, register it, done. Themes declare which widget *slots* they support by key, not by import.
- Adding integration #6 = new folder under `integrations/`, implements a common `sync()`/`authUrl()` interface, registered once.
- `portfolio-schema` is the contract everyone consumes — themes, widgets, editor, and API all read/write the same shape, so no module needs to know about another's internals.

---

## 4. Data Model (shared contract)

```ts
// packages/portfolio-schema/index.ts (illustrative shape, not final field list)
PortfolioData {
  profile: { name, headline, bio, photoUrl, domain, socialLinks[] }
  themeId: string
  palette: string
  widgets: Array<{ key: string; order: number; visible: boolean; config: object }>
  projects: Array<{ id, title, description, images[], links[], source: "manual"|"github"|"notion"|"behance"|"figma" }>
  experience: Array<{ role, org, dates, description, source: "manual"|"linkedin" }>
  skills: string[]
  integrations: { github?: {...}, notion?: {...}, behance?: {...}, figma?: {...}, linkedin?: {...} }
  meta: { published: boolean, publishedAt, updatedAt }
}
```

This schema is versioned from day one (even though MVP only fills `github` under `integrations`) so Phase 1 integrations extend the object without a migration that breaks MVP data.

---

## 5. Phase 0 — MVP

### 5.1 Scope
- Auth + onboarding quiz (role, domain, goal) → recommend 2–3 of the ~4–5 launch themes.
- Resume upload → parse → pre-fill `profile`, `experience`, `skills` (editable after).
- Editor: drag-and-drop widget reordering, visibility toggle, live preview, palette picker (curated per theme).
- **GitHub integration only**: OAuth or username-based public fetch of repos, user pins repos → `projects[]` with `source: "github"`.
- Public render path: fast SSR of `username.domain.tld` using `themes/registry.ts`.
- Dashboard: total views, unique visitors, simple trend chart, portfolio health score (completeness-based), plain-language tips.
- Payments: ₹50 one-time per premium template checkout flow; free default theme available without payment.
- Referral: generate referral code/link, ₹10 credit to both sides on a successful referred purchase.
- Hosting: Render free tier.

### 5.2 UI elements that exist now but are disabled
These render in the **real** UI (not mocked separately) so the product feels whole, wrapped in the shared `DisabledFeature` component with a tooltip/badge ("Coming soon") and click tracked as a demand signal:

| Location | Element | State |
|---|---|---|
| Integrations panel | Notion, Behance, Figma connect buttons | Disabled, "Coming soon" |
| Integrations panel | LinkedIn "Import from LinkedIn" button | Disabled, "Coming soon" (fallback text-entry remains enabled instead — see 6.1) |
| Widget library | Testimonials, Blog Feed, Figma Embed widget cards | Disabled/greyed, not draggable |
| Dashboard | Traffic-source breakdown chart, "Top projects by engagement" panel | Disabled/blurred with "Unlocks in Phase 1" |
| Template gallery | Extra theme thumbnails beyond the launch set (marked "Phase 1") | Visible, disabled "Use this template" button |
| Main nav | "Job Finder" nav item | Disabled, "Coming in v1.0" |

---

## 6. Phase 1 — Post-MVP Expansion

### 6.1 Scope (enable, don't rebuild)
- **Notion**: OAuth/token connect → sync selected database into `projects[]`/blog entries. Scheduled re-sync job.
- **Behance**: server-side fetch + cache layer (respecting rate limits) → `projects[]` with `source: "behance"`.
- **Figma**: user pastes embed link → rendered via `widgets/figma-embed`; optional public-file image pull.
- **LinkedIn**: ship the **public-profile-URL fallback first** (lighter-weight, no app approval needed) since full OAuth API access is gated; flip to real OAuth import later behind the same disabled button from Phase 0 without UI rework.
- Expanded template gallery (beyond the curated MVP set) — same `themes/` folder mechanism, no editor changes needed.
- Deeper dashboard: traffic sources, engagement/top-project data, SEO-style checks added to the health score.

### 6.2 What flips from disabled → enabled
Because Phase 0 already renders these elements, Phase 1 work is: implement the `integrations/<source>` module against the common interface, implement the widget/theme folder, then remove the `disabled` prop from the corresponding `DisabledFeature` wrapper. No navigation, layout, or editor rework required — this is the payoff of building the UI slots early.

---

## 7. v1.0 — Automated Job Finder

### 7.1 Scope
- Job listing ingestion (scrape/match against user skills, domain, keywords from `PortfolioData`).
- Keyword-matched resume/cover-letter generation per listing.
- Apply flow: user-reviewed submission first; potential auto-submit later.

### 7.2 Current footprint (intentionally minimal)
- A single disabled nav entry ("Job Finder — coming in v1.0") plus a `packages/integrations/job-finder/` stub folder with only a manifest describing the intended interface — no implementation, no data model commitments beyond what `PortfolioData` (skills, experience, projects) already provides.
- Explicitly **not** designed further until Phase 1 integrations are live and the portfolio data model has proven stable in production.

---

## 8. Cross-Cutting Concerns

- **Feature flags**: every Phase 1/v1.0 module is gated by a config flag (`FEATURES.notion`, `FEATURES.behance`, `FEATURES.jobFinder`, ...) read by both the disabled-UI wrapper and the API, so enabling a feature is a flag flip + deploy, not a code hunt.
- **Registries over conditionals**: `themes/registry.ts`, `widgets/registry.ts`, `integrations/registry.ts` are the only files that "know about" every module — everything else looks modules up by key. This is what keeps adding phase-1 content from touching MVP code.
- **Analytics on disabled elements**: clicks on disabled buttons are logged (source: which integration/template/widget) to prioritize actual Phase 1 build order using real demand rather than guesswork.
- **Schema versioning**: `portfolio-schema` changes are additive only across phases; nothing in Phase 1 or v1.0 may require a breaking migration of MVP portfolio data.

---

## 9. Open Questions Carried From problem_statement.md

- Notion vs. Behance — which ships first in Phase 1 — should be decided using the disabled-button click analytics described in §8, not upfront guessing.
- Health score field weights (§5.5 of problem statement) need defining before MVP dashboard ships, independent of phasing.
- Render free-tier upgrade threshold should be monitored via basic infra metrics once Phase 0 is live with real users.
