import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { verifyPassword } from "@/server/auth/password";
import { createSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/server/auth/session";
import { checkRateLimit, clientIpFromRequest } from "@/server/rateLimit";

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  if (!checkRateLimit(`login:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  const passwordOk = user ? await verifyPassword(body.password, user.passwordHash) : false;
  if (!user || !passwordOk) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const { token } = await createSession(user.id);
  const response = NextResponse.json({ id: user.id, email: user.email, username: user.username });
  response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return response;
}
