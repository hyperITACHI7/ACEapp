import type { ThemeModule } from "@portfolio/themes";
import { Button, Chip } from "@portfolio/ui-kit";
import { BuyThemeButton } from "./editor/BuyThemeButton";

const SWATCH_KEYS = ["--bg", "--accent", "--fg"] as const;

interface ThemeCardProps {
  theme: ThemeModule;
  owned: boolean;
  busy: boolean;
  onUse: (themeId: string) => void;
  onPurchased: (themeId: string) => void;
}

/** One theme tile — reused by Explore, Assets, and the dashboard's NewPortfolioDialog so every
 *  "pick a theme" surface renders identically instead of duplicating markup. No preview images
 *  exist for any theme, so this shows a few palette-color swatch dots instead (per design
 *  decision — a live-rendered mini-preview was considered but not chosen for this pass). */
export function ThemeCard({ theme, owned, busy, onUse, onPurchased }: ThemeCardProps) {
  const { manifest } = theme;
  const palette = theme.palettes[manifest.defaultPalette] ?? {};

  return (
    <div className="rounded-xl border border-white/10 bg-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate">{manifest.name}</span>
        {owned ? (
          <Chip tone="positive">Available</Chip>
        ) : (
          <Chip tone="neutral">₹{manifest.priceInPaise / 100}</Chip>
        )}
      </div>

      <div className="flex gap-1.5">
        {SWATCH_KEYS.map((key) =>
          palette[key] ? (
            <span
              key={key}
              className="w-5 h-5 rounded-full border border-white/10 shrink-0"
              style={{ background: palette[key] }}
            />
          ) : null
        )}
      </div>

      {owned ? (
        <Button size="sm" variant="secondary" onClick={() => onUse(manifest.id)} disabled={busy}>
          {busy ? "Creating…" : "Use this theme"}
        </Button>
      ) : (
        <BuyThemeButton
          themeId={manifest.id}
          priceInPaise={manifest.priceInPaise}
          onPurchased={() => onPurchased(manifest.id)}
        />
      )}
    </div>
  );
}
