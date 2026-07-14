"use client";

import Link from "next/link";
import { Palette, ArrowLeft } from "lucide-react";
import type { PortfolioData } from "@portfolio/schema";
import { getTheme } from "@portfolio/themes";
import { Button } from "@portfolio/ui-kit";
import { PublishBar } from "./PublishBar";

interface TopBarProps {
  portfolioId: string;
  draft: PortfolioData;
  published: boolean;
  saving: boolean;
  onOpenSettings: () => void;
  editingBreakpoint: "desktop" | "mobile";
  onEditingBreakpointChange: (breakpoint: "desktop" | "mobile") => void;
}

export function TopBar({
  portfolioId,
  draft,
  published,
  saving,
  onOpenSettings,
  editingBreakpoint,
  onEditingBreakpointChange,
}: TopBarProps) {
  const themeName = getTheme(draft.themeId)?.manifest.name ?? "Theme";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <ArrowLeft size={14} />
        All portfolios
      </Link>
      <div className="w-px h-5 bg-white/10 shrink-0" />
      <PublishBar
        portfolioId={portfolioId}
        draft={draft}
        published={published}
        saving={saving}
        editingBreakpoint={editingBreakpoint}
        onEditingBreakpointChange={onEditingBreakpointChange}
      />
      {/* Labeled (not icon-only) so it's obvious this is where theme switching + other
         portfolio-level settings live, rather than an unmarked gear glyph. */}
      <Button variant="secondary" size="sm" onClick={onOpenSettings} aria-label="Theme and settings" className="shrink-0">
        <Palette size={14} />
        {themeName}
      </Button>
    </div>
  );
}
