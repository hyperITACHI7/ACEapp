# Edge Cases: AI-Assisted Portfolio Builder

Companion to [problem_statement.md](problem_statement.md) and [phased_architecture.md](phased_architecture.md). This document enumerates edge cases per functional area, tagged by phase, with the expected system behavior. Anything not explicitly handled here should default to **fail safe, don't fail silent** — surface a clear message to the user rather than a broken page or a silently stale portfolio.

Legend: **[P0]** MVP · **[P1]** Post-MVP · **[v1]** v1.0 (design-only, not built)

---

## 1. Onboarding & Resume Parsing [P0]

| Edge Case | Expected Behavior |
|---|---|
| User abandons onboarding quiz mid-way | Persist partial answers; resume onboarding on next login rather than restarting from question 1. |
| User's domain doesn't map cleanly to any curated theme (e.g., "veterinarian" for a dev/design-focused template set) | Fall back to a neutral/general-purpose default theme rather than showing no recommendation; never block progress on a domain match. |
| Resume upload is not a resume (random PDF/image, corrupted file, wrong file type) | Reject with a clear error ("Couldn't read this as a resume") and let the user skip straight to manual entry — never crash the onboarding flow. |
| Resume parser mis-extracts fields (wrong name, garbled dates, merged sections) | All parsed fields land in *editable* form fields, pre-filled but never auto-published; user must confirm/edit before publishing. |
| Resume contains no extractable skills/experience (e.g., a one-line resume, non-English resume, scanned image with no OCR) | Parser returns whatever it found (possibly empty); onboarding proceeds to manual entry for missing sections instead of erroring out. |
| User uploads a resume containing sensitive data not meant for a public portfolio (address, phone, SSN/national ID) | Only map fields the schema expects (name, headline, bio, experience, skills); never auto-populate personal-contact fields into `profile` that would be publicly rendered without explicit user opt-in. |
| Very large resume file (10+ MB scan) | Enforce a max upload size client-side and server-side with a clear rejection message, not a silent timeout. |
| User re-runs onboarding after already having a published portfolio | Onboarding re-entry must not silently overwrite an existing live `PortfolioData` — treat it as "start a new portfolio" or explicitly confirm overwrite. |

---

## 2. Templates & Widgets (Modularity Boundary) [P0/P1]

Per §3/§6 of phased_architecture.md, themes and widgets are independently addable folders — these edge cases exist specifically at that seam.

| Edge Case | Expected Behavior |
|---|---|
| Theme's `manifest.json` declares a widget slot for a widget key that doesn't exist in `widgets/registry.ts` (e.g., typo, or widget removed) | Render server must skip the unknown slot gracefully (log a warning) rather than crashing the whole portfolio page. |
| User's `PortfolioData.widgets[]` references a widget key that Phase 1 later deprecates/renames | `widgets/registry.ts` lookups must resolve to a documented fallback ("widget unavailable" placeholder in editor, simply omitted in public render) — never a hard error on someone else's already-published portfolio. |
| User switches themes after populating widgets/config specific to the old theme (e.g., a widget's config schema differs slightly between themes) | Widget `config` objects are keyed generically in the shared schema; on theme switch, unsupported widgets for the new theme are hidden (not deleted) so switching back restores them. |
| A new theme is added whose default widget slots don't include widgets the user already has enabled from a previous theme | Widgets not supported by the newly selected theme move to a "disabled for this theme" state in the editor, data preserved, nothing is silently dropped. |
| Two themes accidentally register the same `id` in `registry.ts` (copy-paste from `_theme-template` without renaming) | Registry load must validate uniqueness at build/boot time and fail the build/deploy, not fail at runtime for a random user. |
| Widget/theme component throws at render time (bad prop, null data) | Render server wraps each widget/theme mount in an error boundary so one broken widget doesn't blank the entire public portfolio page. |
| User has zero widgets enabled/visible | Public portfolio still renders (profile/header at minimum) rather than showing a blank page; dashboard health score flags this as an actionable tip. |
| Palette selected by user isn't in the curated list for the currently selected theme (stale reference after a theme's palette set changes) | Fall back to that theme's default palette rather than rendering broken/undefined CSS values. |

