import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { processImage } from "@/server/images/processImage";
import { putObject } from "@/server/storage/objectStorage";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("image");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Please upload a JPG, PNG, or WebP image." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 8MB)." }, { status: 400 });
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const { buffer, contentType } = await processImage(rawBuffer);
  const key = `${user.id}/${crypto.randomUUID()}.webp`;
  const url = await putObject(key, buffer, contentType);

  return NextResponse.json({ url });
}
