"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/dashboard/Sidebar";

interface UserInfo {
  role: "admin" | "secretaria";
  nome: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function verificar() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.replace("/dashboard/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, nome, email")
        .eq("id", authUser.id)
        .single();

      if (!profile || !["admin", "secretaria"].includes(profile.role ?? "")) {
        router.replace("/dashboard/login");
        return;
      }
      setUser({
        role: profile.role as "admin" | "secretaria",
        nome: profile.nome || profile.email || authUser.email || "Usuário",
      });
      setVerificando(false);
    }
    verificar();
  }, [router]);

  if (verificando) {
    return (
      <div className="min-h-screen bg-[#0E0620] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F5F0FB]">
      <Sidebar role={user.role} nome={user.nome} />
      <main className="flex-1 min-w-0 lg:h-screen lg:overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
