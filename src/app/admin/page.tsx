"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface Stats {
  usuarios: number;
  trilhas: number;
  agendamentos: number;
  humores: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ usuarios: 0, trilhas: 0, agendamentos: 0, humores: 0 });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function carregar() {
      const [
        { count: usuarios },
        { count: trilhas },
        { count: agendamentos },
        { count: humores },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).neq("role", "admin"),
        supabase.from("tracks").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("mood_entries").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        usuarios: usuarios || 0,
        trilhas: trilhas || 0,
        agendamentos: agendamentos || 0,
        humores: humores || 0,
      });
      setCarregando(false);
    }
    carregar();
  }, []);

  const cards = [
    { label: "Usuários", valor: stats.usuarios, emoji: "👤", href: null },
    { label: "Trilhas", valor: stats.trilhas, emoji: "📚", href: "/admin/trilhas" },
    { label: "Agendamentos", valor: stats.agendamentos, emoji: "📅", href: null },
    { label: "Registros de humor", valor: stats.humores, emoji: "💜", href: null },
  ];

  const acoes = [
    { label: "Gerenciar trilhas", desc: "Criar e editar trilhas, módulos e lições", emoji: "📚", href: "/admin/trilhas" },
    { label: "Minha disponibilidade", desc: "Dias e horários que você atende", emoji: "🗓️", href: "/admin/agenda" },
    { label: "Ver agendamentos", desc: "Sessões marcadas e pendentes", emoji: "📅", href: "/admin/agendamentos" },
    { label: "Mensagens", desc: "Conversas com usuários", emoji: "💬", href: "/mensagens" },
  ];

  return (
    <div className="min-h-dvh bg-[#FAF4FF]">
      {/* Header */}
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <div className="flex justify-between items-start">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Painel</p>
            <h1 className="text-white text-2xl font-light">Gestão Reconecte</h1>
          </motion.div>
          <button
            onClick={() => router.push("/home")}
            className="text-[#9B7BB8] text-xs mt-2 tracking-wide"
          >
            ← App
          </button>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5 pb-10">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card, i) => (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => card.href && router.push(card.href)}
              className={`bg-white rounded-2xl p-4 text-left shadow-[0_2px_16px_rgba(26,10,46,0.06)] ${card.href ? "hover:border-[#6B3FA0] border border-transparent" : ""}`}
            >
              <span className="text-2xl">{card.emoji}</span>
              <p className="text-[#1A0A2E] text-2xl font-light mt-2">
                {carregando ? "—" : card.valor}
              </p>
              <p className="text-[#9B7BB8] text-xs mt-0.5">{card.label}</p>
            </motion.button>
          ))}
        </div>

        {/* Ações rápidas */}
        <div>
          <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">Ações rápidas</p>
          <div className="space-y-3">
            {acoes.map((acao, i) => (
              <motion.button
                key={acao.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                onClick={() => acao.href && router.push(acao.href)}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)] text-left ${!acao.href ? "opacity-50" : ""}`}
              >
                <div className="w-11 h-11 rounded-xl bg-[#EDD5F5] flex items-center justify-center text-xl flex-shrink-0">
                  {acao.emoji}
                </div>
                <div>
                  <p className="text-[#1A0A2E] text-sm font-medium">{acao.label}</p>
                  <p className="text-[#9B7BB8] text-xs mt-0.5">{acao.desc}</p>
                </div>
                {acao.href && <span className="text-[#9B7BB8] text-xs ml-auto">→</span>}
                {!acao.href && <span className="text-[#9B7BB8] text-[10px] ml-auto">Em breve</span>}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
