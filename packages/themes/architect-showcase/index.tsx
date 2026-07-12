import type { ThemeModule, ThemeProps } from "../types";
import manifest from "./manifest.json";
import { palettes } from "./palettes";

function Component({ data, palette, slots }: ThemeProps) {
  const vars = palettes[palette] ?? palettes[manifest.defaultPalette];
  const { profile } = data;

  return (
    <div className="theme theme-architect-showcase" style={vars as React.CSSProperties}>
      <header className="theme-header theme-header--split">
        <div>
          <h1 className="theme-name">{profile.name || "Your Name"}</h1>
          {profile.headline && <p className="theme-headline">{profile.headline}</p>}
        </div>
        {profile.photoUrl && (
          <img className="theme-avatar theme-avatar--square" src={profile.photoUrl} alt={profile.name || "Profile photo"} />
        )}
      </header>
      {profile.bio && <p className="theme-bio theme-bio--lead">{profile.bio}</p>}
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
