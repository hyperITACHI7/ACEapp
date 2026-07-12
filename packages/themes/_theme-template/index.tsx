import type { ThemeModule, ThemeProps } from "../types";
import manifest from "./manifest.json";
import { palettes } from "./palettes";

/**
 * Copy this whole folder to add a new theme:
 *   1. Rename the folder and set a unique `id` in manifest.json.
 *   2. Adjust `domainTags`, `defaultWidgetKeys` (section id -> widget key to auto-add), `palettes`/
 *      `defaultPalette`, `isPremium`, `priceInPaise`.
 *   3. Register it in packages/themes/registry.ts (the only other file you need to touch).
 *
 * Hard requirement: this component must render the profile header itself, unconditionally,
 * BEFORE rendering `slots` — this is what guarantees a portfolio with zero visible widgets
 * still renders something instead of a blank page (edge_case.md §2).
 */
function Component({ data, palette, slots }: ThemeProps) {
  const vars = palettes[palette] ?? palettes[manifest.defaultPalette];

  return (
    <div className="theme" style={vars as React.CSSProperties}>
      <header className="theme-header">
        <h1 className="theme-name">{data.profile.name || "Your Name"}</h1>
        <p className="theme-headline">{data.profile.headline}</p>
      </header>
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
