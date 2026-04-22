"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function EntrarForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (params.get("modo") === "cadastro") setModo("cadastro");
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();

    if (modo === "cadastro") {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      });
      if (error) {
        setErro(traduzirErro(error.message));
        setCarregando(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) {
        setErro(traduzirErro(error.message));
        setCarregando(false);
        return;
      }
    }

    setCarregando(false);
    router.push("/home");
  }

  return (
    <div className="min-h-dvh bg-[#FAF4FF] flex flex-col">
      <div className="bg-[#1A0A2E] px-6 pt-12 pb-8">
        <button onClick={() => router.back()} className="text-[#9B7BB8] text-sm mb-6 flex items-center gap-2">
          ← Voltar
        </button>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">reconecte</p>
          <h1 className="text-white text-3xl font-light">
            {modo === "cadastro" ? "Criar conta" : "Entrar"}
          </h1>
        </motion.div>
      </div>

      <div className="flex border-b border-[#EDD5F5]">
        {(["cadastro", "login"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setModo(m); setErro(""); }}
            className={`flex-1 py-3.5 text-xs tracking-widest uppercase transition-colors duration-200 ${
              modo === m ? "text-[#6B3FA0] border-b-2 border-[#6B3FA0] -mb-px" : "text-[#9B7BB8]"
            }`}
          >
            {m === "cadastro" ? "Criar conta" : "Já tenho conta"}
          </button>
        ))}
      </div>

      <div className="flex-1 px-6 pt-8 pb-8">
        <motion.form
          key={modo}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {modo === "cadastro" && (
            <div>
              <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Seu nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como quer ser chamado(a)?"
                required
                className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={modo === "cadastro" ? "Mínimo 6 caracteres" : "Sua senha"}
              required
              className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
            />
          </div>

          {modo === "login" && (
            <div className="text-right">
              <button type="button" className="text-[#9B7BB8] text-xs">Esqueci minha senha</button>
            </div>
          )}

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-xs">{erro}</p>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#1A0A2E] text-white py-4 rounded-2xl text-sm tracking-wide hover:bg-[#6B3FA0] active:scale-95 transition-all duration-200 disabled:opacity-60"
            >
              {carregando ? "Aguarde..." : modo === "cadastro" ? "Começar minha jornada" : "Entrar"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#EDD5F5]" />
              <span className="text-[#9B7BB8] text-xs">ou</span>
              <div className="flex-1 h-px bg-[#EDD5F5]" />
            </div>

            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                });
              }}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#EDD5F5] py-3.5 rounded-2xl text-sm text-[#1A0A2E] hover:border-[#9B7BB8] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar com Google
            </button>
          </div>

          {modo === "cadastro" && (
            <p className="text-[#9B7BB8] text-xs text-center leading-relaxed pt-2">
              Ao criar uma conta você concorda com nossos{" "}
              <span className="text-[#6B3FA0]">Termos de uso</span> e{" "}
              <span className="text-[#6B3FA0]">Política de privacidade</span>.
            </p>
          )}
        </motion.form>
      </div>
    </div>
  );
}

function traduzirErro(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (msg.includes("User already registered")) return "Este e-mail já está cadastrado.";
  if (msg.includes("Password should be")) return "A senha deve ter pelo menos 6 caracteres.";
  return "Ocorreu um erro. Tente novamente.";
}

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarForm />
    </Suspense>
  );
}
