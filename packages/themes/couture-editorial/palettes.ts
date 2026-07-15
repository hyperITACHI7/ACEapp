// Ported from the Fashion_folio reference: an editorial, gold-on-near-black palette. Only two
// base colors (near-black + cream) plus a single gold accent — everything else in the reference
// is an alpha variant of those three, so this theme deliberately ships one palette rather than
// several (the reference has no real color-scheme variants to offer as alternates).
export const palettes: Record<string, Record<string, string>> = {
  default: {
    "--bg": "#080806",
    "--card": "#111009",
    "--fg": "#F2EDE4",
    "--accent": "#C4A560",
    "--accent-2": "#E8D49A",
    "--muted": "#9A907E",
    "--border": "rgba(196, 165, 96, 0.18)",
    "--font-heading": "'Playfair Display', serif",
    "--font-body": "'Raleway', sans-serif",
    // Extra var beyond the base set (same precedent as animated-motion's --font-mono): the
    // reference's italic editorial voice, used only for the hero tagline and testimonial quotes.
    "--font-editorial": "'EB Garamond', serif",
  },
};
