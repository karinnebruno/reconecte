"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

const especializacoes = [
  "Neuropsicóloga",
  "Neurocientista",
  "Sexóloga",
  "Psicologia Analítica Junguiana",
];

const atuacoes = ["Terapeuta de casais", "Psicanalista"];

export default function SessaoPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[#FAF4FF] pb-10">

      <div className="bg-[#1A0A2E] px-5 pt-12 pb-8">
        <button onClick={() => router.back()} className="text-[#9B7BB8] text-sm mb-5 flex items-center gap-2">
          ← Voltar
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Sessão única de orientação</p>
          <h1 className="text-white text-2xl font-light">Baseada na psicoterapia breve</h1>
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
              <div className="flex flex-wrap gap-1 mt-1">
                {atuacoes.map(a => (
                  <span key={a} className="text-[9px] bg-[#EDD5F5] text-[#6B3FA0] px-2 py-0.5 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[#1A0A2E] text-sm leading-relaxed mb-4">
            Especialista em relacionamentos saudáveis, há anos ajuda casais e pessoas a se reconectarem emocionalmente, melhorarem a comunicação e construírem vínculos mais saudáveis.
          </p>

          <div className="border-t border-[#F0E2FB] pt-4">
            <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-2">Especializações</p>
            <div className="flex flex-wrap gap-2">
              {especializacoes.map(e => (
                <span key={e} className="text-[10px] bg-[#FAF4FF] border border-[#EDD5F5] text-[#6B3FA0] px-2 py-1 rounded-lg">{e}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Para quem é */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-[#EDD5F5] rounded-2xl p-5"
        >
          <p className="text-[#6B3FA0] text-[10px] tracking-widest uppercase mb-3">Para quem é essa sessão?</p>
          <p className="text-[#1A0A2E] text-sm leading-relaxed mb-3">
            A sessão pode ser <strong>individual</strong> — para quem quer entender melhor a si mesmo — ou <strong>em casal</strong> — para quem quer dar o primeiro passo junto.
          </p>
          <p className="text-[#1A0A2E] text-sm leading-relaxed">
            Alguém precisa dar o primeiro passo. Esse pode ser o seu. 💜
          </p>
        </motion.div>

        {/* Como funciona */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
        >
          <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">Como funciona</p>
          <div className="space-y-3">
            {[
              { n: "1", texto: "Escolha um dia e horário disponível" },
              { n: "2", texto: "Preencha seu nome e WhatsApp" },
              { n: "3", texto: "Realize o pagamento de R$ 250,00" },
              { n: "4", texto: "Confirmação via WhatsApp em até 24h" },
              { n: "5", texto: "Sessão online de 50 minutos pelo Google Meet" },
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
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3 pb-4"
        >
          <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <div>
              <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase">Valor da sessão</p>
              <p className="text-[#1A0A2E] text-2xl font-light mt-0.5">R$ 250,00</p>
            </div>
            <div className="text-right">
              <p className="text-[#9B7BB8] text-xs">50 min · Online</p>
              <p className="text-[#9B7BB8] text-xs">Individual ou em casal</p>
            </div>
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
