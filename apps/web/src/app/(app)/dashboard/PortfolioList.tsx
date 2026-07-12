"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, Dialog, DialogContent, DialogTitle, useToast } from "@portfolio/ui-kit";
import { NewPortfolioDialog } from "./NewPortfolioDialog";

export interface PortfolioSummary {
  id: string;
  name: string;
  themeName: string;
  published: boolean;
  updatedAt: string;
}

/** Portfolio list/switcher: create, edit, publish-swap ("Set as active"), and discard.
 *  Only one portfolio per account can be published at a time — publishing here un-publishes
 *  whichever other one was previously live (enforced server-side). All actions update the
 *  local list optimistically so the result is visible immediately, then reconcile with the
 *  server via `router.refresh()`; a failed request rolls the local change back. */
export function PortfolioList({ portfolios }: { portfolios: PortfolioSummary[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [items, setItems] = useState(portfolios);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newPortfolioOpen, setNewPortfolioOpen] = useState(false);

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

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Your portfolios</h3>
        <Button size="sm" onClick={() => setNewPortfolioOpen(true)}>
          <Plus size={14} /> New Portfolio
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{p.name}</span>
              <span className="text-xs text-muted-foreground">
                {p.themeName} · {p.published ? "Published" : "Draft"} · Updated{" "}
                {/* Explicit locale — server (Node) and client (browser) can otherwise pick
                   different default locales for the same Date, producing a hydration mismatch. */}
                {new Date(p.updatedAt).toLocaleDateString("en-US")}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/editor/${p.id}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Edit
              </Link>
              {!p.published && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActive(p.id)}
                  disabled={busyId === p.id}
                >
                  Set as active
                </Button>
              )}
              <button
                onClick={() => setConfirmDeleteId(p.id)}
                className="text-muted-foreground hover:text-red-400 transition-colors"
                aria-label={`Discard ${p.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

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

      <NewPortfolioDialog open={newPortfolioOpen} onOpenChange={setNewPortfolioOpen} />
    </Card>
  );
}
