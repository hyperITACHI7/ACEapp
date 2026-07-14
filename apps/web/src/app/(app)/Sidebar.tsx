import type { User } from "@portfolio/db";
import Link from "next/link";
import { SidebarNavLinks } from "./SidebarNavLinks";
import { Avatar } from "./Avatar";
import { HelpCenterDialog } from "./HelpCenterDialog";
import { LogoutButton } from "./LogoutButton";

export function Sidebar({ user }: { user: User }) {
  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-card flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="tracking-tight inline-block">
          <span className="text-2xl font-[family-name:var(--font-limelight)]">ACE</span>
          <span className="text-2xl font-[family-name:var(--font-roboto)] font-bold">.</span>
          <span className="text-2xl" style={{ fontFamily: "'Doto', sans-serif", fontWeight: 700 }}>
            app
          </span>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">Portfolio Builder</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <SidebarNavLinks />
      </div>

      <div className="mt-auto border-t border-white/10 p-3 flex flex-col gap-1">
        <HelpCenterDialog />
        <div className="[&>button]:flex [&>button]:items-center [&>button]:gap-2.5 [&>button]:rounded-lg [&>button]:px-3 [&>button]:py-2 [&>button]:w-full [&>button]:text-sm">
          <LogoutButton />
        </div>

        <div className="flex items-center gap-2.5 mt-2 px-2 py-2 rounded-lg">
          <Avatar name={user.name} username={user.username} email={user.email} avatarUrl={user.avatarUrl} size={32} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name ?? user.username ?? "Account"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
