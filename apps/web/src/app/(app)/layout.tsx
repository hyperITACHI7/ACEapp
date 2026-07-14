import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { Sidebar } from "./Sidebar";
import { SidebarVisibility } from "./SidebarVisibility";
import { MainBackground } from "./MainBackground";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <SidebarVisibility>
        <Sidebar user={user} />
      </SidebarVisibility>
      {/* No max-width here — the editor's 3-pane layout needs full viewport width (minus the
         sidebar, when shown) for its canvas to breathe. Pages that want a narrower reading width
         (dashboard, settings, onboarding) set their own max-w wrapper internally. Padding is
         owned by MainBackground (not here) so its aurora/scrim can bleed to this element's edges. */}
      <main className="flex-1 min-w-0 relative">
        <MainBackground>{children}</MainBackground>
      </main>
    </div>
  );
}
