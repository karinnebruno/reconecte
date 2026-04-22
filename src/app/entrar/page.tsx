"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EntrarForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (params.get("modo") === "cadastro") setModo("cadastro");
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    // Supabase auth será conectado aqui
    await new Promise((r) => setTimeout(r, 800));
    setCarregando(false);
    router.push("/home");
  }

  return (
    <div className="min-h-dvh bg-[#FAF4FF] flex flex-col">

      {/* Header */}
      <div className="bg-[#1A0A2E] px-6 pt-12 pb-8">
        <button onClick={() => router.back()} className="text-[#9B7BB8] text-sm mb-6 flex items-center gap-2">
          ← Voltar
        </button>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">reconecte</p>
          <h1 className="text-white text-3xl font-light">
            {modo === "cadastro" ? "Criar conta" : "Entrar"}
          </h1>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EDD5F5]">
        {(["cadastro", "login"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setModo(m)}
            className={`flex-1 py-3.5 text-xs tracking-widest uppercase transition-colors duration-200 ${
              modo === m
                ? "text-[#6B3FA0] border-b-2 border-[#6B3FA0] -mb-px"
                : "text-[#9B7BB8]"
            }`}
          >
            {m === "cadastro" ? "Criar conta" : "Já tenho conta"}
          </button>
        ))}
      </div>

      {/* Form */}
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
              <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">
                Seu nome
              </label>
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
            <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">
              E-mail
            </label>
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
            <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={modo === "cadastro" ? "Mínimo 8 caracteres" : "Sua senha"}
              required
              className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
            />
          </div>

          {modo === "login" && (
            <div className="text-right">
              <button type="button" className="text-[#9B7BB8] text-xs">
                Esqueci minha senha
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#1A0A2E] text-white py-4 rounded-2xl text-sm tracking-wide hover:bg-[#6B3FA0] active:scale-95 transition-all duration-200 disabled:opacity-60"
            >
              {carregando
                ? "Aguarde..."
                : modo === "cadastro"
                ? "Começar minha jornada"
                : "Entrar"}
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

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarForm />
    </Suspense>
  );
}
