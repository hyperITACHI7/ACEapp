"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listThemes } from "@portfolio/themes";
import { Button, Dialog, DialogContent, DialogTitle, useToast } from "@portfolio/ui-kit";
import { BuyThemeButton } from "../editor/BuyThemeButton";

interface NewPortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Shown when creating a new portfolio — picks a theme up front instead of silently defaulting
 *  to one. Premium themes not yet owned show the same buy flow as the editor's Settings modal;
 *  purchasing one creates the portfolio with it immediately afterward. */
export function NewPortfolioDialog({ open, onOpenChange }: NewPortfolioDialogProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const themes = listThemes();
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [creatingThemeId, setCreatingThemeId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    Promise.all(
      themes.map(async (t) => {
        if (!t.manifest.isPremium) return [t.manifest.id, true] as const;
        const res = await fetch(`/api/payments/status?themeId=${t.manifest.id}`);
        const body = await res.json();
        return [t.manifest.id, Boolean(body.owned)] as const;
      })
    ).then((entries) => {
      if (!cancelled) setOwned(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function createWithTheme(themeId: string) {
    setCreatingThemeId(themeId);
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId }),
      });
      const body = await res.json();
      if (!res.ok) {
        showToast(body.error ?? "Couldn't create portfolio.", "error");
        return;
      }
      onOpenChange(false);
      router.push(`/editor/${body.id}`);
    } finally {
      setCreatingThemeId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Pick a theme for your new portfolio</DialogTitle>
        <p className="text-sm text-muted-foreground mb-4">You can change this any time from within the editor.</p>
        <div className="grid grid-cols-2 gap-3">
          {themes.map((t) => {
            const isOwned = !t.manifest.isPremium || owned[t.manifest.id];
            return (
              <div
                key={t.manifest.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2"
              >
                <span className="text-sm font-medium">{t.manifest.name}</span>
                <span className="text-xs text-muted-foreground">
                  {t.manifest.isPremium ? `₹${t.manifest.priceInPaise / 100}` : "Free"}
                </span>
                {isOwned ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => createWithTheme(t.manifest.id)}
                    disabled={creatingThemeId !== null}
                  >
                    {creatingThemeId === t.manifest.id ? "Creating…" : "Use this theme"}
                  </Button>
                ) : (
                  <BuyThemeButton
                    themeId={t.manifest.id}
                    priceInPaise={t.manifest.priceInPaise}
                    onPurchased={() => createWithTheme(t.manifest.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
