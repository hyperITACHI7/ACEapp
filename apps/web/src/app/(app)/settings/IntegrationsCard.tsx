"use client";

import { useState } from "react";
import { Github, Linkedin, Figma, Dribbble, Palette, Sparkles } from "lucide-react";
import type { GithubIntegration } from "@portfolio/schema";
import { Button, Card, Chip, useToast } from "@portfolio/ui-kit";

const fieldClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-white/40 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.12)] transition-all";

interface IntegrationsCardProps {
  portfolioId: string | null;
  github: GithubIntegration | null;
}

const COMING_SOON = [
  { name: "LinkedIn", icon: Linkedin },
  { name: "Behance", icon: Palette },
  { name: "Dribbble", icon: Dribbble },
  { name: "Figma", icon: Figma },
  { name: "Lovable", icon: Sparkles },
];

/** GitHub connect/status only — full repo browsing/import stays in the Portfolio Editor's
 *  Settings modal. Reads/writes the connection on the user's primary portfolio (published, else
 *  most-recently-updated) since that's where GitHub's connection actually lives today, not on
 *  the account itself — see this page's server component for the resolution. */
export function IntegrationsCard({ portfolioId, github }: IntegrationsCardProps) {
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(github);

  async function connect() {
    if (!portfolioId) {
      showToast("Create a portfolio first, then connect GitHub.", "error");
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch("/api/github/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, portfolioId }),
      });
      const body = await res.json();
      if (!res.ok) {
        showToast(body.error ?? "Couldn't connect.", "error");
        return;
      }
      setConnected({ username: body.username, connectedAt: new Date().toISOString(), lastSyncedAt: null, status: "connected" });
      showToast("GitHub connected.", "success");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4 bg-panel backdrop-blur-none">
      <h2 className="text-base font-semibold">Integrations</h2>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Github size={16} />
            GitHub
          </span>
          {connected && <Chip tone="positive">Connected as {connected.username}</Chip>}
        </div>
        {!connected ? (
          <div className="flex gap-2">
            <input
              className={fieldClass}
              placeholder="GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button onClick={connect} disabled={connecting || !username} className="shrink-0">
              {connecting ? "Connecting…" : "Connect"}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Full repo import lives in the Portfolio Editor&apos;s Settings — this is connection status only.
          </p>
        )}
      </div>

      {COMING_SOON.map(({ name, icon: Icon }) => (
        <div
          key={name}
          className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between opacity-60"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Icon size={16} />
            {name}
          </span>
          <Chip tone="neutral">Coming soon</Chip>
        </div>
      ))}
    </Card>
  );
}
