import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { DEFAULT_THEME_ID, getTheme } from "@portfolio/themes";
import { emptyPortfolioData } from "@portfolio/schema";
import { hashPassword } from "@/server/auth/password";
import { createSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/server/auth/session";
import { validateUsername } from "@/server/auth/reservedUsernames";
import { randomReferralCode } from "@/server/referrals/code";
import { checkRateLimit, clientIpFromRequest } from "@/server/rateLimit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  if (!checkRateLimit(`signup:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { email, password, username, referralCode } = body as {
    email?: string;
    password?: string;
    username?: string;
    referralCode?: string;
  };

  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!username) {
    return NextResponse.json({ error: "Username is required." }, { status: 400 });
  }
  const usernameCheck = validateUsername(username);
  if (!usernameCheck.valid) {
    return NextResponse.json({ error: usernameCheck.reason }, { status: 400 });
  }
  const normalizedUsername = username.toLowerCase();

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username: normalizedUsername } }),
  ]);
  if (existingEmail) return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  if (existingUsername) return NextResponse.json({ error: "Username already taken." }, { status: 409 });

  let referredByUserId: string | undefined;
  if (referralCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode } });
    if (referrer) referredByUserId = referrer.id;
    // An invalid/unknown referral code is silently ignored rather than blocking signup.
  }

  const passwordHash = await hashPassword(password);

  const theme = getTheme(DEFAULT_THEME_ID)!;
  const draftData = emptyPortfolioData(DEFAULT_THEME_ID, theme.manifest.defaultPalette);

  // Retry on the rare referralCode collision (unique constraint).
  let user;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          username: normalizedUsername,
          referralCode: randomReferralCode(),
          referredByUserId,
          portfolios: {
            create: {
              username: normalizedUsername,
              data: draftData,
            },
          },
        },
      });
      break;
    } catch (err: unknown) {
      const isReferralCodeCollision =
        typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
      if (isReferralCodeCollision && attempt < 4) continue;
      throw err;
    }
  }
  if (!user) return NextResponse.json({ error: "Could not create account. Try again." }, { status: 500 });

  const { token } = await createSession(user.id);
  const response = NextResponse.json({ id: user.id, email: user.email, username: user.username });
  response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return response;
}
