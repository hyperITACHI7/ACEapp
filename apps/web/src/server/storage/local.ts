import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Dev/demo only — writes into apps/web/public/uploads so Next.js serves it directly.
// Render's free tier has ephemeral disk, so this driver must NOT be used in a real production
// deploy (uploaded files vanish on every redeploy/restart) — use STORAGE_DRIVER=r2 instead.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function putObjectLocal(key: string, buffer: Buffer): Promise<string> {
  const destination = path.join(UPLOAD_DIR, key);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, buffer);
  // PortfolioDataSchema validates image/photo fields with z.string().url(), which a bare
  // "/uploads/..." relative path fails — must return an absolute URL like the R2 driver does.
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  return `${baseUrl}/uploads/${key}`;
}
