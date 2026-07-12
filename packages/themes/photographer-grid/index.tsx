import type { ThemeModule, ThemeProps } from "../types";
import manifest from "./manifest.json";
import { palettes } from "./palettes";

function Component({ data, palette, slots }: ThemeProps) {
  const vars = palettes[palette] ?? palettes[manifest.defaultPalette];
  const { profile } = data;

  return (
    <div className="theme theme-photographer-grid" style={vars as React.CSSProperties}>
      <header className="theme-header theme-header--centered">
        {profile.photoUrl && (
          <img className="theme-avatar" src={profile.photoUrl} alt={profile.name || "Profile photo"} />
        )}
        <h1 className="theme-name">{profile.name || "Your Name"}</h1>
        {profile.headline && <p className="theme-headline">{profile.headline}</p>}
      </header>
      {/* Every widget now lives in one continuous grid (see portfolioRenderer.tsx), delivered
         as a single "grid-root" slot — resize the Gallery card in the editor for the same
         full-bleed prominence this theme used to hardcode. */}
      <main className="theme-body theme-body--stacked">
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