---

## 3. Editor (Drag-and-Drop, Live Preview, Publishing) [P0]

| Edge Case | Expected Behavior |
|---|---|
| User drags a widget but network/save fails mid-action | Optimistic UI shows the reorder immediately; on save failure, roll back visually and show a retry/error toast — never leave editor state and saved state silently diverged. |
| Two browser tabs/devices editing the same portfolio simultaneously | Last-write-wins is acceptable for MVP, but the editor should detect a stale local copy (e.g., version/timestamp mismatch) and warn before overwriting newer server data. |
| User publishes a portfolio with required fields empty (no name, no projects at all) | Publishing should still be *allowed* (avoid blocking a first-time user), but the health score and a pre-publish nudge should flag the gaps rather than silently publishing an empty page. |
| User toggles a project/section to hidden, then deletes the underlying source content (e.g., unpins a GitHub repo that a hidden project pointed to) | Hidden ≠ deleted for manually curated data, but content sourced from an integration should be safely dropped/orphan-handled if the source disappears (see §5). |
| Live preview and public render diverge (preview uses client-side render, production uses SSR) | Both paths must consume the exact same theme/widget components from the shared registries — no preview-only component variants — to guarantee WYSIWYG. |
| User uploads an image far larger than needed (20MB photo for a thumbnail) | Enforce size/type limits and compress/resize server-side before storage; reject silently-huge uploads rather than blowing up storage costs on Render's free tier. |

---

## 4. GitHub Integration (MVP's only live integration) [P0]

| Edge Case | Expected Behavior |
|---|---|
| GitHub username entered doesn't exist / typo | Clear "User not found" error, no crash, no partial sync. |
| GitHub account has zero public repos | Sync succeeds with an empty list; editor shows "No repos found — add projects manually" rather than an error state. |
| GitHub account has hundreds of repos | Paginate the API fetch; don't attempt to load/display all at once in the picker UI. |
| GitHub API rate limit hit (unauthenticated calls are limited per IP) | Server-side calls should use an authenticated token where possible; on rate-limit, show a "try again later" message and serve cached data if available rather than failing the whole sync. |
| User revokes GitHub OAuth access after already importing repos as projects | Previously imported projects (`source: "github"`) remain in `PortfolioData` as static data; next sync attempt fails gracefully and prompts reconnect, it does not retroactively delete existing projects. |
| A pinned repo is later deleted, renamed, or made private on GitHub | Scheduled sync job detects the repo is no longer accessible and flags it in the editor (e.g., "This project's source is no longer available") rather than silently breaking the public portfolio with dead links. |
| GitHub repo has no description, no README, or a non-English README | Fall back to repo name only; never leave a `null`/`undefined` rendering as literal text in the public UI. |
| Scheduled sync job runs while user is actively editing that same project's manually-overridden fields (e.g., user rewrote the auto-fetched description) | User manual edits to an imported project must not be silently clobbered by the next scheduled sync — track "manually edited" per field, or per project, and skip re-sync of touched fields. |

---

## 5. Phase 1 Integrations (Notion, Behance, Figma, LinkedIn) [P1 — design now, build later]

