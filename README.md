# Portfolio Builder

A Next.js monorepo (npm workspaces) for building and publishing personal portfolio sites from
reusable, theme-agnostic widgets.

## Where things live

- **`packages/widgets/<key>/`** — one widget style (e.g. `gallery-animated`, `stats`). Copy
  `packages/widgets/_widget-template/` to start a new one, then register it in
  `packages/widgets/registry.ts`. Validate with `npm run validate -w @portfolio/widgets`.
- **`packages/themes/<id>/`** — one theme (e.g. `animated-motion`). Copy
  `packages/themes/_theme-template/` to start a new one, then register it in
  `packages/themes/registry.ts`. Validate with `npm run validate -w @portfolio/themes`.
- **`apps/web/src/app/(app)/editor/`** — the editor UI (Outline sidebar, Widget Drawer, Settings,
  GitHub import, etc.).
- **`packages/portfolio-schema/`** — the data model (Zod schemas), split by entity: `profile.ts`,
  `project.ts`, `experience.ts`, `widget.ts`, `github.ts`.
- **`packages/ui-kit/`** — shared editor-chrome components (toasts, dialogs, editor-mode context).
- **`packages/integrations/`** — GitHub/resume-import integrations.
- **`services/jobs/`** — background jobs (scheduled GitHub re-sync, analytics rollups, payment
  reconciliation).

Widget and theme CSS is colocated with its owning package (`packages/widgets/<key>/<key>.css`,
`packages/themes/<id>/<id>.css`) and pulled into the build via `@import` in
`apps/web/src/app/globals.css` — you should never need to touch that file for an ordinary
widget/theme change.

For the full system design (data flow, rendering pipeline, why widgets are theme-agnostic, etc.)
see [`phased_architecture.md`](./phased_architecture.md).

## Getting started

```bash
npm install
npm run dev
```

Before committing, run `npm run validate:registries` and `npx tsc --noEmit -p apps/web`.
