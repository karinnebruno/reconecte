"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/ui";

const trilhas = [
  {
    slug: "comunicacao-sem-conflito",
    titulo: "Comunicação sem conflito",
    descricao: "Aprenda a expressar o que sente sem gerar brigas.",
    modulos: 5,
    licoes: 24,
    progresso: 45,
    emoji: "💬",
    premium: false,
  },
  {
    slug: "reconexao-emocional",
    titulo: "Reconexão emocional",
    descricao: "Recupere a intimidade e a cumplicidade do casal.",
    modulos: 4,
    licoes: 18,
    progresso: 0,
    emoji: "❤️",
    premium: false,
  },
  {
    slug: "clareza-para-decidir",
    titulo: "Clareza para decidir",
    descricao: "Entenda o que você quer e decida com mais segurança.",
    modulos: 3,
    licoes: 15,
    progresso: 0,
    emoji: "🧭",
    premium: false,
  },
  {
    slug: "amor-que-transforma",
    titulo: "Amor que transforma",
    descricao: "Construa padrões saudáveis e um amor que faz crescer.",
    modulos: 4,
    licoes: 20,
    progresso: 0,
    emoji: "🌱",
    premium: false,
  },
  {
    slug: "intimidade-e-confianca",
    titulo: "Intimidade & confiança",
    descricao: "Aprofunde a conexão e reconstrua a confiança.",
    modulos: 5,
    licoes: 22,
    progresso: 0,
    emoji: "🔒",
    premium: true,
  },
];

export default function TrilhasPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[#FAF4FF] pb-24">

      {/* Header */}
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Biblioteca</p>
          <h1 className="text-white text-2xl font-light">Trilhas de Aprendizado</h1>
        </motion.div>
      </div>

      <div className="px-5 pt-5 space-y-3">
        {trilhas.map((trilha, i) => (
          <motion.button
            key={trilha.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            whileTap={!trilha.premium ? { scale: 0.98 } : undefined}
            onClick={() => !trilha.premium && router.push(`/trilhas/${trilha.slug}`)}
            className={`w-full text-left rounded-2xl p-4 flex gap-3 items-center shadow-[0_2px_16px_rgba(26,10,46,0.06)] transition-all duration-200 ${
              trilha.premium ? "bg-[#F0E2FB] opacity-60" : "bg-white"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                trilha.premium ? "bg-[#EDD5F5]" : "bg-gradient-to-br from-[#6B3FA0] to-[#B07FD4]"
              }`}
            >
              {trilha.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <p className={`text-sm font-medium truncate ${trilha.premium ? "text-[#6B3FA0]" : "text-[#1A0A2E]"}`}>
                  {trilha.titulo}
                </p>
                {trilha.premium && (
                  <span className="flex-shrink-0 text-[9px] tracking-widest uppercase bg-[#6B3FA0]/20 text-[#6B3FA0] px-2 py-0.5 rounded-full">
                    Em breve
                  </span>
                )}
              </div>
              <p className="text-[#9B7BB8] text-xs mb-2">{trilha.modulos} módulos · {trilha.licoes} lições</p>
              {!trilha.premium && (
                <div className="w-full h-1 bg-[#EDD5F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6B3FA0] to-[#B07FD4] rounded-full transition-all duration-700"
                    style={{ width: `${trilha.progresso}%` }}
                  />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