| Edge Case | Expected Behavior |
|---|---|
| User clicks a **disabled** Notion/Behance/Figma/LinkedIn button in the MVP UI | Click is logged for demand-signal analytics (per phased_architecture.md §8) and shows a "Coming soon" tooltip; must never trigger a broken auth flow or dead API call. |
| Behance API rate limit exceeded during a sync (server-side, but still capped) | Serve last cached snapshot with a "last synced at" timestamp rather than blocking the page or showing stale data as if it were fresh. |
| Figma embed link pasted by user is invalid, private, or later deleted from Figma | Widget renders a graceful "embed unavailable" placeholder instead of a broken iframe; validate the link format at input time to catch obvious mistakes early. |
| LinkedIn public-profile-URL fallback: user pastes a URL that isn't a valid LinkedIn profile, or the profile is private | Validate URL pattern client-side; if scraping/parsing fails server-side, fall back to manual entry rather than blocking the experience-import step. |
| LinkedIn later grants full OAuth API access (flag flip per phased_architecture.md §6.1) mid-way through a user's session using the fallback | Both data paths must write into the same `experience[]` schema shape with `source: "linkedin"` so switching mechanisms later doesn't require a data migration or duplicate entries. |
| Notion database schema the user connects doesn't match expected structure (missing title/date properties) | Sync should map best-effort and flag unmapped required fields in the editor for manual completion, not fail the entire sync. |
| A user disconnects an integration (Notion/Behance/GitHub) entirely | Previously imported content stays in `PortfolioData` as static/manual-equivalent data (no dangling references to a dead connection); the editor clearly shows integration status as "disconnected." |

---

## 6. Dashboard, Analytics & Health Score [P0/P1]

