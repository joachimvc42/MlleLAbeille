import type { Metadata } from "next";
import { hasAdminSession } from "@/lib/adminSession";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await hasAdminSession();
  if (!authed) return <AdminLogin />;
  return <AdminShell>{children}</AdminShell>;
}
