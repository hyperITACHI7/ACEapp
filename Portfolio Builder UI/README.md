# Portfolio Builder UI — frontend/UX reference

A standalone Vite + React + React Router prototype of the app's full frontend: auth, onboarding,
dashboard, template explorer, drag-and-drop editor, live preview, job suggestions, and profile
settings. Visual language is a black/white/gray minimalist "Aether" design system (Tailwind CSS v4),
with mock data and `localStorage`-backed auth/state — no backend.

**This is a design/UX reference, not a drop-in replacement for `apps/web`.** It's a different stack
(Vite SPA vs. this repo's Next.js app), built to iterate quickly on layout, copy, and visual design
before porting the agreed-on UI into `apps/web`'s widgets/themes/editor architecture.

See `stitch_minimalist_portfolio_builder/` for the original design mockups and design-system spec
this build was based on.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## Structure

```
src/
  pages/          # one file per route/screen
  layouts/        # PublicLayout, AppShell (authed sidebar), OnboardingLayout
  components/      # shared UI (cards, chips, health score, editor sub-panels, ...)
  landing/        # the "Folio" marketing landing page (kept as its own self-contained design)
  auth/           # AuthContext + RequireAuth route guard
  portfolio/      # PortfolioContext (in-progress portfolio being edited)
  data/           # static/mock data (templates, jobs, dashboard stats, widgets)
```
