import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@portfolio/db";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "./constants";

export { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS };
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * DB-backed opaque session token — chosen over JWT so a session can be revoked (logout,
 * suspicious activity) by deleting a row, with no signature-algorithm surface to get wrong.
 */
export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  return { token, expiresAt };
}

export async function getSessionUser(token: string | undefined) {
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await prisma.session.deleteMany({ where: { token } });
}

/** For use in server components / route handlers via next/headers cookies(). */
export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return getSessionUser(token);
}
