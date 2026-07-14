"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button, Card, Chip, Dialog, DialogContent, DialogTitle, useToast } from "@portfolio/ui-kit";
import type { HealthTip } from "@/lib/healthScore";
import { ActionableTips } from "./ActionableTips";

export interface PortfolioSummary {
  id: string;
  name: string;
  themeName: string;
  published: boolean;
  updatedAt: string;
}

interface RecentPortfoliosProps {
  portfolios: PortfolioSummary[];
  tips: HealthTip[];
  hasPublishedPortfolio: boolean;
}

const VISIBLE_ROWS = 4;

/** Recent/draft portfolios: always one card per row, 4 rows visible by default (padded with
 *  vacant space if there are fewer than 4), "View all" only appears past 4 and reveals the rest.
 *  The Actionable Tips card is always shown alongside it, in a fixed 2-column page layout, and
 *  stretches to match the portfolios card's height via CSS grid's default stretch alignment.
 *  Reuses the same set-active/discard logic that used to live in PortfolioList.tsx (optimistic
 *  update, rollback on failure, confirm-delete dialog). */
export function RecentPortfolios({ portfolios, tips, hasPublishedPortfolio }: RecentPortfoliosProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [items, setItems] = useState(portfolios);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setItems(portfolios);
  }, [portfolios]);

  async function setActive(id: string) {
    setBusyId(id);
    const prevItems = items;
    setItems((prev) => prev.map((p) => ({ ...p, published: p.id === id })));
    try {
      const res = await fetch(`/api/portfolios/${id}/publish`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setItems(prevItems);
        showToast(body.error ?? "Couldn't publish.", "error");
        return;
      }
      showToast("Published!", "success");
      router.refresh();
    } catch {
      setItems(prevItems);
      showToast("Network error — couldn't publish. Please retry.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function discard(id: string) {
    const prevItems = items;
    setItems((prev) => prev.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setItems(prevItems);
        showToast(body.error ?? "Couldn't discard portfolio.", "error");
        return;
      }
      showToast("Portfolio discarded.", "success");
      router.refresh();
    } catch {
      setItems(prevItems);
      showToast("Network error — couldn't discard. Please retry.", "error");
    } finally {
      setBusyId(null);
    }
  }

  const visible = expanded ? items : items.slice(0, VISIBLE_ROWS);
  const emptySlots = expanded ? 0 : Math.max(0, VISIBLE_ROWS - visible.length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-stretch">
      <Card className="flex flex-col gap-4 h-full bg-panel backdrop-blur-none">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Recent portfolios</h3>
          {items.length > VISIBLE_ROWS && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? "Show less" : "View all"}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {visible.map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/editor/${p.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/editor/${p.id}`);
              }}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer hover:border-white/20 transition-colors"
            >
              <div className="flex flex-col min-w-0 gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{p.name}</span>
                  <Chip tone={p.published ? "positive" : "neutral"}>{p.published ? "Live" : "Draft"}</Chip>
                </div>
                <span className="text-xs text-muted-foreground">
                  {p.themeName} · Updated{" "}
                  {new Date(p.updatedAt).toLocaleDateString("en-US")}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {!p.published && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive(p.id);
                    }}
                    disabled={busyId === p.id}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Set as active
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(p.id);
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Discard ${p.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              aria-hidden="true"
              className="flex items-center justify-between gap-3 rounded-xl border border-transparent px-4 py-3"
            >
              <div className="flex flex-col min-w-0 gap-1">
                <span className="text-sm font-medium invisible">placeholder</span>
                <span className="text-xs invisible">placeholder</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ActionableTips tips={tips} hasPublishedPortfolio={hasPublishedPortfolio} />

      <Dialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogTitle>Discard this portfolio?</DialogTitle>
          <p className="text-sm text-muted-foreground mb-4">
            This permanently deletes it, including its analytics history. This can&apos;t be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId && discard(confirmDeleteId)}
              disabled={busyId === confirmDeleteId}
            >
              {busyId === confirmDeleteId ? "Discarding…" : "Discard"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
