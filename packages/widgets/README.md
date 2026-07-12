# Widgets

Each subfolder is one widget **style**. Several widgets can share the same content `section`
(e.g. `gallery`, `gallery-cards`, and `gallery-animated` are three different styles of the
`gallery` section) — the editor's Widget Drawer lets a user pick which style each section uses.

## Adding a new widget

1. Copy `_widget-template/` to a new folder named after your widget's key.
2. Fill in `manifest.json` (`key`, `label`, `section`, `configSchema`) and the component (split
   into a `"use client"` `<Name>Component.tsx` + a server-safe `index.tsx` re-export — see any
   existing widget for the pattern; this split is required to avoid an RSC bug).
3. If it needs its own styling, add `<key>.css` in the same folder and add one `@import` line for
   it in `apps/web/src/app/globals.css` (see the other widgets' entries there for the pattern).
4. Register it in `registry.ts` (one `import` + one `register(...)` call).
5. Run `npm run validate -w @portfolio/widgets`.

No other file needs to change — the editor's Outline sidebar, Widget Drawer, and the public
renderer all pick up new widgets automatically from the registry.

See the repo root [`README.md`](../../README.md) and [`phased_architecture.md`](../../phased_architecture.md)
for the wider system.
