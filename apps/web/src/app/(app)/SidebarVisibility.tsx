"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Hides the sidebar on the Portfolio Editor routes, which need full viewport width for their
 *  3-pane layout. Wraps the (server-rendered) Sidebar as `children` rather than importing it
 *  directly, so Sidebar itself stays a Server Component. */
export function SidebarVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hide = pathname === "/editor" || pathname.startsWith("/editor/");
  if (hide) return null;
  return <>{children}</>;
}
