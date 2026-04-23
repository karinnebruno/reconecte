"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const ROUTE_MAP: Record<string, string> = {
  "/admin": "/dashboard",
  "/admin/trilhas": "/dashboard/trilhas",
  "/admin/desafios": "/dashboard/desafios",
  "/admin/agendamentos": "/dashboard/agendamentos",
  "/admin/agenda": "/dashboard/disponibilidade",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const exact = ROUTE_MAP[pathname];
    if (exact) { router.replace(exact); return; }

    // /admin/trilhas/[id]/... → /dashboard/trilhas/[id]/...
    if (pathname.startsWith("/admin/")) {
      router.replace(pathname.replace("/admin/", "/dashboard/"));
    }
  }, [pathname, router]);

  return (
    <div className="min-h-dvh bg-[#1A0A2E] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
    </div>
  );
}
