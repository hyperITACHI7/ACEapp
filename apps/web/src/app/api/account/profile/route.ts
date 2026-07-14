import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { getCurrentUser } from "@/server/auth/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Account-level identity fields (name/email/avatar) — distinct from a portfolio's own
 *  Profile.name/photoUrl, which is display content on the published page, not login identity. */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, avatarUrl } = body as { name?: string; email?: string; avatarUrl?: string };
  const data: { name?: string; email?: string; avatarUrl?: string } = {};

  if (name !== undefined) {
    data.name = name.trim();
  }

  if (email !== undefined) {
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return NextResponse.json({ error: "Email already in use." }, { status: 409 });
    }
    data.email = email;
  }

  if (avatarUrl !== undefined) {
    data.avatarUrl = avatarUrl;
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ name: updated.name, email: updated.email, avatarUrl: updated.avatarUrl });
}
