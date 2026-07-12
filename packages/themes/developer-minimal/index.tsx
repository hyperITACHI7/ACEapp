import type { ThemeModule, ThemeProps } from "../types";
import manifest from "./manifest.json";
import { palettes } from "./palettes";

function Component({ data, palette, slots }: ThemeProps) {
  const vars = palettes[palette] ?? palettes[manifest.defaultPalette];
  const { profile } = data;

  return (
    <div className="theme theme-developer-minimal" style={vars as React.CSSProperties}>
      <header className="theme-header theme-header--minimal">
        <h1 className="theme-name">{profile.name || "Your Name"}</h1>
        {profile.headline && <p className="theme-headline">{profile.headline}</p>}
        {profile.bio && <p className="theme-bio">{profile.bio}</p>}
        {profile.socialLinks.length > 0 && (
          <ul className="theme-social-links">
            {profile.socialLinks.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.platform}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>
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
