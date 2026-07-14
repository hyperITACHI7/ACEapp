import type { HTMLAttributes } from "react";
import { cn } from "./utils";

// Flat "glass-card" per the Aether design system: translucent fill + blur + a thin border, and
// deliberately NO drop shadow (elevation comes from tonal layering/blur alone — shadows are
// reserved for floating chrome like modals/panels, see Dialog.tsx).
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-xl border border-white/10 bg-card/60 backdrop-blur-xl p-6", className)}
      {...props}
    />
  );
}
