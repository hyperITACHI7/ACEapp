"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Palette, ArrowLeft, Eye, Monitor, Smartphone } from "lucide-react";
import type { PortfolioData } from "@portfolio/schema";
import { getTheme } from "@portfolio/themes";
import { Button, useToast } from "@portfolio/ui-kit";
import { StatusBar } from "./StatusBar";

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
  const router = useRouter();
  const { showToast } = useToast();
  const [publishing, setPublishing] = useState(false);
  const themeName = getTheme(draft.themeId)?.manifest.name ?? "Theme";

  async function publish() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/publish`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        showToast(body.error ?? "Publish failed.", "error");
        return;
      }
      showToast("Published!", "success");
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

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
      <StatusBar draft={draft} saving={saving} />
      {/* Which device the preview/Outline sidebar is currently editing — desktop's grid
         position/size vs mobile's independent order + show/hide (see MobileOutlineSidebar). */}
      <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onEditingBreakpointChange("desktop")}
          aria-pressed={editingBreakpoint === "desktop"}
          title="Edit desktop layout"
          className={`flex items-center justify-center rounded-full p-1.5 transition-colors ${
            editingBreakpoint === "desktop"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Monitor size={14} />
        </button>
        <button
          type="button"
          onClick={() => onEditingBreakpointChange("mobile")}
          aria-pressed={editingBreakpoint === "mobile"}
          title="Edit mobile layout"
          className={`flex items-center justify-center rounded-full p-1.5 transition-colors ${
            editingBreakpoint === "mobile"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Smartphone size={14} />
        </button>
      </div>
      {/* Opens the DRAFT (autosaved working copy) full-screen at /preview/<id> — what the page
         will look like once published, without publishing. */}
      <Button variant="secondary" size="sm" asChild className="shrink-0">
        <a href={`/preview/${portfolioId}`} target="_blank" rel="noreferrer">
          <Eye size={14} />
          Preview
        </a>
      </Button>
      {/* Labeled (not icon-only) so it's obvious this is where theme switching + other
         portfolio-level settings live, rather than an unmarked gear glyph. */}
      <Button variant="secondary" size="sm" onClick={onOpenSettings} aria-label="Theme and settings" className="shrink-0">
        <Palette size={14} />
        {themeName}
      </Button>
      <Button onClick={publish} disabled={publishing} size="sm" className="shrink-0">
        {publishing ? "Publishing…" : published ? "Republish" : "Publish"}
      </Button>
    </div>
  );
}
