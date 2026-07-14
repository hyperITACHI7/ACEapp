"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, PenSquare, Package, Settings } from "lucide-react";

const EDITOR_LINK = { href: "/editor", label: "Portfolio Editor", icon: PenSquare };

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/assets", label: "Assets", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof PenSquare; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-white/10 text-foreground font-medium"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}

export function SidebarNavLinks() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="flex flex-col px-3 py-4">
      <div className="flex flex-col gap-1 pb-3 mb-3 border-b border-white/10">
        <NavLink {...EDITOR_LINK} active={isActive(EDITOR_LINK.href)} />
      </div>
      <div className="flex flex-col gap-1">
        {LINKS.map((link) => (
          <NavLink key={link.href} {...link} active={isActive(link.href)} />
        ))}
      </div>
    </nav>
  );
}
