# Folio — Portfolio Builder landing page

An animation-first landing page concept for a portfolio-builder product, inspired
by the transitions and kinetic typography of
[Shopify Editions](https://www.shopify.com/editions/spring2026).

The focus is the **motion**: scroll-driven kinetic typography, full-bleed panels
that zoom/parallax as they pass through the viewport, staggered reveals, a
floating section-nav pill, and a scroll-scrubbed manifesto.

## Highlights

- **Kinetic hero** — a three-copy "everywhere" word-wheel that spins with scroll
  over a dispersion background with parallax + zoom.
- **Feature panels** — each section is a full-viewport visual whose background
  "rushes" (scale + parallax) with the section title drifting through, followed
  by a dark content block with staggered feature cards.
- **Floating section nav** — a bottom-center pill that tracks the section in view
  (via `IntersectionObserver`) and expands to a menu.
- **Manifesto** — a statement whose words fade in one-by-one, scrubbed to scroll.
- **Marquee**, animated **CTA glow**, sticky blur header, reduced-motion support.

## Tech stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) (`useScroll` / `useTransform`)

## Getting started

Requires Node.js **20.19+** or **22.12+** (Vite 8).

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build
npm run preview  # preview the production build
npm run lint     # oxlint
```

## Structure

```
src/
  App.tsx                  # page composition
  data/sections.ts         # section content (copy + accents + images)
  components/
    Header.tsx             # sticky header, blurs on scroll
    Hero.tsx               # kinetic word-wheel + parallax dispersion bg
    Manifesto.tsx          # scroll-scrubbed word-by-word reveal
    FeaturePanel.tsx       # zoom/parallax visual + staggered feature cards
    Marquee.tsx            # infinite logo marquee
    FloatingNav.tsx        # section-tracking floating pill
    CTA.tsx                # closing call-to-action with animated glow
    Footer.tsx
    Reveal.tsx             # reusable in-view reveal wrapper
public/assets/             # generated background imagery
```

All background imagery in `public/assets` is placeholder art; swap in your own.
Copy lives in `src/data/sections.ts` so content edits stay in one place.
