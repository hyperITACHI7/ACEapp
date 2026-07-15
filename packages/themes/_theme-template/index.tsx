import { getWidget } from "@portfolio/widgets";
import type { ThemeModule, ThemeProps } from "../types";
import manifest from "./manifest.json";
import { palettes } from "./palettes";

/**
 * Copy this whole folder to add a new theme:
 *   1. Rename the folder and set a unique `id` in manifest.json.
 *   2. Adjust `domainTags`, `defaultWidgetKeys` (section id -> widget key to auto-add), `palettes`/
 *      `defaultPalette`, `isPremium`, `priceInPaise`.
 *   3. Register it in packages/themes/registry.ts (the only other file you need to touch).
 *   4. If this theme ships a `blueprint` (see ../types.ts's TemplateBlueprint) with its own
 *      `hero`-section widget, add `blueprint.ts` and include it in the module's default export.
 *
 * Hard requirement: this component must render *some* header content BEFORE rendering `slots` —
 * this is what guarantees a portfolio with zero visible widgets still renders something instead
 * of a blank page (edge_case.md §2). Amended for blueprint themes that ship their own `hero`
 * widget: the minimal name/headline header below renders only when no visible hero-section
 * widget exists, so a hero widget's own header content is never doubled up with this one — but
 * if the user later deletes their hero widget, this fallback header reappears rather than
 * leaving a blank space.
 */
function Component({ data, palette, slots }: ThemeProps) {
  const vars = palettes[palette] ?? palettes[manifest.defaultPalette];
  const hasHeroWidget = data.widgets.some(
    (w) => w.visible && getWidget(w.key)?.manifest.section === "hero"
  );

  return (
    <div className="theme" style={vars as React.CSSProperties}>
      {!hasHeroWidget && (
        <header className="theme-header">
          <h1 className="theme-name">{data.profile.name || "Your Name"}</h1>
          <p className="theme-headline">{data.profile.headline}</p>
        </header>
      )}
      <main className="theme-body">
        {slots.map((slot) => (
          <section key={slot.key} className="theme-slot">
            {slot.node}
          </section>
        ))}
      </main>
    </div>
  );
}

const themeModule: ThemeModule = { manifest, Component, palettes };
export default themeModule;
