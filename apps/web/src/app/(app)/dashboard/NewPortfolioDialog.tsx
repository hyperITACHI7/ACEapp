"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listThemes } from "@portfolio/themes";
import { Dialog, DialogContent, DialogTitle, useToast } from "@portfolio/ui-kit";
import { ThemeCard } from "../ThemeCard";

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
          {themes.map((t) => (
            <ThemeCard
              key={t.manifest.id}
              theme={t}
              owned={!t.manifest.isPremium || Boolean(owned[t.manifest.id])}
              busy={creatingThemeId === t.manifest.id}
              onUse={createWithTheme}
              onPurchased={createWithTheme}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
