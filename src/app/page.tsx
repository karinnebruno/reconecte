"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

const horariosDia = [
  { label: "Muito cedo", desc: "5h – 6h", valor: "5" },
  { label: "De manhã", desc: "7h – 8h", valor: "7" },
  { label: "Manhã média", desc: "9h – 10h", valor: "9" },
  { label: "Tarde", desc: "11h ou mais", valor: "11" },
];

type Etapa = "splash" | "intro" | "nome" | "email" | "horario" | "senha";

export default function LandingPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("splash");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [horario, setHorario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEtapa("intro"), 1800);
    return () => clearTimeout(t);
  }, []);

  async function cadastrar() {
    if (!nome || !email || !senha) return;
    setErro("");
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome, horario_inicio: horario } },
    });
    if (error) {
      setErro(error.message.includes("already registered") ? "Este e-mail já está cadastrado." : "Erro ao criar conta. Tente novamente.");
      setCarregando(false);
      return;
    }
    setCarregando(false);
    router.push("/home");
  }

  const totalEtapas = 4;
  const etapaMap: Partial<Record<Etapa, number>> = { nome: 1, email: 2, horario: 3, senha: 4 };
  const etapaNum = etapaMap[etapa] ?? 0;

  return (
    <div className="min-h-dvh bg-[#1A0A2E]">
      <AnimatePresence mode="wait">

        {/* Splash */}
        {etapa === "splash" && (
          <motion.div
            key="splash"
            className="min-h-dvh flex flex-col items-center justify-center"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#6B3FA0]/20 border border-[#6B3FA0]/30 flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <h1 className="text-white text-4xl font-light tracking-widest">reconecte</h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="h-px bg-[#6B3FA0]"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Intro */}
        {etapa === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="min-h-dvh flex flex-col px-6 pt-16 pb-10"
          >
            <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full border border-[#6B3FA0]/15 pointer-events-none" />

            <div className="mb-6">
              <p className="text-[#9B7BB8] text-xs tracking-[0.25em] uppercase mb-2">Bem-vindo ao</p>
              <h1 className="text-white text-5xl font-light tracking-wide mb-6">reconecte</h1>
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#6B3FA0]/50">
                  <Image src="/foto_karinne.jpg" alt="Karinne Bruno" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Karinne Bruno</p>
                  <p className="text-[#9B7BB8] text-xs leading-snug mt-0.5">Neuropsicóloga, sexóloga<br />e terapeuta de casais</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-white text-3xl font-light leading-snug mb-4">
                Construa uma rotina saudável com quem você ama.
              </h2>
              <p className="text-[#9B7BB8] text-sm leading-relaxed mb-8">
                Desafios diários para melhorar a comunicação, reconectar emocionalmente e fortalecer seu relacionamento — com base científica.
              </p>
              <div className="space-y-2 mb-10">
                {[
                  { emoji: "🌱", texto: "Hábitos saudáveis em casal" },
                  { emoji: "💬", texto: "Comunicação e conexão emocional" },
                  { emoji: "📚", texto: "Conteúdo com base científica" },
                ].map(({ emoji, texto }) => (
                  <div key={texto} className="flex items-center gap-3">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-white/80 text-sm">{texto}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setEtapa("nome")}
                className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm font-medium tracking-wide hover:bg-[#B07FD4] active:scale-95 transition-all duration-200"
              >
                Começar agora
              </button>
              <button
                onClick={() => router.push("/entrar")}
                className="w-full text-[#9B7BB8] py-3 text-sm tracking-wide"
              >
                Já tenho conta
              </button>
            </div>
          </motion.div>
        )}

        {/* Etapas de cadastro */}
        {["nome", "email", "horario", "senha"].includes(etapa) && (
          <motion.div
            key="cadastro"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            className="min-h-dvh flex flex-col px-6 pt-14 pb-10"
          >
            {/* Progresso */}
            <div className="flex gap-1.5 mb-10">
              {Array.from({ length: totalEtapas }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i < etapaNum ? "bg-[#6B3FA0]" : "bg-[#6B3FA0]/20"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* Nome */}
              {etapa === "nome" && (
                <motion.div
                  key="etapa-nome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col"
                >
                  <p className="text-[#9B7BB8] text-xs tracking-widest uppercase mb-4">Passo 1 de 4</p>
                  <h2 className="text-white text-3xl font-light leading-snug mb-2">Como você se chama?</h2>
                  <p className="text-[#9B7BB8] text-sm mb-8">Vamos personalizar sua experiência.</p>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && nome.trim() && setEtapa("email")}
                    placeholder="Seu primeiro nome"
                    autoFocus
                    className="w-full bg-transparent border-b-2 border-[#6B3FA0]/40 focus:border-[#6B3FA0] text-white text-2xl font-light pb-3 placeholder:text-[#9B7BB8]/40 focus:outline-none transition-colors"
                  />
                  <div className="flex-1" />
                  <button
                    onClick={() => setEtapa("email")}
                    disabled={!nome.trim()}
                    className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm font-medium disabled:opacity-30 transition-all duration-200"
                  >
                    Continuar →
                  </button>
                  <button onClick={() => setEtapa("intro")} className="mt-3 text-[#9B7BB8] text-sm py-2">← Voltar</button>
                </motion.div>
              )}

              {/* Email */}
              {etapa === "email" && (
                <motion.div
                  key="etapa-email"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col"
                >
                  <p className="text-[#9B7BB8] text-xs tracking-widest uppercase mb-4">Passo 2 de 4</p>
                  <h2 className="text-white text-3xl font-light leading-snug mb-2">Qual é o seu e-mail, {nome}?</h2>
                  <p className="text-[#9B7BB8] text-sm mb-8">Você vai usar para entrar no app.</p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && email.includes("@") && setEtapa("horario")}
                    placeholder="seu@email.com"
                    autoFocus
                    className="w-full bg-transparent border-b-2 border-[#6B3FA0]/40 focus:border-[#6B3FA0] text-white text-xl font-light pb-3 placeholder:text-[#9B7BB8]/40 focus:outline-none transition-colors"
                  />
                  <div className="flex-1" />
                  <button
                    onClick={() => setEtapa("horario")}
                    disabled={!email.includes("@")}
                    className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm font-medium disabled:opacity-30 transition-all duration-200"
                  >
                    Continuar →
                  </button>
                  <button onClick={() => setEtapa("nome")} className="mt-3 text-[#9B7BB8] text-sm py-2">← Voltar</button>
                </motion.div>
              )}

              {/* Horário */}
              {etapa === "horario" && (
                <motion.div
                  key="etapa-horario"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col"
                >
                  <p className="text-[#9B7BB8] text-xs tracking-widest uppercase mb-4">Passo 3 de 4</p>
                  <h2 className="text-white text-3xl font-light leading-snug mb-2">Quando seu dia costuma começar?</h2>
                  <p className="text-[#9B7BB8] text-sm mb-8">Vamos sugerir o melhor horário para seus desafios.</p>
                  <div className="space-y-3">
                    {horariosDia.map((h) => (
                      <button
                        key={h.valor}
                        onClick={() => setHorario(h.valor)}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 ${
                          horario === h.valor
                            ? "bg-[#6B3FA0] border-[#6B3FA0] text-white"
                            : "border-[#6B3FA0]/30 text-white hover:border-[#6B3FA0]"
                        }`}
                      >
                        <span className="text-sm font-medium">{h.label}</span>
                        <span className={`text-sm ${horario === h.valor ? "text-white/70" : "text-[#9B7BB8]"}`}>{h.desc}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex-1" />
                  <button
                    onClick={() => setEtapa("senha")}
                    disabled={!horario}
                    className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm font-medium disabled:opacity-30 transition-all duration-200 mt-6"
                  >
                    Continuar →
                  </button>
                  <button onClick={() => setEtapa("email")} className="mt-3 text-[#9B7BB8] text-sm py-2">← Voltar</button>
                </motion.div>
              )}

              {/* Senha */}
              {etapa === "senha" && (
                <motion.div
                  key="etapa-senha"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col"
                >
                  <p className="text-[#9B7BB8] text-xs tracking-widest uppercase mb-4">Passo 4 de 4</p>
                  <h2 className="text-white text-3xl font-light leading-snug mb-2">Crie sua senha</h2>
                  <p className="text-[#9B7BB8] text-sm mb-8">Mínimo de 6 caracteres.</p>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && senha.length >= 6 && cadastrar()}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full bg-transparent border-b-2 border-[#6B3FA0]/40 focus:border-[#6B3FA0] text-white text-2xl font-light pb-3 placeholder:text-[#9B7BB8]/40 focus:outline-none transition-colors"
                  />
                  {erro && (
                    <p className="text-red-400 text-xs mt-3">{erro}</p>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={cadastrar}
                    disabled={senha.length < 6 || carregando}
                    className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm font-medium disabled:opacity-30 transition-all duration-200 mt-6"
                  >
                    {carregando ? "Criando sua conta..." : "Começar minha jornada ✨"}
                  </button>
                  <button onClick={() => setEtapa("horario")} className="mt-3 text-[#9B7BB8] text-sm py-2">← Voltar</button>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