| Edge Case | Expected Behavior |
|---|---|
| User views dashboard before publishing / before any traffic exists | Show the documented empty state (prompt to publish) — never an empty chart or a "0" that reads as a bug. |
| Traffic spike from bots/crawlers inflates view counts | Basic bot filtering (known crawler user-agents) should be applied before counting "unique visitors," even at MVP scale, to avoid misleading health-score-adjacent metrics. |
| Health score fields (per open question in problem_statement.md §8) — user has content but in unexpected combinations (e.g., 10 projects, zero bio) | Score/tips must be per-field additive, not a single blocking gate — partial completeness still yields partial credit and specific, itemized tips. |
| Analytics event ingestion fails/drops (network blip from a visitor's browser, ad blockers blocking the tracking call) | Undercounting is acceptable and expected (industry norm); the system must not error visibly to the *visitor* — tracking failures are silent to the public page. |
| User deletes a project/widget that had historical analytics tied to it | Historical aggregate numbers (total views) should persist even if a per-project drill-down source is gone; don't let deleting content retroactively corrupt total traffic stats. |
| Disabled Phase 1 dashboard panels (traffic sources, engagement) shown blurred/locked | Must not attempt to fetch or compute real data behind the blur for MVP — this is a static locked state, not a partially-working feature. |
| Very high-traffic portfolio at free-hosting scale (viral repo/project) | Analytics ingestion and the public render path must degrade gracefully (rate-limit ingestion writes, serve cached renders) rather than taking down the user's page during their highest-value moment. |

---

## 7. Payments (₹50 template purchase) & Referrals [P0]

| Edge Case | Expected Behavior |
|---|---|
| Payment succeeds on the payment gateway side but the confirmation webhook/callback fails to reach the app (network blip, server restart) | Reconcile via a scheduled job or gateway status check — user must not be charged without receiving the template, and support/admin must be able to see "paid but unfulfilled" states to resolve manually. |
| User double-clicks "Buy" and triggers two payment attempts for the same template | Idempotency key per checkout attempt; never double-charge for the same template. |
| User already owns a template and somehow re-enters its checkout flow | Detect existing ownership and block/redirect before payment, not after. |
| Referral code used by the referred user, but the "successful purchase" that triggers the credit never happens (referee signs up but never buys a template) | No credit is issued until the defined trigger condition (successful referred purchase, per problem_statement.md §5.6) actually completes — no crediting on signup alone. |
| User tries to refer themselves (same account, alt email, self-referral abuse) | Basic abuse guard: referral code cannot be redeemed by the same underlying user/account/payment method that generated it. |
| Referral credit (₹10) exceeds the price of the next template the user wants (template is free, or credit stacking across multiple referrals) | Cap applied credit at the template price (no negative charges/payouts); clearly show remaining credit balance if any is left over. |
| Currency/payment gateway outage or unsupported region | Free default theme remains fully usable without payment so the core "publish a portfolio" flow never depends on payment infra being up. |

---

## 8. Public Render Path & Hosting Scale [P0]

| Edge Case | Expected Behavior |
|---|---|
| Username collision or reserved word used as a username (e.g., "admin", "api", "www") | Reserve a blocklist of system/route-conflicting usernames at signup; reject before account creation. |
| User changes their username after sharing their old portfolio URL widely | Either support a redirect from the old URL for a grace period, or clearly warn at rename time that old links will break — must not be a silent 404 with no explanation. |
| Render free-tier cold start causes a visible delay on first load after idle | Acceptable at MVP scale per phased_architecture.md, but the loading state must show a spinner/skeleton, not a blank white page that looks broken. |
| Portfolio JSON record is corrupted or partially written (e.g., a failed save left inconsistent widget order data) | Render server validates against `portfolio-schema` before rendering; on validation failure, serve the last known-good published snapshot rather than a crashed page. |
| User's uploaded images are hotlinked/scraped heavily by third parties, inflating bandwidth on the free tier | Basic image serving via object storage with reasonable cache headers; monitor bandwidth per the open question in phased_architecture.md §9 for when to upgrade tiers. |
| Non-existent username visited (typo, never signed up, or deleted account) | Clean, branded 404 — not a raw server error — ideally with a CTA to create your own portfolio. |

---

## 9. Cross-Cutting: Feature Flags, Schema Versioning, Disabled UI [P0/P1/v1]

| Edge Case | Expected Behavior |
|---|---|
| A Phase 1 feature flag is flipped on in production before its backend module is fully deployed (race between flag and deploy) | Flags should gate both UI *and* API; API must independently reject/no-op unimplemented feature calls even if a UI flag is mistakenly enabled early. |
| Old `PortfolioData` records (saved under an earlier schema version) are loaded after a Phase 1 additive schema change | Schema reads must tolerate missing new-in-Phase-1 fields (default to empty/undefined-safe values) — per phased_architecture.md §8, changes are additive-only, so old records must remain valid without migration. |
| User's browser has an old cached version of the editor referencing a widget/theme key that was since renamed or removed from the registry | Registry lookups return a defined "unknown module" fallback (never `undefined` crashing a render) both in editor and public paths. |
| Disabled-element click analytics (§8 of phased_architecture.md) accumulate but are never reviewed | Not a system failure mode, but a process risk — worth flagging as an operational follow-up so the demand-signal data actually informs Phase 1 prioritization rather than sitting unused. |
| A v1.0 "Job Finder" stub folder accidentally gets real logic added prematurely, coupling it to unstable Phase 1 integration data | Per phased_architecture.md §7.2, job-finder must stay a manifest-only stub until Phase 1 integrations are proven stable — treat any premature implementation attempt as a scope violation to flag, not silently merge.

---

## 10. Security & Privacy (cuts across all phases)

| Edge Case | Expected Behavior |
|---|---|
| OAuth tokens (GitHub now; Notion/Figma/LinkedIn later) stored at rest | Encrypt tokens at rest; never expose them to the client bundle or public render path. |
| Public portfolio accidentally exposes data not meant to be public (e.g., private GitHub repo slipping into a sync before a permissions check) | Integration sync modules must explicitly filter to public/user-approved content only — default-deny on ambiguous visibility, not default-allow. |
| Resume file storage (contains PII beyond what's rendered publicly) | Uploaded resumes in object storage should not be publicly readable by URL guessing; access-controlled to the owning user/admin only. |
| Referral/payment abuse via scripted signups | Basic rate limiting / bot protection on signup and referral redemption endpoints, independent of the payment-specific abuse guard in §7. |

---

## 11. Explicitly Deferred (not designed further per phased_architecture.md scope)

- Full auto-apply job submission failure modes (v1.0) — not designed until the Job Finder feature itself is scoped.
- Multi-region hosting failover — out of scope while on Render's single free-tier instance for the initial ~50–65 users.
- Custom domain DNS edge cases — out of scope per problem_statement.md §4 Non-Goals.
