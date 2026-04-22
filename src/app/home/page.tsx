"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/ui";
import { createClient } from "@/lib/supabase";

const trilhasAtivas = [
  {
    slug: "comunicacao-sem-conflito",
    titulo: "Comunicação sem conflito",
    modulo: "Módulo 2",
    licao: "Lição 3 de 7",
    progresso: 45,
    emoji: "💬",
  },
];

const desafioHoje = "Faça uma pergunta aberta para seu parceiro(a) hoje — sem julgamentos, só com curiosidade genuína.";

const emojisHumor = [
  { valor: 1, emoji: "😔", label: "Difícil" },
  { valor: 2, emoji: "😕", label: "Complicado" },
  { valor: 3, emoji: "😐", label: "Neutro" },
  { valor: 4, emoji: "🙂", label: "Bem" },
  { valor: 5, emoji: "😄", label: "Ótimo" },
];

export default function HomePage() {
  const router = useRouter();
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [streak, setStreak] = useState(0);
  const [humorSelecionado, setHumorSelecionado] = useState<number | null>(null);
  const [mostrarNotaHumor, setMostrarNotaHumor] = useState(false);
  const [notaHumor, setNotaHumor] = useState("");
  const [humorSalvo, setHumorSalvo] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function carregarUsuario() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/entrar"); return; }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("nome")
        .eq("id", user.id)
        .single();
      if (profile) setNomeUsuario(profile.nome.split(" ")[0]);

      const { data: streakData } = await supabase
        .from("streaks")
        .select("current_streak")
        .eq("user_id", user.id)
        .single();
      if (streakData) setStreak(streakData.current_streak);

      const hoje = new Date().toISOString().split("T")[0];
      const { data: humor } = await supabase
        .from("mood_entries")
        .select("humor")
        .eq("user_id", user.id)
        .eq("data", hoje)
        .single();
      if (humor) { setHumorSelecionado(humor.humor); setHumorSalvo(true); }
    }

    carregarUsuario();
  }, [router]);

  function selecionarHumor(valor: number) {
    setHumorSelecionado(valor);
    setMostrarNotaHumor(true);
  }

  async function salvarHumor() {
    if (!userId || !humorSelecionado) return;
    const supabase = createClient();
    const hoje = new Date().toISOString().split("T")[0];
    const emojiAtual = emojisHumor.find(h => h.valor === humorSelecionado)?.emoji;

    await supabase.from("mood_entries").upsert({
      user_id: userId,
      humor: humorSelecionado,
      emoji: emojiAtual,
      nota: notaHumor || null,
      data: hoje,
    });

    setHumorSalvo(true);
    setMostrarNotaHumor(false);
  }

  const saudacao = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="min-h-dvh bg-[#FAF4FF] pb-24">

      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <div className="flex justify-between items-start">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">{saudacao}{nomeUsuario ? `, ${nomeUsuario}` : ""}</p>
            <h1 className="text-white text-2xl font-light">Como você está hoje?</h1>
          </motion.div>
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-[#6B3FA0]/30 rounded-full px-3 py-1.5 mt-1">
              <span className="text-sm">🔥</span>
              <span className="text-white text-xs">{streak}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">

        {/* Registro de humor */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
        >
          {!humorSalvo ? (
            <>
              <p className="text-[#9B7BB8] text-xs tracking-widest uppercase mb-3">
                Como está seu relacionamento hoje?
              </p>
              <div className="flex justify-between">
                {emojisHumor.map(({ valor, emoji, label }) => (
                  <button
                    key={valor}
                    onClick={() => selecionarHumor(valor)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                      humorSelecionado === valor ? "bg-[#EDD5F5] scale-110" : "hover:bg-[#F0E2FB]"
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-[9px] text-[#9B7BB8]">{label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {mostrarNotaHumor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-4"
                  >
                    <textarea
                      value={notaHumor}
                      onChange={(e) => setNotaHumor(e.target.value)}
                      placeholder="O que aconteceu hoje? (opcional)"
                      rows={2}
                      className="w-full bg-[#FAF4FF] border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors mb-3"
                    />
                    <button onClick={salvarHumor} className="w-full bg-[#6B3FA0] text-white py-2.5 rounded-xl text-xs tracking-wide">
                      Registrar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <span className="text-2xl">{emojisHumor.find(h => h.valor === humorSelecionado)?.emoji}</span>
              <div>
                <p className="text-[#1A0A2E] text-sm font-medium">Humor registrado</p>
                <p className="text-[#9B7BB8] text-xs">Obrigado por compartilhar como está</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* CTA agendamento */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => router.push("/agenda")}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#1A0A2E] rounded-2xl p-4 flex justify-between items-center"
        >
          <div className="text-left">
            <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-0.5">Precisa de apoio?</p>
            <p className="text-white text-sm">Agendar sessão de orientação</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#6B3FA0]/40 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs">→</span>
          </div>
        </motion.button>

        {/* Trilha ativa */}
        {trilhasAtivas.map((trilha, i) => (
          <motion.button
            key={trilha.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            onClick={() => router.push(`/trilhas/${trilha.slug}`)}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)] text-left"
          >
            <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">Desafio ativo</p>
            <div className="flex gap-3 items-center mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6B3FA0, #B07FD4)" }}
              >
                {trilha.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1A0A2E] text-sm font-medium mb-0.5 truncate">{trilha.titulo}</p>
                <p className="text-[#9B7BB8] text-xs">{trilha.modulo} · {trilha.licao}</p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-[#EDD5F5] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#6B3FA0] to-[#B07FD4]"
                initial={{ width: 0 }}
                animate={{ width: `${trilha.progresso}%` }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[#9B7BB8] text-[10px]">{trilha.progresso}% concluído</span>
              <span className="text-[#6B3FA0] text-[10px] tracking-wide">Continuar →</span>
            </div>
          </motion.button>
        ))}

        {/* Desafio do dia */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#EDD5F5] rounded-2xl p-4 border-l-4 border-[#6B3FA0]"
        >
          <p className="text-[#6B3FA0] text-[10px] tracking-widest uppercase mb-2">✦ Desafio de hoje</p>
          <p className="text-[#1A0A2E] text-sm leading-relaxed">{desafioHoje}</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onClick={() => router.push("/trilhas")}
          className="w-full py-3.5 border border-[#EDD5F5] rounded-2xl text-[#6B3FA0] text-xs tracking-widest uppercase"
        >
          Ver todos os desafios
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
