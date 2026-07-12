# MVP Architecture: AI-Assisted Portfolio Builder

Derived from [phased_architecture.md](phased_architecture.md) (Phase 0 section) and [problem_statement.md](problem_statement.md), with edge-case handling folded in from [edge_case.md](edge_case.md) (all **[P0]**-tagged items). This document scopes **only** what is required to ship the MVP.

**Explicitly excluded from this document** (see phased_architecture.md instead): Notion/Behance/Figma/LinkedIn integrations, expanded template/widget libraries, deeper analytics, disabled "Coming soon" UI affordances, feature flags for future phases, the Job Finder stub. None of that is built, stubbed, or reserved UI space in this MVP — it ships as a plain, complete product for what it does support, and Phase 1 is a separate future effort layered on afterward.

---

## 1. Scope

### 1.1 In scope
- Auth + onboarding quiz → theme recommendation.
- Optional resume upload → auto-fill profile/skills/experience.
- Template + widget editor (drag-and-drop, visibility toggle, live preview, curated palettes).
- One integration: **GitHub** (repo import).
- Public portfolio hosting at `username.domain.tld`.
- Dashboard: traffic totals + a completeness-based health score with tips.
- Payments: ₹50 one-time per premium template; one free default theme.
- Referral: ₹10 credit to both sides on a successful referred purchase.
- Hosting: Render free tier.

### 1.2 Out of scope
Everything under Phase 1 / v1.0 in phased_architecture.md. No UI element, nav item, or button for those features exists in this build.

---

## 2. System Architecture (MVP)

```
┌───────────────────────────────────────────────────┐
│                     Client (SPA)                    │
│      Onboarding · Editor · Dashboard                │
└───────────────┬───────────────────────┬─────────────┘
                │ REST/JSON             │ SSR render
┌───────────────▼──────────────┐  ┌─────▼─────────────┐
│           API Server           │  │ Portfolio Render   │
│ Auth · Users · Portfolios      │  │ Server (public,     │
│ Templates · Widgets · Payments │  │  no-auth routes)    │
│ Analytics · GitHub sync        │  └─────┬──────────────┘
└───────────────┬────────────────┘        │
                │                        │
        ┌───────▼────────┐      ┌────────▼────────┐
        │    Database      │      │  Object Storage  │
        │ users, portfolios,│      │ (images, resumes) │
        │ analytics_events, │      └──────────────────┘
        │ payments, referrals│
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  GitHub Sync    │   (only integration module in MVP)
        └────────────────┘
```

- **Editor path** (authenticated): edits `PortfolioData`, re-renders live using the same theme/widget components used in production — no preview-only component variants (closes the WYSIWYG gap called out in edge_case.md §3).
- **Public path** (unauthenticated): loads a user's `PortfolioData` + theme ID, server-renders it. Must validate against the schema before rendering and fall back to the last known-good published snapshot on corruption (edge_case.md §8).

---

## 3. Folder Structure (MVP only)

Same modularity principle as phased_architecture.md — themes and widgets are independently addable folders — but only the modules needed for launch exist; no Phase 1 placeholder folders.

```
/portfolioBuilder_v0.1
├── apps/
│   ├── web/                        # Editor, dashboard, onboarding, auth
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── onboarding/
│   │       │   ├── editor/
│   │       │   └── dashboard/
│   │       ├── components/         # app-shell UI only
│   │       └── lib/
│   └── render/                     # Public SSR portfolio renderer
│       └── src/
│           └── [username]/page.*
│
├── packages/
│   ├── themes/
│   │   ├── registry.ts             # id -> component map; validates unique ids at boot
│   │   ├── _theme-template/        # scaffold for adding a theme post-MVP
│   │   ├── developer-minimal/
│   │   ├── photographer-grid/
│   │   ├── architect-showcase/
│   │   └── writer-editorial/
│   │
│   ├── widgets/
│   │   ├── registry.ts             # key -> component map; unknown-key fallback
│   │   ├── _widget-template/
│   │   ├── about/
│   │   ├── skills/
│   │   ├── gallery/
│   │   └── experience-timeline/
│   │
│   ├── portfolio-schema/
│   │   └── index.ts                # PortfolioData contract + validator
│   │
│   ├── integrations/
│   │   ├── registry.ts             # source key -> { sync(), authUrl(), status }
│   │   └── github/                 # only implemented integration
│   │
│   └── ui-kit/                     # shared buttons, cards, toasts, error boundary
│
├── services/
│   ├── api/                        # auth, users, portfolios, payments, referrals, analytics ingest
│   └── jobs/                       # scheduled GitHub re-sync, analytics rollups
│
├── problem_statement.md
├── phased_architecture.md
├── edge_case.md
└── MVPphased_architecture.md
```

