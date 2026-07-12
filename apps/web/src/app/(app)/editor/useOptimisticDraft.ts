"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortfolioData } from "@portfolio/schema";
import { useToast } from "@portfolio/ui-kit";

const SAVE_DEBOUNCE_MS = 800;

/**
 * Local edits apply instantly (optimistic). A debounced PATCH persists them; on failure the
 * draft rolls back to the last server-confirmed state with a toast, and a 409 (someone else
 * edited this portfolio) prompts a reload instead of silently overwriting newer server data
 * (edge_case.md §3).
 */
export function useOptimisticDraft(portfolioId: string, initialData: PortfolioData, initialVersion: number) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState(initialData);
  const [version, setVersion] = useState(initialVersion);
  const [saving, setSaving] = useState(false);
  const lastSavedRef = useRef(initialData);
  // Tracks the latest known version synchronously so `save` can read it without routing through
  // a setState updater — React 18 Strict Mode (dev only) invokes updater functions twice, and an
  // updater with a side effect (a network call) inside it fires that side effect twice too. That
  // produced two near-simultaneous PATCH requests per edit: the first succeeds and bumps the
  // server version, the second then 409s against its own now-stale `expectedVersion` and rolls
  // the draft back — visible as edits (e.g. a theme switch) spuriously reverting.
  const versionRef = useRef(initialVersion);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (data: PortfolioData, expectedVersion: number) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/portfolios/${portfolioId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data, expectedVersion }),
        });
        if (res.status === 409) {
          showToast("This portfolio changed elsewhere — reload the page to see the latest version.", "error");
          setDraft(lastSavedRef.current);
          return;
        }
        if (!res.ok) {
          showToast("Couldn't save your last change. It's been rolled back — please retry.", "error");
          setDraft(lastSavedRef.current);
          return;
        }
        const body = await res.json();
        versionRef.current = body.version;
        setVersion(body.version);
        lastSavedRef.current = data;
      } catch {
        showToast("Network error — your last change was rolled back. Please retry.", "error");
        setDraft(lastSavedRef.current);
      } finally {
        setSaving(false);
      }
    },
    [portfolioId, showToast]
  );

  const updateDraft = useCallback(
    (updater: (prev: PortfolioData) => PortfolioData) => {
      setDraft((prev) => {
        const next = updater(prev);
        if (next === prev) return prev; // no real change — don't schedule a pointless save
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          save(next, versionRef.current);
        }, SAVE_DEBOUNCE_MS);
        return next;
      });
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { draft, version, saving, updateDraft };
}
