"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[#1A0A2E] flex flex-col">

      {/* Círculos decorativos */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full border border-[#6B3FA0]/20 pointer-events-none" />
      <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full border border-[#6B3FA0]/15 pointer-events-none" />

      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#9B7BB8] text-xs tracking-[0.25em] uppercase mb-2">
            Bem-vindo ao
          </p>
          <h1 className="text-white text-5xl font-light tracking-wide">
            reconecte
          </h1>
        </motion.div>
      </div>

      {/* Foto + apresentação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="px-6 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#6B3FA0]/50">
            <Image
              src="/foto_karinne.jpg"
              alt="Karinne Bruno"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Karinne Bruno</p>
            <p className="text-[#9B7BB8] text-xs leading-snug mt-0.5">
              Neuropsicóloga, sexóloga<br />e terapeuta de casais
            </p>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mb-10"
        >
          <h2 className="text-white text-3xl font-light leading-snug mb-4">
            Você está pronto para reconectar com quem ama?
          </h2>
          <p className="text-[#9B7BB8] text-sm leading-relaxed">
            Trilhas de aprendizado criadas por Karinne Bruno, neuropsicóloga, sexóloga e terapeuta de casais, para te ajudar a se comunicar melhor, entender o outro e construir um relacionamento mais saudável.
          </p>
        </motion.div>

        {/* Destaques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-3 mb-12"
        >
          {[
            { emoji: "📚", texto: "Trilhas com base científica" },
            { emoji: "🌱", texto: "Desafios diários para criar hábitos" },
            { emoji: "💬", texto: "Comunicação sem conflito" },
          ].map(({ emoji, texto }) => (
            <div key={texto} className="flex items-center gap-3">
              <span className="text-xl">{emoji}</span>
              <span className="text-white/80 text-sm">{texto}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="space-y-3"
        >
          <button
            onClick={() => router.push("/quiz")}
            className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm tracking-wide hover:bg-[#B07FD4] active:scale-95 transition-all duration-200"
          >
            Descobrir minha trilha
          </button>
          <button
            onClick={() => router.push("/entrar")}
            className="w-full text-[#9B7BB8] py-3 text-sm tracking-wide"
          >
            Já tenho conta
          </button>
        </motion.div>
      </div>
    </div>
  );
}
