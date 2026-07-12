# Problem Statement: AI-Assisted Portfolio Builder

## 1. Overview

Job seekers, freelancers, and creative/technical professionals need an online portfolio to showcase their work, but existing solutions force a tradeoff between **ease of use** and **cost/ownership**, and none of them solve the deeper problem: **keeping a portfolio up to date and turning it into job/client outcomes**.

This project builds a portfolio builder that:
- Lets a user go from zero to a published, professional portfolio in minutes via guided onboarding and templates.
- Pulls existing work automatically from platforms the user already uses (GitHub, Notion, Behance, Figma, LinkedIn) instead of requiring manual re-entry.
- Gives the user an analytics dashboard with actionable, plain-language suggestions instead of raw traffic numbers.
- Uses a one-time micro-payment model (₹50/template) instead of recurring subscriptions.
- Is architected so that new templates and integrations can be added without per-user code changes.

The long-term vision (v1.0, out of scope for MVP) is to close the loop from "portfolio" to "job offer" via an automated job-matching and resume-tailoring feature.

---

## 2. Problem

### 2.1 For the end user (job seeker / freelancer)
- Building a portfolio site from scratch requires design and frontend skills most users don't have.
- Existing no-code builders (Wix, Squarespace, Carbonmade, Crevado) are powerful but **expensive** (~$12–17/mo, ~₹800+/mo) for something a user may update only a few times a year.
- Manually keeping a portfolio in sync with new GitHub repos, design work, or job changes is tedious, so portfolios go stale within months.
- Generic templates don't adapt to the user's domain (a photographer and a backend engineer need very different layouts and widgets).
- Once published, users have no visibility into whether the portfolio is actually working — no traffic data, no idea what to fix.

### 2.2 For the business
- Subscription pricing creates friction for a market (students, early-career professionals, freelancers in price-sensitive regions) that wants to pay small amounts on their own schedule, not commit to a monthly bill.
- Competing head-on with Wix/Squarespace on template breadth is not viable for an MVP; differentiation must come from **integrations, automation, and pricing model**, not template count.

---

## 3. Competitive Landscape (Research Summary)

| Trend | Examples | Takeaway |
|---|---|---|
| Drag-and-drop, no-code editing | Carbonmade, Crevado | Table stakes — users expect zero-code customization. |
| Responsive, pre-designed, niche themes | Crevado, Cr8 AI (32 themes) | Themes should be domain-specific (photographer, developer, architect), not one-size-fits-all. |
| Built-in analytics | Cr8 AI, Wix Analytics | Recommendation engines ("tailored recommendations to improve your site") outperform raw metrics dumps. |
| Pricing | Wix/Squarespace ($12–17/mo), ThemeForest ($10–50/theme), SitesPlaced (free + ₹199/mo for custom domain) | Recurring billing dominates; one-time micro-payment (₹50/template) is a genuine differentiator if hosting cost stays low. |
| Referral programs | RealtyNinja ("Give 10%, Get 10%") | Two-sided referral discounts are a proven, low-cost acquisition model — mirrors our planned ₹10-off-both-sides referral. |

**Conclusion:** Compete on integrations + automation + pricing, not on template catalog size.

---

## 4. Goals & Non-Goals (MVP)

### Goals
1. Ship a working portfolio builder for ~50–65 initial users on free-tier hosting (Render).
2. Support a small, curated set of domain-specific templates (not 30+).
3. Support at least one "auto-fill" integration end-to-end (GitHub first, others as stretch).
4. Ship a dashboard with basic traffic metrics + a "portfolio health score" with actionable tips.
5. Implement the ₹50-per-template one-time payment flow and the referral discount mechanic.
6. Architect templates/widgets so a new theme or integration doesn't require touching per-user code.

### Non-Goals (explicitly out of scope for MVP)
- Full LinkedIn API integration (gated approval process) — start with public-profile-URL based fallback.
- Automated job scraping / resume tailoring / auto-apply (this is the planned **v1.0** feature, tracked separately).
- Large template marketplace (30+ themes) — MVP ships a small curated set.
- Custom domains / advanced SEO tooling.

---

## 5. Functional Requirements

### 5.1 Onboarding
- Short quiz: role (student / professional), domain (design, engineering, writing, etc.), and goal (job hunt, freelance clients, personal brand).
- Recommend 2–3 templates based on answers; user can override and pick any available template.
- Optional resume upload: parse resume (education, skills, experience) to pre-fill portfolio sections, with the user able to edit all parsed fields afterward.

