"use client";

import { getTheme } from "@portfolio/themes";

interface PalettePickerProps {
  themeId: string;
  palette: string;
  onChange: (palette: string) => void;
}

const fieldClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground outline-none focus:border-white/40 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.12)] transition-all";
const labelClass = "block text-sm font-medium text-muted-foreground mb-1.5";

export function PalettePicker({ themeId, palette, onChange }: PalettePickerProps) {
  const theme = getTheme(themeId);
  if (!theme) return null;

  return (
    <div>
      <label htmlFor="palette-select" className={labelClass}>
        Palette
      </label>
      <select id="palette-select" className={fieldClass} value={palette} onChange={(e) => onChange(e.target.value)}>
        {theme.manifest.palettes.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
