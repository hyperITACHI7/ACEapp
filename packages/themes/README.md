# Themes

Each subfolder is one theme — the outer shell (nav, header, footer, palette) that every widget
renders inside. Themes are widget-agnostic: they receive a resolved grid of widget slots and just
render whatever's there.

## Adding a new theme

1. Copy `_theme-template/` to a new folder named after your theme's id.
2. Fill in `manifest.json` (`id`, `label`, `palettes`, `defaultPalette`, `defaultWidgetKeys`,
   pricing), `palettes.ts` (CSS custom properties per palette), and the component.
3. If it needs its own styling beyond the shared theme-shell primitives (see
   `packages/themes/_shared/shared-themes.css`), add `<id>.css` in the same folder and add one
   `@import` line for it in `apps/web/src/app/globals.css`.
4. Register it in `registry.ts` (one `import` + one `register(...)` call).
5. Run `npm run validate -w @portfolio/themes`.

See the repo root [`README.md`](../../README.md) and [`phased_architecture.md`](../../phased_architecture.md)
for the wider system.
