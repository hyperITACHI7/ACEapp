"use client";

import { listThemes } from "@portfolio/themes";

interface ThemeSwitcherProps {
  themeId: string;
  onChange: (themeId: string) => void;
}

const fieldClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground outline-none focus:border-white/40 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.12)] transition-all";
const labelClass = "block text-sm font-medium text-muted-foreground mb-1.5";

export function ThemeSwitcher({ themeId, onChange }: ThemeSwitcherProps) {
  const themes = listThemes();
  return (
    <div>
      <label htmlFor="theme-select" className={labelClass}>
        Theme
      </label>
      <select id="theme-select" className={fieldClass} value={themeId} onChange={(e) => onChange(e.target.value)}>
        {themes.map((t) => (
          <option key={t.manifest.id} value={t.manifest.id}>
            {t.manifest.name}
            {t.manifest.isPremium ? ` (₹${t.manifest.priceInPaise / 100})` : " (free)"}
          </option>
        ))}
      </select>
    </div>
  );
}
