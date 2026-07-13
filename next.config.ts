import type { NextConfig } from "next";

/**
 * Supabase Storage hostname for next/image remotePatterns.
 * Never let a malformed env var (stray quotes/whitespace from pasting into
 * a dashboard, missing protocol, trailing slash…) crash the entire build —
 * worst case, Supabase-hosted images just aren't optimized until the value
 * is fixed.
 */
function supabaseImageHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/^['"]|['"]$/g, "");
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    console.warn(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid URL, ignoring it for image optimization: ${raw}`,
    );
    return null;
  }
}

const supabaseHostname = supabaseImageHostname();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    remotePatterns: [
      // Supabase Storage (production images). Harmless when unset.
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
