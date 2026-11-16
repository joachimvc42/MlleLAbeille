import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/** The server-side admin password also signs the workshop session cookie. */
export const ADMIN_COOKIE = "mlle_admin";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "";
}

export function expectedToken(): string {
  const password = adminPassword();
  if (!password) throw new Error("ADMIN_PASSWORD is required");
  return createHmac("sha256", password)
    .update("mlle-admin-session-v1")
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function verifyPassword(candidate: string): boolean {
  const password = adminPassword();
  return Boolean(password) && safeEqual(candidate, password);
}

export async function hasAdminSession(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value || !adminPassword()) return false;
  return safeEqual(value, expectedToken());
}
