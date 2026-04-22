"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function DashboardLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error || !data.user) {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (!profile || !["admin", "secretaria"].includes(profile.role ?? "")) {
      await supabase.auth.signOut();
      setErro("Acesso não autorizado.");
      setCarregando(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0E0620] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#6B3FA0] flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">✦</span>
          </div>
          <h1 className="text-white text-xl font-light">Reconecte</h1>
          <p className="text-[#9B7BB8] text-sm mt-1">Painel de gestão</p>
        </div>

        <form onSubmit={entrar} className="bg-[#1A0A2E] rounded-2xl p-6 space-y-4 border border-[#2D1155]">
          <div>
            <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-[#0E0620] border border-[#2D1155] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-[#4A2A6A] focus:outline-none focus:border-[#6B3FA0] transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              className="w-full bg-[#0E0620] border border-[#2D1155] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-[#4A2A6A] focus:outline-none focus:border-[#6B3FA0] transition-colors"
              placeholder="••••••••"
            />
          </div>
          {erro && <p className="text-red-400 text-xs">{erro}</p>}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#6B3FA0] hover:bg-[#7D50B5] text-white py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
