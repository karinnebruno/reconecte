"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-dvh bg-[#1A0A2E]">
      <AnimatePresence mode="wait">
        {!splashDone ? (
          <motion.div
            key="splash"
            className="min-h-dvh bg-[#1A0A2E] flex flex-col items-center justify-center"
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
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-dvh bg-[#1A0A2E] flex flex-col"
          >
            <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full border border-[#6B3FA0]/15 pointer-events-none" />
            <div className="absolute top-[-40px] right-[-40px] w-52 h-52 rounded-full border border-[#6B3FA0]/10 pointer-events-none" />

            <div className="px-6 pt-14 pb-4">
              <p className="text-[#9B7BB8] text-xs tracking-[0.25em] uppercase mb-2">Bem-vindo ao</p>
              <h1 className="text-white text-5xl font-light tracking-wide">reconecte</h1>
            </div>

            {/* Karinne */}
            <div className="px-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#6B3FA0]/50">
                  <Image src="/foto_karinne.jpg" alt="Karinne Bruno" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Karinne Bruno</p>
                  <p className="text-[#9B7BB8] text-xs leading-snug mt-0.5">
                    Neuropsicóloga, sexóloga<br />e terapeuta de casais
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 pb-8">
              <div className="mb-10">
                <h2 className="text-white text-3xl font-light leading-snug mb-4">
                  Construa uma rotina saudável com quem você ama.
                </h2>
                <p className="text-[#9B7BB8] text-sm leading-relaxed">
                  Desafios diários criados por Karinne Bruno, neuropsicóloga, sexóloga e terapeuta de casais, para te ajudar a se comunicar melhor, reconectar emocionalmente e fortalecer seu relacionamento.
                </p>
              </div>

              <div className="space-y-3 mb-12">
                {[
                  { emoji: "🌱", texto: "Desafios diários para criar hábitos saudáveis" },
                  { emoji: "💬", texto: "Comunicação e conexão emocional" },
                  { emoji: "📚", texto: "Conteúdo com base científica" },
                ].map(({ emoji, texto }) => (
                  <div key={texto} className="flex items-center gap-3">
                    <span className="text-xl">{emoji}</span>
                    <span className="text-white/80 text-sm">{texto}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push("/quiz")}
                  className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm font-medium tracking-wide hover:bg-[#B07FD4] active:scale-95 transition-all duration-200"
                >
                  Descobrir meu desafio
                </button>
                <button
                  onClick={() => router.push("/entrar")}
                  className="w-full text-[#9B7BB8] py-3 text-sm tracking-wide"
                >
                  Já tenho conta
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
