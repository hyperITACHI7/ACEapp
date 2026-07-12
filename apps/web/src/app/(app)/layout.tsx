import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getCurrentUser } from "@/server/auth/session";
import { LogoutButton } from "./LogoutButton";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center gap-6 px-6 py-3 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold tracking-tight">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Portfolio Builder
        </span>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <Link href="/editor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Editor
        </Link>
        <span className="flex-1" />
        <Link
          href={`/${user.username}`}
          target="_blank"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View portfolio
        </Link>
        <LogoutButton />
      </nav>
      {/* No max-width here — the editor's 3-pane layout needs full viewport width for its
         canvas to breathe. Pages that want a narrower reading width (dashboard, onboarding)
         set their own max-w wrapper internally. */}
      <main className="flex-1 w-full p-6">{children}</main>
    </div>
  );
}