**Why keep the registry pattern even at MVP size:** it's what makes edge_case.md §2's failure modes (typo'd widget key, duplicate theme id, unknown module reference) resolvable with a defined fallback instead of a crash — this is a correctness requirement for the four themes/four widgets shipping now, not speculative future-proofing.

---

## 4. Data Model (MVP fields only)

```ts
// packages/portfolio-schema/index.ts
PortfolioData {
  profile: { name, headline, bio, photoUrl, domain, socialLinks[] }
  themeId: string
  palette: string
  widgets: Array<{ key: string; order: number; visible: boolean; config: object }>
  projects: Array<{ id, title, description, images[], links[], source: "manual" | "github" }>
  experience: Array<{ role, org, dates, description, source: "manual" }>
  skills: string[]
  integrations: { github?: { username, connectedAt, lastSyncedAt, status } }
  meta: { published: boolean, publishedAt, updatedAt, schemaVersion: 1 }
}
```

- `source` enums and `integrations` are intentionally limited to `"manual" | "github"` — no placeholder fields for unbuilt integrations.
- `schemaVersion` is recorded from day one purely so a future Phase 1 reader can detect old records; the render/edit path itself has no branch logic for other versions yet.
- Render/edit paths must validate every record against this schema before use and reject/fall back rather than trust unvalidated data (edge_case.md §8, §9).

---

## 5. Onboarding & Resume Parsing

**Build:**
- Quiz: role (student/professional), domain, goal → recommends from the 4 launch themes; user can override.
- Optional resume upload → parser pre-fills `profile`, `experience`, `skills` into editable fields only (never auto-published).

**Edge-case handling (from edge_case.md §1):**
- Quiz answers persist on abandonment; resuming logs back in where the user left off, not question 1.
- No domain match → falls back to a neutral default theme; onboarding never blocks on a missing match.
- Non-resume/corrupted/oversized (>size limit) uploads are rejected client- and server-side with a clear message; user can always skip to manual entry.
- Parser output is best-effort; empty extraction still proceeds to manual entry rather than erroring.
- Only fields the schema defines (name, headline, bio, experience, skills) are mapped from the resume — contact/address/ID-type PII is never auto-populated into a publicly rendered field.
- Re-running onboarding with an existing published portfolio requires explicit confirmation before overwrite; it is never silent.

---

## 6. Templates & Widget System

**Build:**
- 4 launch themes (`developer-minimal`, `photographer-grid`, `architect-showcase`, `writer-editorial`), each with a `manifest.json` (id, name, domain tags, supported widget slots, palette options).
- 4 widgets (`about`, `skills`, `gallery`, `experience-timeline`), each with a `manifest.json` (key, label, config schema).
- `themes/registry.ts` and `widgets/registry.ts` are the sole lookup points consumed by both the editor and the public render server.

**Edge-case handling (from edge_case.md §2):**
- Unknown widget slot referenced by a theme manifest → render server skips it and logs a warning, never crashes the page.
- Theme switch: widgets unsupported by the new theme are hidden, not deleted, so switching back restores them intact.
- Registry boot validates theme/widget id uniqueness and fails the build/deploy on a collision — never surfaces as a runtime bug for a real user.
- Every widget/theme mount is wrapped in an error boundary so one broken component doesn't blank the whole public page.
- Zero visible widgets still renders the profile/header; the health score (§9) flags this as a tip rather than the page going blank.
- An invalid/stale palette reference falls back to the theme's default palette rather than rendering broken CSS.

---

## 7. Editor (Drag-and-Drop, Live Preview, Publishing)

**Build:**
- Drag-and-drop widget reordering, visibility toggles, curated palette picker, live preview using production theme/widget components.
- Publish action writes the current `PortfolioData` as the live snapshot.

**Edge-case handling (from edge_case.md §3):**
- Reorder actions are optimistic; a failed save rolls back the UI and surfaces a retry/error toast rather than silently diverging from server state.
- Concurrent edits (two tabs/devices) are last-write-wins for MVP, but the editor detects a stale local version (timestamp/version check) and warns before overwriting newer server data.
- Publishing with empty required fields is still allowed (never blocks a first-time user) — gaps surface via the health score and a pre-publish nudge instead.
- Hiding a manually curated project/section never deletes its data; only integration-sourced content is subject to orphan-handling (§8).
- Image uploads are size/type-limited and compressed/resized server-side before storage.

---

## 8. GitHub Integration (only MVP integration)

**Build:**
- Connect via username or OAuth; fetch public repos (`/users/{username}/repos`) and profile (`/users/{username}`); user pins selected repos into `projects[]` with `source: "github"`.
- Scheduled sync job refreshes pinned repo data periodically.

**Edge-case handling (from edge_case.md §4):**
- Nonexistent/typo'd username → clear "User not found" error, no partial sync.
- Zero public repos → sync succeeds empty; editor prompts manual project entry instead of showing an error.
- Large repo counts are paginated in the fetch and picker UI, never loaded all at once.
- Rate-limit handling: prefer an authenticated server-side token; on limit, serve cached data with a "try again later" message rather than failing the whole sync.
- Revoked OAuth access leaves previously imported projects intact as static data; the next sync attempt fails gracefully and prompts reconnect rather than deleting anything.
- A pinned repo later deleted/renamed/made private is flagged in the editor ("source no longer available") instead of silently producing dead links on the public page.
- Missing repo description/README, or non-English content, falls back to the repo name only — never renders `null`/`undefined` as literal text.
- Scheduled re-sync must not clobber fields the user has manually edited on an imported project — track edited-per-field state and skip re-sync of touched fields.

---

## 9. Dashboard & Health Score

**Build:**
- Total views, unique visitors, a simple trend chart.
- Completeness-based health score with plain-language, itemized tips (e.g., "Add a bio", "Add 2 more projects").

**Edge-case handling (from edge_case.md §6):**
- Pre-publish/no-traffic state shows the documented "publish to see data" prompt, never an empty chart or a bare "0".
- Basic bot/crawler filtering is applied before counting unique visitors.
- Health score is additive per field, not a single gate — partial completeness yields partial credit and specific tips, never an all-or-nothing block.
- Analytics ingestion failures (blocked trackers, network blips) are silent to the visiting public — they never surface as a visible error on the public page.
- Deleting a project/widget preserves historical aggregate totals; it must not retroactively corrupt total traffic stats.
- On a high-traffic spike, ingestion writes are rate-limited and the public render is served from cache rather than risking downtime at the user's highest-value moment.

---

## 10. Payments & Referrals

**Build:**
- ₹50 one-time checkout per premium template; one free default theme requires no payment.
- Referral code/link; ₹10 credit to both referrer and referee triggered specifically on a successful referred purchase.

**Edge-case handling (from edge_case.md §7):**
- Payment success with a failed confirmation webhook is reconciled via a scheduled job/gateway status check; users are never charged without receiving the template, and a "paid but unfulfilled" state is visible for manual resolution.
- Checkout uses an idempotency key per attempt to prevent double-charging from a double-click.
- Existing ownership of a template is checked and blocks re-purchase before payment, not after.
- Referral credit issues only on the defined trigger (successful referred purchase) — never on signup alone.
- Self-referral (same account/payment method) is blocked as a basic abuse guard.
- Applied referral credit is capped at the template price; no negative charges, and any leftover credit balance is clearly shown.
- The free default theme remains usable with zero dependency on payment infrastructure being available, so a gateway outage never blocks the core "publish a portfolio" flow.

---

## 11. Public Render Path & Hosting

**Build:**
- SSR render of `username.domain.tld` from `PortfolioData` + theme registry.
- Hosted on Render's free tier for the initial ~50–65 users.

**Edge-case handling (from edge_case.md §8):**
- A blocklist of reserved/system usernames (e.g., `admin`, `api`, `www`) is enforced at signup, before account creation.
- Username changes either redirect from the old URL for a grace period or clearly warn the user that old shared links will break — never a silent 404.
- Free-tier cold starts show a spinner/skeleton loading state, never a blank page.
- Render server validates `PortfolioData` against the schema before rendering; on validation failure, it serves the last known-good published snapshot instead of crashing.
- Uploaded images are served via object storage with cache headers to limit hotlinking/bandwidth impact on the free tier.
- Visiting a non-existent/deleted username shows a clean branded 404 with a CTA to create a portfolio, not a raw server error.

---

## 12. Security & Privacy Baseline

**Edge-case handling (from edge_case.md §10, MVP-relevant items only):**
- The GitHub OAuth token is encrypted at rest and never exposed to the client bundle or the public render path.
- GitHub sync explicitly filters to public/user-approved repos only — default-deny on ambiguous visibility, never default-allow.
- Uploaded resumes in object storage are access-controlled to the owning user (and admin), not publicly readable by guessing a URL.
- Signup and referral-redemption endpoints have basic rate limiting/bot protection, independent of the payment-specific abuse guard in §10.

---

## 13. Definition of Done for MVP

- A new user can complete onboarding, optionally upload a resume, pick/customize a theme with the 4 available widgets, connect GitHub and pin projects, and publish a live portfolio at their own URL — entirely without hitting a dead button, blank error page, or silent data loss, per the edge cases enumerated above.
- The dashboard shows real traffic and a health score once published.
- A premium template can be purchased for ₹50 and a referral can be redeemed for ₹10 credit on both sides, with no double-charge, no self-referral abuse, and no unfulfilled-payment dead end.
- The whole system runs on Render's free tier for the initial user cohort without requiring any Phase 1/v1.0 code, folders, or UI to exist.
