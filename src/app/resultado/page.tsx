"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Trilha {
  titulo: string;
  descricao: string;
  slug: string;
}

export default function ResultadoPage() {
  const router = useRouter();
  const [trilha, setTrilha] = useState<Trilha | null>(null);

  useEffect(() => {
    const salva = sessionStorage.getItem("trilha_recomendada");
    if (salva) {
      setTrilha(JSON.parse(salva));
    } else {
      router.push("/quiz");
    }
  }, [router]);

  if (!trilha) return null;

  return (
    <div className="min-h-dvh bg-[#1A0A2E] flex flex-col">

      {/* Círculos decorativos */}
      <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full border border-[#6B3FA0]/20 pointer-events-none" />
      <div className="absolute bottom-[-20px] left-[-20px] w-36 h-36 rounded-full border border-[#6B3FA0]/15 pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center px-6 pb-8 pt-16">

        {/* Animação de confirmação */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-[#6B3FA0]/20 border border-[#6B3FA0]/40 flex items-center justify-center mb-8"
        >
          <span className="text-4xl">✦</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-3">
            Sua trilha terapêutica foi traçada
          </p>
          <h2 className="text-white text-4xl font-light leading-tight mb-4">
            {trilha.titulo}
          </h2>
          <p className="text-[#9B7BB8] text-sm leading-relaxed mb-10">
            {trilha.descricao}
          </p>
        </motion.div>

        {/* O que você vai encontrar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-[#6B3FA0]/10 border border-[#6B3FA0]/20 rounded-2xl p-5 mb-10"
        >
          <p className="text-[#B07FD4] text-xs tracking-widest uppercase mb-3">O que você vai encontrar</p>
          <div className="space-y-2">
            {[
              "Módulos com lições de 5 minutos",
              "Desafios práticos para o dia a dia",
              "Exercícios de reflexão e comunicação",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="text-[#6B3FA0] mt-0.5">—</span>
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="space-y-3"
        >
          <button
            onClick={() => router.push("/entrar?modo=cadastro")}
            className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm tracking-wide hover:bg-[#B07FD4] active:scale-95 transition-all duration-200"
          >
            Quero começar minha jornada
          </button>
          <button
            onClick={() => router.push("/entrar")}
            className="w-full text-[#9B7BB8] py-3 text-sm tracking-wide"
          >
            Já tenho conta — entrar
          </button>
        </motion.div>
      </div>
    </div>
  );
}
