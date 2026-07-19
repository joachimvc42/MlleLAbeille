import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Password-gated admin session. The password lives in ADMIN_PASSWORD
 * (falls back to the boutique's initial password so the workshop works
 * out of the box — set the env var in Vercel to rotate it). The cookie
 * stores an HMAC derived from the password, so changing the password
 * invalidates every existing session.
 */
export const ADMIN_COOKIE = "mlle_admin";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "Lucie42!";
}

export function expectedToken(): string {
  return createHmac("sha256", adminPassword())
    .update("mlle-admin-session-v1")
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function verifyPassword(candidate: string): boolean {
  return safeEqual(candidate, adminPassword());
}

export async function hasAdminSession(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  return safeEqual(value, expectedToken());
}
