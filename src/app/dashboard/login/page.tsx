"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function DashboardLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrarComGoogle() {
    setErro("");
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      setErro("Erro ao iniciar login com Google.");
      setCarregando(false);
    }
  }

  async function entrarComEmail(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }
    // Redireciona para o dashboard — o Server Component valida o role
    window.location.href = "/dashboard";
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

        <div className="bg-[#1A0A2E] rounded-2xl p-6 space-y-4 border border-[#2D1155]">
          <button
            onClick={entrarComGoogle}
            disabled={carregando}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            Entrar com Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2D1155]" />
            <span className="text-[#4A2A6A] text-xs">ou</span>
            <div className="flex-1 h-px bg-[#2D1155]" />
          </div>

          <form onSubmit={entrarComEmail} className="space-y-4">
            <div>
              <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
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
              {carregando ? "Entrando..." : "Entrar com e-mail"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
