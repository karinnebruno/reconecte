"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

const topicos = [
  { emoji: "💬", titulo: "Comunicação no casal", desc: "Aprenda a expressar o que sente sem gerar conflito" },
  { emoji: "❤️", titulo: "Intimidade e reconexão", desc: "Recupere a cumplicidade e a alegria de estar junto" },
  { emoji: "🧠", titulo: "Inteligência emocional", desc: "Entenda seus padrões e os do seu parceiro(a)" },
  { emoji: "🌱", titulo: "Construção de hábitos", desc: "Crie uma rotina saudável e sustentável a dois" },
];

export default function SessaoPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[#FAF4FF] pb-10">

      <div className="bg-[#1A0A2E] px-5 pt-12 pb-8">
        <button onClick={() => router.back()} className="text-[#9B7BB8] text-sm mb-5 flex items-center gap-2">
          ← Voltar
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Sessão de orientação</p>
          <h1 className="text-white text-2xl font-light">Como posso te ajudar</h1>
        </motion.div>
      </div>

      <div className="px-5 pt-6 space-y-5">

        {/* Karinne card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
        >
          <div className="flex gap-4 items-center mb-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
              <Image src="/foto_karinne.jpg" alt="Karinne Bruno" fill className="object-cover" />
            </div>
            <div>
              <p className="text-[#1A0A2E] text-base font-medium">Dra. Karinne Bruno</p>
              <p className="text-[#9B7BB8] text-xs mt-0.5 leading-snug">
                Neuropsicóloga · Sexóloga<br />Terapeuta de Casais
              </p>
            </div>
          </div>
          <p className="text-[#1A0A2E] text-sm leading-relaxed">
            Sou especialista em relacionamentos saudáveis e há mais de 10 anos ajudo casais a se reconectarem emocionalmente, melhorarem a comunicação e construírem uma vida a dois com mais leveza e propósito.
          </p>
          <div className="mt-4 pt-4 border-t border-[#F0E2FB] flex gap-4">
            <div className="text-center">
              <p className="text-[#1A0A2E] text-lg font-light">10+</p>
              <p className="text-[#9B7BB8] text-[10px]">anos de experiência</p>
            </div>
            <div className="text-center">
              <p className="text-[#1A0A2E] text-lg font-light">500+</p>
              <p className="text-[#9B7BB8] text-[10px]">casais atendidos</p>
            </div>
            <div className="text-center">
              <p className="text-[#1A0A2E] text-lg font-light">3</p>
              <p className="text-[#9B7BB8] text-[10px]">especializações</p>
            </div>
          </div>
        </motion.div>

        {/* O que abordamos */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">O que podemos trabalhar</p>
          <div className="grid grid-cols-2 gap-2">
            {topicos.map((t, i) => (
              <motion.div
                key={t.titulo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
              >
                <span className="text-2xl">{t.emoji}</span>
                <p className="text-[#1A0A2E] text-xs font-medium mt-2">{t.titulo}</p>
                <p className="text-[#9B7BB8] text-[10px] mt-0.5 leading-snug">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Como funciona */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#EDD5F5] rounded-2xl p-5"
        >
          <p className="text-[#6B3FA0] text-[10px] tracking-widest uppercase mb-3">Como funciona</p>
          <div className="space-y-3">
            {[
              { n: "1", texto: "Escolha um dia e horário disponível" },
              { n: "2", texto: "Realize o pagamento de R$ 250,00" },
              { n: "3", texto: "Receba a confirmação por e-mail" },
              { n: "4", texto: "Sessão online de 50 minutos via Google Meet" },
            ].map(({ n, texto }) => (
              <div key={n} className="flex gap-3 items-center">
                <div className="w-6 h-6 rounded-full bg-[#6B3FA0] text-white text-xs flex items-center justify-center flex-shrink-0 font-medium">
                  {n}
                </div>
                <p className="text-[#1A0A2E] text-sm">{texto}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3 pb-4"
        >
          <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <div>
              <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase">Valor da sessão</p>
              <p className="text-[#1A0A2E] text-2xl font-light mt-0.5">R$ 250,00</p>
            </div>
            <p className="text-[#9B7BB8] text-xs text-right">50 min<br />Online</p>
          </div>

          <button
            onClick={() => router.push("/agenda")}
            className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm font-medium tracking-wide hover:bg-[#B07FD4] active:scale-95 transition-all duration-200"
          >
            Escolher meu horário →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
