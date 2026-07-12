import type { WidgetModule, WidgetProps } from "../types";
import manifest from "./manifest.json";

/**
 * Copy this whole folder to add a new widget:
 *   1. Rename the folder and set a unique `key` in manifest.json.
 *   2. Set `section` in manifest.json — the content-type group this widget belongs to
 *      (e.g. "about", "skills"). Widgets sharing a `section` are alternate styles for the
 *      same content and are grouped together in the editor's widget picker.
 *   3. Implement the Component below.
 *   4. Register it in packages/widgets/registry.ts (the only other file you need to touch).
 *
 * If the Component needs inline editing (useEditorMode/EditableText from @portfolio/ui-kit,
 * both client-only hooks/components), put it in a SEPARATE `"use client"` file (see about/
 * AboutComponent.tsx for the pattern) and import it here — do NOT add "use client" to this
 * index.tsx itself. This file's default export is read on the server (registry.ts dots into
 * `manifest.key`/`manifest.section` from the public page, a Server Component); marking it
 * "use client" turns that entire export into an opaque client reference and breaks server-side
 * reads of the plain `manifest` data.
 *
 * Must handle empty/missing data gracefully — never render `null`/`undefined` as literal text,
 * and never throw (it's wrapped in an ErrorBoundary by the render pipeline regardless, but a
 * clean empty state is better UX than a swallowed crash).
 */
function Component({ config }: WidgetProps) {
  const heading = typeof config.heading === "string" ? config.heading : manifest.configSchema[0].default;
  return (
    <div className="widget widget-template">
      <h2 className="widget-heading">{String(heading)}</h2>
      <p className="widget-empty">Nothing here yet.</p>
    </div>
  );
}

const widgetModule: WidgetModule = { manifest: manifest as WidgetModule["manifest"], Component };
export default widgetModule;
