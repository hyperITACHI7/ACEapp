import type { ThemeModule, ThemeProps } from "../types";
import manifest from "./manifest.json";
import { palettes } from "./palettes";

function Component({ data, palette, slots }: ThemeProps) {
  const vars = palettes[palette] ?? palettes[manifest.defaultPalette];
  const { profile } = data;

  return (
    <div className="theme theme-multi-domain-cards" style={vars as React.CSSProperties}>
      <header className="theme-header theme-header--split">
        {profile.photoUrl && (
          <img className="theme-avatar" src={profile.photoUrl} alt={profile.name || "Profile photo"} />
        )}
        <div>
          <h1 className="theme-name">{profile.name || "Your Name"}</h1>
          {profile.headline && <p className="theme-headline">{profile.headline}</p>}
        </div>
      </header>
      <main className="theme-body theme-body--cards">
        {/* Every widget now lives in one continuous grid (see portfolioRenderer.tsx), delivered
           as a single "grid-root" slot — always full width, since it already IS the whole
           per-widget layout internally. */}
        {slots.map((slot) => (
          <section key={slot.key} className="theme-slot theme-slot--card theme-slot--card-full">
            {slot.node}
          </section>
        ))}
      </main>
    </div>
  );
}

const themeModule: ThemeModule = { manifest, Component, palettes };
export default themeModule;
