"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/entrar"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.replace("/home");
        return;
      }
      setVerificando(false);
    }
    verificar();
  }, [router]);

  if (verificando) {
    return (
      <div className="min-h-dvh bg-[#1A0A2E] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
