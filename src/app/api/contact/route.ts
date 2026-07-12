import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  message: z.string().trim().min(5).max(4000),
  locale: z.string().max(5).optional().default("fr"),
});

export async function POST(request: Request) {
  let payload;
  try {
    payload = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (admin) {
    const { error } = await admin.from("contact_messages").insert({
      name: payload.name,
      email: payload.email.toLowerCase(),
      message: payload.message,
      locale: payload.locale,
    });
    if (error) {
      console.error("contact insert failed", error);
      return NextResponse.json({ error: "storage_failed" }, { status: 500 });
    }
  } else {
    console.info(`contact (demo) from ${payload.email}: ${payload.message.slice(0, 120)}`);
  }

  return NextResponse.json({ ok: true });
}