### 5.2 Template & Widget System
- Templates are self-contained UI modules (e.g., React components) that consume a common user-data schema (JSON/DB record: profile, projects, skills, experience, links).
- Widgets (About, Skills, Gallery, Experience Timeline, Testimonials, Blog) are optional, addable/removable per template, and pre-ranked by relevance to the user's declared domain.
- Each template ships with a small set of preset color palettes/fonts (curated, not a free color picker) to keep results looking professional.
- No per-user code branching: the same template component set renders any user's data at request time (multi-tenant theming, similar in spirit to Shopify's theme model).

### 5.3 Editing Experience
- Drag-and-drop reordering of widgets/sections.
- Instant/live preview of edits (no separate "preview mode" round-trip).
- Toggle project/section visibility without deleting content.

### 5.4 Integrations (auto-fill content, reduce manual entry)
| Source | Mechanism | MVP Priority |
|---|---|---|
| GitHub | REST API (`/users/{username}/repos`, `/users/{username}`) to list repos; user pins selected repos as projects | High — build first |
| Notion | Notion API to pull structured project/blog content from a user-designated page/database | Medium |
| Behance | Server-side fetch of a user's Behance projects (client-side calls are rate-limited; cache results) | Medium |
| Figma | Embed live Figma design/prototype links via Figma's embed snippet; optionally pull exported images if file is public | Medium |
| LinkedIn | OAuth (`r_liteprofile` scope) call to `/v2/me` for name/photo/headline; MVP fallback: user-submitted public profile URL, since full API access requires LinkedIn app approval | Low (fallback-first) |

- New content from integrations should refresh either on-demand (user clicks "sync") or via a scheduled job, so portfolios stay current without manual re-editing.

### 5.5 Analytics & Portfolio Health Dashboard
- **Traffic metrics:** total page views, unique visitors, returning visitors, traffic source breakdown (search/social/direct), trend over time.
- **Engagement data:** top-performing projects/sections (views, time on page).
- **Portfolio health score:** a simple percentage/grade based on completeness (e.g., missing bio, no projects, no profile photo), similar in spirit to PageSpeed/Website-Grader-style checks.
- **Actionable suggestions:** plain-language, prioritized tips (e.g., "Add 2 more projects", "Add a profile photo", "Your About section is empty").
- **Empty state:** before the portfolio is published or has no traffic yet, show a prompt to publish rather than empty charts.

### 5.6 Monetization
- ₹50 one-time payment per premium template (not a subscription).
- Free tier: at least one usable default template, so users can publish without paying.
- Referral program: referrer and referee each get ₹10 off their next template purchase (two-sided incentive, modeled on proven "give X / get X" referral patterns).

### 5.7 Hosting & Scale (MVP)
- Deploy on Render's free tier — sufficient for the initial ~50–65 user cohort.
- Keep ongoing storage/bandwidth costs low given the low-revenue-per-user pricing model; revisit hosting tier as user count or media storage grows.

---

## 6. Architecture Notes

- **Data model:** All user portfolio content (profile, bio, projects, skills, experience, links, chosen widgets/order) lives in a structured JSON/DB record — never hardcoded into template files.
- **Rendering:** Templates are a library of components keyed by theme ID; at render time, the app injects the requesting user's JSON/data record into the selected theme's components. This is what allows N templates × M users without per-user code duplication.
- **Integrations layer:** Each external source (GitHub, Notion, Behance, Figma, LinkedIn) is a separate fetch/sync module that normalizes external data into the same internal project/profile schema, so templates don't need to know where content came from.
- **Caching:** Rate-limited APIs (Behance especially, and GitHub at scale) need server-side caching/sync jobs rather than live client-side calls on every page view.

---

## 7. Future Scope: Automated Job Finder (v1.0, not MVP)

Planned post-MVP direction: the system would scrape/match job listings against the user's portfolio data (skills, experience, keywords), auto-generate tailored resumes/cover letters per listing, and either prompt the user to apply or (longer-term) auto-submit applications. This extends the product's value proposition from "showcase your work" to "help you get hired," but depends on the MVP's portfolio data model and integrations being solid first — it is tracked as a separate future initiative, not part of this build.

---

## 8. Open Questions

- Which integration should ship first beyond GitHub — Notion or Behance — given engineering effort vs. user demand?
- What exact fields define "portfolio completeness" for the health score, and how are weights assigned?
- What is the fallback UX for LinkedIn given API access restrictions (scrape public URL vs. manual entry only)?
- At what user/traffic threshold does Render's free tier need to be upgraded?
