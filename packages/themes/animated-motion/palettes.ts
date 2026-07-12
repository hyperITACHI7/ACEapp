// Single dark palette ported from a Figma-exported animated-portfolio prototype. Two extra
// theme-scoped vars beyond the usual bg/fg/accent/muted/border: `--accent-2` (the prototype's
// secondary indigo highlight) and `--font-heading`/`--font-body`.
export const palettes: Record<string, Record<string, string>> = {
  default: {
    "--bg": "#07070f",
    "--fg": "#ededf5",
    "--card": "#0e0e1c",
    "--border": "rgba(255, 255, 255, 0.07)",
    "--accent": "#c8f135",
    "--accent-2": "#5d5fef",
    "--muted": "#7878a0",
    "--font-heading": "'Bricolage Grotesque', sans-serif",
    "--font-body": "'Manrope', sans-serif",
    "--font-mono": "'DM Mono', monospace",
  },
};
