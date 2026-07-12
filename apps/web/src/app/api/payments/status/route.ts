import { NextResponse } from "next/server";
import { userOwnsTheme } from "@/server/payments/ownership";
import { getCurrentUser } from "@/server/auth/session";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const themeId = new URL(request.url).searchParams.get("themeId");
  if (!themeId) return NextResponse.json({ error: "themeId is required." }, { status: 400 });

  const owned = await userOwnsTheme(user.id, themeId);
  return NextResponse.json({ owned });
}
