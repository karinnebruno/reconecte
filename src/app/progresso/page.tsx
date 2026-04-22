"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BottomNav } from "@/components/ui";

interface MoodEntry {
  id: string;
  data: string;
  humor: number;
  emoji: string;
  nota: string | null;
}

const emojisHumor = [
  { valor: 1, emoji: "😔", label: "Difícil", cor: "#F87171" },
  { valor: 2, emoji: "😕", label: "Complicado", cor: "#FB923C" },
  { valor: 3, emoji: "😐", label: "Neutro", cor: "#FBBF24" },
  { valor: 4, emoji: "🙂", label: "Bem", cor: "#34D399" },
  { valor: 5, emoji: "😄", label: "Ótimo", cor: "#6B3FA0" },
];

const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

export default function ProgressoPage() {
  const router = useRouter();
  const [entradas, setEntradas] = useState<MoodEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [mediaHumor, setMediaHumor] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/entrar"); return; }

      const { data: moodData } = await supabase
        .from("mood_entries")
        .select("id, data, humor, emoji, nota")
        .eq("user_id", user.id)
        .order("data", { ascending: false });

      const { data: streakData } = await supabase
        .from("streaks")
        .select("current_streak")
        .eq("user_id", user.id)
        .single();

      const lista = moodData || [];
      setEntradas(lista);
      if (streakData) setStreak(streakData.current_streak);

      if (lista.length > 0) {
        const media = lista.reduce((acc, e) => acc + e.humor, 0) / lista.length;
        setMediaHumor(Math.round(media * 10) / 10);
      }

      setCarregando(false);
    }
    carregar();
  }, [router]);

  if (carregando) {
    return (
      <div className="min-h-dvh bg-[#FAF4FF] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
      </div>
    );
  }

  const emojiMedia = emojisHumor.reduce((prev, curr) =>
    Math.abs(curr.valor - mediaHumor) < Math.abs(prev.valor - mediaHumor) ? curr : prev
  );

  return (
    <div className="min-h-dvh bg-[#FAF4FF] pb-28">

      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Sua jornada</p>
          <h1 className="text-white text-2xl font-light">Diário & Progresso</h1>
        </motion.div>
      </div>

      <div className="px-5 pt-5 space-y-4">

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
          >
            <span className="text-2xl">🔥</span>
            <p className="text-[#1A0A2E] text-2xl font-light mt-2">{streak}</p>
            <p className="text-[#9B7BB8] text-xs mt-0.5">dias seguidos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
          >
            <span className="text-2xl">{entradas.length > 0 ? emojiMedia.emoji : "📓"}</span>
            <p className="text-[#1A0A2E] text-2xl font-light mt-2">{entradas.length}</p>
            <p className="text-[#9B7BB8] text-xs mt-0.5">registros no diário</p>
          </motion.div>
        </div>

        {/* Mini gráfico de humor */}
        {entradas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
          >
            <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-4">Humor nos últimos 14 dias</p>
            <div className="flex items-end gap-1 h-12">
              {entradas.slice(0, 14).reverse().map((entrada, i) => {
                const info = emojisHumor.find(e => e.valor === entrada.humor);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(entrada.humor / 5) * 40}px` }}
                      transition={{ delay: i * 0.03, duration: 0.4 }}
                      className="w-full rounded-t-sm"
                      style={{ backgroundColor: info?.cor || "#6B3FA0", opacity: 0.7 }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[#9B7BB8] text-[9px]">14 dias atrás</span>
              <span className="text-[#9B7BB8] text-[9px]">hoje</span>
            </div>
          </motion.div>
        )}

        {/* Lista de entradas */}
        <div>
          <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">Entradas do diário</p>

          {entradas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
              <p className="text-3xl mb-3">📓</p>
              <p className="text-[#1A0A2E] text-sm font-medium mb-1">Nenhum registro ainda</p>
              <p className="text-[#9B7BB8] text-xs">Registre seu humor na tela inicial todos os dias.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entradas.map((entrada, i) => {
                const info = emojisHumor.find(e => e.valor === entrada.humor);
                const data = new Date(entrada.data + "T12:00:00");
                return (
                  <motion.div
                    key={entrada.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: `${info?.cor}20` }}
                      >
                        {entrada.emoji || info?.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[#1A0A2E] text-sm font-medium">{info?.label}</p>
                          <span className="text-[#9B7BB8] text-[10px]">
                            {data.getDate()} {MESES[data.getMonth()]}
                          </span>
                        </div>
                        {entrada.nota && (
                          <p className="text-[#9B7BB8] text-xs mt-1 leading-relaxed">{entrada.nota}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
