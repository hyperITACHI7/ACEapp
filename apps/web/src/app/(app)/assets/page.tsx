import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { listOwnedThemeIds } from "@/server/payments/ownership";
import { ThemeGrid } from "../ThemeGrid";
import { AssetsWidgets } from "./AssetsWidgets";

export default async function AssetsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ownedIds = await listOwnedThemeIds(user.id);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Assets</h1>
        <p className="text-sm font-body text-muted-foreground mt-1">
          Every theme and widget available to you — available means purchased (or free).
        </p>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Themes</h2>
        <ThemeGrid ownedIds={[...ownedIds]} />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Widgets</h2>
        <AssetsWidgets />
      </div>
    </div>
  );
}
