// Split out from session.ts so edge middleware can import just the cookie name/options
// without pulling in @portfolio/db (Prisma isn't edge-runtime compatible).
export const SESSION_COOKIE_NAME = "session_token";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
