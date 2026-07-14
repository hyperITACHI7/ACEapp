import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** `neutral` covers plain tags and "Draft"/disconnected-style statuses (gray). `positive`
   *  covers "Live"/"Published"/match-score/"Connected" — the one place color is reserved for,
   *  per the design system's "color only for success/error" rule. */
  tone?: "neutral" | "positive";
}

/** The one reusable pill/chip recipe used for tags, status badges, and match-score badges
 *  throughout the app (dashboard portfolio cards, template cards, job cards, etc.) — same shape
 *  everywhere, only the tone differs. */
export function Chip({ tone = "neutral", className, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "positive" ? "bg-success/15 text-success" : "bg-white/[0.06] text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
