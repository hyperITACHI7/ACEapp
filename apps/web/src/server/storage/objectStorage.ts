import { putObjectLocal } from "./local";
import { putObjectR2 } from "./r2";

/**
 * Pluggable driver: "local" for dev (filesystem), "r2" for production (Render free tier has
 * ephemeral disk, so uploaded images would vanish on every redeploy/restart without this).
 */
export async function putObject(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver === "r2") return putObjectR2(key, buffer, contentType);
  return putObjectLocal(key, buffer);
}
