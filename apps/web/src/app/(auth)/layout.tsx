import type { ReactNode } from "react";

// AuthExperience owns its own full-screen layout (background orbs, centered card),
// so this layout is just a pass-through.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
