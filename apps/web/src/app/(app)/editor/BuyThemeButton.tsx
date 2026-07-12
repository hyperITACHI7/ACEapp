"use client";

import { useState } from "react";
import { Button, useToast } from "@portfolio/ui-kit";

interface BuyThemeButtonProps {
  themeId: string;
  priceInPaise: number;
  onPurchased: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Couldn't load payment checkout."));
    document.body.appendChild(script);
  });
}

async function pollOwnership(themeId: string, attempts = 8): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(`/api/payments/status?themeId=${themeId}`);
    const body = await res.json();
    if (body.owned) return true;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

export function BuyThemeButton({ themeId, priceInPaise, onPurchased }: BuyThemeButtonProps) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function buy() {
    setBusy(true);
    try {
      const res = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId }),
      });
      const body = await res.json();
      if (!res.ok) {
        showToast(body.error ?? "Couldn't start checkout.", "error");
        return;
      }
      if (body.fulfilled) {
        showToast("Purchased!", "success");
        onPurchased();
        return;
      }

      await loadRazorpayScript();
      const razorpay = new window.Razorpay({
        key: body.keyId,
        amount: body.amount,
        currency: body.currency,
        order_id: body.orderId,
        name: "Portfolio Builder",
        description: `Theme purchase`,
        handler: async () => {
          showToast("Payment received — finalizing…", "info");
          const owned = await pollOwnership(themeId);
          if (owned) {
            showToast("Purchased!", "success");
            onPurchased();
          } else {
            showToast("Payment is processing — refresh in a moment if the theme isn't unlocked yet.", "info");
          }
        },
      });
      razorpay.open();
    } catch {
      showToast("Couldn't start checkout.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={buy} disabled={busy}>
      {busy ? "Starting…" : `Buy for ₹${priceInPaise / 100}`}
    </Button>
  );
}
