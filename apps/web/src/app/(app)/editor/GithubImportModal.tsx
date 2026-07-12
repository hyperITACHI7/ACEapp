"use client";

import { useState } from "react";
import type { GithubIntegration } from "@portfolio/schema";
import type { GithubRepo } from "@portfolio/integrations/github";
import { Button, useToast } from "@portfolio/ui-kit";

interface GithubImportModalProps {
  portfolioId: string;
  github: GithubIntegration | undefined;
  onConnected: () => void;
  onImported: () => void;
}

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-purple-400/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all";

export function GithubImportModal({ portfolioId, github, onConnected, onImported }: GithubImportModalProps) {
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);

  async function connect() {
    setConnecting(true);
    setConnectError(null);
    try {
      const res = await fetch("/api/github/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, portfolioId }),
      });
      const body = await res.json();
      if (!res.ok) {
        setConnectError(body.error ?? "Couldn't connect.");
        return;
      }
      onConnected();
      loadRepos(1);
    } finally {
      setConnecting(false);
    }
  }

  async function loadRepos(targetPage: number) {
    setLoadingRepos(true);
    setReposError(null);
    try {
      const res = await fetch(`/api/github/repos?page=${targetPage}&portfolioId=${portfolioId}`);
      const body = await res.json();
      if (!res.ok) {
        setReposError(body.error ?? "Couldn't load repos.");
        return;
      }
      setRepos(targetPage === 1 ? body.repos : [...repos, ...body.repos]);
      setHasMore(body.repos.length === 30 && !body.fromCache);
      setPage(targetPage);
      if (body.fromCache) showToast(`Showing cached repos from ${body.cachedAt}. Rate limited — try again later for fresh data.`);
    } finally {
      setLoadingRepos(false);
    }
  }

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function importSelected() {
    const reposToImport = repos.filter((r) => selected.has(r.id));
    if (reposToImport.length === 0) return;
    const res = await fetch("/api/github/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repos: reposToImport, portfolioId }),
    });
    const body = await res.json();
    if (res.ok) {
      showToast(`Imported ${body.imported} project(s).`, "success");
      setSelected(new Set());
      onImported();
    } else {
      showToast(body.error ?? "Import failed.", "error");
    }
  }

  if (!github) {
    return (
      <div className="flex flex-col gap-3">
        <input
          className={fieldClass}
          placeholder="GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {connectError && <p className="text-xs text-red-400">{connectError}</p>}
        <Button onClick={connect} disabled={connecting || !username} className="self-start">
          {connecting ? "Connecting…" : "Connect"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">Connected: {github.username}</p>
      {repos.length === 0 ? (
        <Button variant="secondary" onClick={() => loadRepos(1)} disabled={loadingRepos} className="self-start">
          {loadingRepos ? "Loading…" : "Browse repos"}
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          {reposError && <p className="text-xs text-red-400">{reposError}</p>}
          {repos.length === 0 && !loadingRepos && <p className="text-sm text-muted-foreground">No public repos found — add projects manually instead.</p>}
          <div className="max-h-60 overflow-y-auto flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-2">
            {repos.map((r) => (
              <label key={r.id} className="flex items-center gap-2 py-1.5 px-2 text-sm rounded-lg hover:bg-white/5">
                <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="accent-purple-500" />
                <span>{r.name}</span>
              </label>
            ))}
          </div>
          {hasMore && (
            <Button variant="secondary" onClick={() => loadRepos(page + 1)} disabled={loadingRepos} className="self-start">
              Load more
            </Button>
          )}
          <Button onClick={importSelected} disabled={selected.size === 0} className="self-start">
            Import {selected.size || ""} selected
          </Button>
        </div>
      )}
    </div>
  );
}
