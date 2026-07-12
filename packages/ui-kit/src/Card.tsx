import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]",
        className
      )}
      {...props}
    />
  );
}
