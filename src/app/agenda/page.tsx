"use client";

import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui";

export default function AgendaPage() {
  return (
    <div className="min-h-dvh bg-[#FAF4FF] pb-24">
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Sessão de orientação</p>
          <h1 className="text-white text-2xl font-light">Agendar sessão</h1>
        </motion.div>
      </div>
      <div className="px-5 pt-8">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(26,10,46,0.06)] text-center">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-[#1A0A2E] text-base font-medium mb-2">Integração com Google Calendar</p>
          <p className="text-[#9B7BB8] text-sm leading-relaxed">
            Em breve você poderá ver os horários disponíveis e agendar sua sessão diretamente aqui.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
