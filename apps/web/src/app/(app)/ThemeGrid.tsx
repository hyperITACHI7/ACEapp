"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { listThemes } from "@portfolio/themes";
import { useToast } from "@portfolio/ui-kit";
import { ThemeCard } from "./ThemeCard";

interface ThemeGridProps {
  ownedIds: string[];
}

/** Grid of every theme as a `ThemeCard`, wired to the create-portfolio-then-redirect-to-editor
 *  flow — shared by Explore and Assets so both "pick a theme" pages behave identically. */
export function ThemeGrid({ ownedIds }: ThemeGridProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const themes = listThemes();
  const owned = new Set(ownedIds);
  const [creatingThemeId, setCreatingThemeId] = useState<string | null>(null);

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
      router.push(`/editor/${body.id}`);
    } finally {
      setCreatingThemeId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {themes.map((t) => (
        <ThemeCard
          key={t.manifest.id}
          theme={t}
          owned={owned.has(t.manifest.id)}
          busy={creatingThemeId === t.manifest.id}
          onUse={createWithTheme}
          onPurchased={createWithTheme}
        />
      ))}
    </div>
  );
}
