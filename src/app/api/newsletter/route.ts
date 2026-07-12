import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().trim().email().max(160),
  locale: z.string().max(5).optional().default("fr"),
});

export async function POST(request: Request) {
  let payload;
  try {
    payload = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (admin) {
    const { error } = await admin
      .from("newsletter_subscribers")
      .upsert(
        { email: payload.email.toLowerCase(), locale: payload.locale },
        { onConflict: "email" },
      );
    if (error) {
      console.error("newsletter insert failed", error);
      return NextResponse.json({ error: "storage_failed" }, { status: 500 });
    }
  } else {
    // Demo mode: acknowledge without storing (documented in README).
    console.info(`newsletter (demo): ${payload.email}`);
  }

  return NextResponse.json({ ok: true });
}
