import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { getCurrentUser } from "@/server/auth/session";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { emailDigestEnabled, securityAlertsEnabled } = body as {
    emailDigestEnabled?: boolean;
    securityAlertsEnabled?: boolean;
  };
  const data: { emailDigestEnabled?: boolean; securityAlertsEnabled?: boolean } = {};
  if (typeof emailDigestEnabled === "boolean") data.emailDigestEnabled = emailDigestEnabled;
  if (typeof securityAlertsEnabled === "boolean") data.securityAlertsEnabled = securityAlertsEnabled;

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({
    emailDigestEnabled: updated.emailDigestEnabled,
    securityAlertsEnabled: updated.securityAlertsEnabled,
  });
}
