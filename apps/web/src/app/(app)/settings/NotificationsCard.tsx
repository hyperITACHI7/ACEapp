"use client";

import { useState } from "react";
import { Card, useToast } from "@portfolio/ui-kit";
import { Switch } from "./Switch";

interface NotificationsCardProps {
  emailDigestEnabled: boolean;
  securityAlertsEnabled: boolean;
}

export function NotificationsCard({ emailDigestEnabled, securityAlertsEnabled }: NotificationsCardProps) {
  const { showToast } = useToast();
  const [emailDigest, setEmailDigest] = useState(emailDigestEnabled);
  const [securityAlerts, setSecurityAlerts] = useState(securityAlertsEnabled);

  async function save(patch: { emailDigestEnabled?: boolean; securityAlertsEnabled?: boolean }) {
    const res = await fetch("/api/account/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) showToast("Couldn't save preference.", "error");
  }

  return (
    <Card className="flex flex-col gap-4 bg-panel backdrop-blur-none">
      <h2 className="text-base font-semibold">Notifications</h2>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Email digest</p>
          <p className="text-xs text-muted-foreground">A weekly summary of your portfolio&apos;s traffic and health.</p>
        </div>
        <Switch
          checked={emailDigest}
          aria-label="Email digest"
          onChange={(checked) => {
            setEmailDigest(checked);
            save({ emailDigestEnabled: checked });
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Security alerts</p>
          <p className="text-xs text-muted-foreground">Notify me about new sign-ins and account changes.</p>
        </div>
        <Switch
          checked={securityAlerts}
          aria-label="Security alerts"
          onChange={(checked) => {
            setSecurityAlerts(checked);
            save({ securityAlertsEnabled: checked });
          }}
        />
      </div>
    </Card>
  );
}
