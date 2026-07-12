// Five domain color palettes for one shared card-grid layout, ported from a Figma-exported
// prototype's THEMES token set (bg/surface/card/border/primary/text/muted + fonts) into this
// project's `--bg`/`--fg`/`--accent`/`--muted`/`--border` convention, plus two vars this theme
// specifically needs: `--card` (distinct card background) and `--font-heading`/`--font-body`.
export const palettes: Record<string, Record<string, string>> = {
  software: {
    "--bg": "#0d1117",
    "--fg": "#e6edf3",
    "--card": "#1c2128",
    "--border": "#30363d",
    "--accent": "#58a6ff",
    "--muted": "#8b949e",
    "--font-heading": "'JetBrains Mono', Consolas, monospace",
    "--font-body": "'Inter', sans-serif",
  },
  finance: {
    "--bg": "#070c18",
    "--fg": "#e8eaf0",
    "--card": "#121d35",
    "--border": "#1e2d52",
    "--accent": "#c9a84c",
    "--muted": "#8892b0",
    "--font-heading": "'Libre Baskerville', Georgia, serif",
    "--font-body": "'IBM Plex Sans', sans-serif",
  },
  healthcare: {
    "--bg": "#f0f9ff",
    "--fg": "#0c4a6e",
    "--card": "#ffffff",
    "--border": "#bae6fd",
    "--accent": "#0891b2",
    "--muted": "#64748b",
    "--font-heading": "'Nunito', sans-serif",
    "--font-body": "'DM Sans', sans-serif",
  },
  education: {
    "--bg": "#fffbf0",
    "--fg": "#1c1917",
    "--card": "#ffffff",
    "--border": "#fde68a",
    "--accent": "#d97706",
    "--muted": "#78716c",
    "--font-heading": "'Merriweather', Georgia, serif",
    "--font-body": "'Poppins', sans-serif",
  },
  corporate: {
    "--bg": "#f4f5f7",
    "--fg": "#1a202c",
    "--card": "#ffffff",
    "--border": "#dde1e7",
    "--accent": "#1e3a5f",
    "--muted": "#6b7280",
    "--font-heading": "'Playfair Display', Georgia, serif",
    "--font-body": "'Source Sans 3', sans-serif",
  },
};
