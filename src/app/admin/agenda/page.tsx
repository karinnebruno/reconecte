"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const HORAS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

interface Slot {
  id?: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  duracao_minutos: number;
  ativo: boolean;
}

const slotVazio = (dia: number): Slot => ({
  dia_semana: dia,
  hora_inicio: "09:00",
  hora_fim: "18:00",
  duracao_minutos: 50,
  ativo: true,
});

export default function AdminAgenda() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("availability").select("*").order("dia_semana").then(({ data }) => {
      setSlots(data || []);
    });
  }, []);

  function toggleDia(dia: number) {
    const existe = slots.find(s => s.dia_semana === dia);
    if (existe) {
      setSlots(slots.filter(s => s.dia_semana !== dia));
    } else {
      setSlots([...slots, slotVazio(dia)].sort((a, b) => a.dia_semana - b.dia_semana));
    }
  }

  function atualizarSlot(dia: number, campo: keyof Slot, valor: string | number | boolean) {
    setSlots(slots.map(s => s.dia_semana === dia ? { ...s, [campo]: valor } : s));
  }

  async function salvar() {
    setSalvando(true);
    const supabase = createClient();

    // Apaga todos e reinsere
    await supabase.from("availability").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (slots.length > 0) {
      await supabase.from("availability").insert(
        slots.map(({ id: _id, ...s }) => s)
      );
    }

    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  const diasAtivos = slots.map(s => s.dia_semana);

  return (
    <div className="min-h-dvh bg-[#FAF4FF]">
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <button onClick={() => router.push("/admin")} className="text-[#9B7BB8] text-sm mb-5 flex items-center gap-2">
          ← Painel
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
          <h1 className="text-white text-2xl font-light">Disponibilidade</h1>
          <p className="text-[#9B7BB8] text-xs mt-1">Defina em quais dias e horários aceita agendamentos</p>
        </motion.div>
      </div>

      <div className="px-5 pt-5 pb-10 space-y-3">

        {/* Dias da semana */}
        <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase">Dias disponíveis</p>
        <div className="grid grid-cols-4 gap-2">
          {DIAS.map((dia, i) => (
            <button
              key={i}
              onClick={() => toggleDia(i)}
              className={`py-2.5 rounded-xl text-xs transition-all ${
                diasAtivos.includes(i)
                  ? "bg-[#6B3FA0] text-white"
                  : "bg-white border border-[#EDD5F5] text-[#9B7BB8]"
              }`}
            >
              {dia.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Horários por dia */}
        {slots.map((slot, i) => (
          <motion.div
            key={slot.dia_semana}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
          >
            <p className="text-[#1A0A2E] text-sm font-medium mb-4">{DIAS[slot.dia_semana]}</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">Início</label>
                <select
                  value={slot.hora_inicio}
                  onChange={e => atualizarSlot(slot.dia_semana, "hora_inicio", e.target.value)}
                  className="w-full bg-[#FAF4FF] border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0]"
                >
                  {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">Fim</label>
                <select
                  value={slot.hora_fim}
                  onChange={e => atualizarSlot(slot.dia_semana, "hora_fim", e.target.value)}
                  className="w-full bg-[#FAF4FF] border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0]"
                >
                  {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">Duração da sessão</label>
              <select
                value={slot.duracao_minutos}
                onChange={e => atualizarSlot(slot.dia_semana, "duracao_minutos", parseInt(e.target.value))}
                className="w-full bg-[#FAF4FF] border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0]"
              >
                <option value={30}>30 minutos</option>
                <option value={50}>50 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={90}>90 minutos</option>
              </select>
            </div>
          </motion.div>
        ))}

        {slots.length === 0 && (
          <div className="text-center py-8 text-[#9B7BB8] text-sm">
            Selecione ao menos um dia para definir horários.
          </div>
        )}

        {slots.length > 0 && (
          <button
            onClick={salvar}
            disabled={salvando}
            className={`w-full py-4 rounded-2xl text-sm tracking-wide transition-all duration-200 ${
              salvo ? "bg-green-600 text-white" : "bg-[#1A0A2E] text-white hover:bg-[#6B3FA0]"
            } disabled:opacity-60`}
          >
            {salvo ? "✓ Disponibilidade salva" : salvando ? "Salvando..." : "Salvar disponibilidade"}
          </button>
        )}
      </div>
    </div>
  );
}
