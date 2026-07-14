import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { listOwnedThemeIds } from "@/server/payments/ownership";
import { ThemeGrid } from "../ThemeGrid";

export default async function ExplorePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ownedIds = await listOwnedThemeIds(user.id);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Explore themes</h1>
        <p className="text-sm font-body text-muted-foreground mt-1">
          Browse every theme available on ACEapp and start a new portfolio with one.
        </p>
      </div>
      <ThemeGrid ownedIds={[...ownedIds]} />
    </div>
  );
}
