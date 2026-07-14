"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuroraBackground } from "./AuroraBackground";

/** Wraps every `(app)` page's content except the Portfolio Editor with a persistent aurora
 *  backdrop: the shader itself, a dark/blurred/translucent scrim over it (so it reads as a muted
 *  animated background rather than a distraction), and the page content on top. Lives in the
 *  layout (not per-page) so the same canvas keeps animating across dashboard/explore/assets/
 *  settings navigation instead of remounting — mirrors `SidebarVisibility.tsx`'s pathname check. */
export function MainBackground({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isEditor = pathname === "/editor" || pathname.startsWith("/editor/");

  if (isEditor) {
    return <div className="p-6">{children}</div>;
  }

  return (
    <div className="relative min-h-full">
      <div className="absolute inset-0">
        <AuroraBackground />
      </div>
      <div className="absolute inset-0 bg-background/55 backdrop-blur-2xl" />
      {/* Subtle top fade so a page's heading (e.g. dashboard's "Welcome back" + New Project
         button) stays clearly readable even when a brighter part of the aurora sits behind it —
         deliberately faint, just enough contrast to separate the header from the backdrop. */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
      <div className="relative z-10 p-6">{children}</div>
    </div>
  );
}
