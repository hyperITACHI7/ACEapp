interface AvatarProps {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: number;
}

/** Renders the account avatar if set, else an initials circle derived from name/username/email. */
export function Avatar({ name, username, email, avatarUrl, size = 32 }: AvatarProps) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  const initial = (name || username || email || "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className="rounded-full flex items-center justify-center shrink-0 bg-white/10 text-foreground font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </span>
  );
}
