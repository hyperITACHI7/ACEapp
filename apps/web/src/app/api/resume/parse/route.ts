import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { parseResume } from "@/server/resume/resumeParser";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("resume");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  // Reject non-PDF/oversized uploads clearly, client AND server side — never a silent timeout,
  // and the client can always skip straight to manual entry regardless (edge_case.md §1).
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Please upload a PDF resume.", fields: {} }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 5MB).", fields: {} }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fields = await parseResume(buffer); // best-effort; empty result is not an error

  return NextResponse.json({ fields });
}
