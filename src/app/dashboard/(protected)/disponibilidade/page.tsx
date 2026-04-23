"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Save } from "lucide-react";

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
  dia_semana: dia, hora_inicio: "09:00", hora_fim: "18:00", duracao_minutos: 50, ativo: true,
});

export default function DisponibilidadePage() {
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
    await supabase.from("availability").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (slots.length > 0) {
      await supabase.from("availability").insert(slots.map(({ id: _id, ...s }) => s));
    }
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  const diasAtivos = slots.map(s => s.dia_semana);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-[#1A0A2E] text-2xl font-semibold">Disponibilidade</h1>
        <p className="text-[#9B7BB8] text-sm mt-0.5">Dias e horários disponíveis para agendamento</p>
      </div>

      {/* Dias */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)] space-y-3">
        <p className="text-[#9B7BB8] text-[10px] tracking-widests uppercase">Dias disponíveis</p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {DIAS.map((dia, i) => (
            <button key={i} onClick={() => toggleDia(i)}
              className={`py-2.5 rounded-xl text-xs transition-all ${
                diasAtivos.includes(i)
                  ? "bg-[#6B3FA0] text-white"
                  : "bg-[#FAF4FF] border border-[#EDD5F5] text-[#9B7BB8] hover:border-[#6B3FA0]"
              }`}>
              {dia.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Horários */}
      {slots.map(slot => (
        <div key={slot.dia_semana} className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)] space-y-4">
          <p className="text-[#1A0A2E] text-sm font-semibold">{DIAS[slot.dia_semana]}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Início</label>
              <select value={slot.hora_inicio} onChange={e => atualizarSlot(slot.dia_semana, "hora_inicio", e.target.value)}
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0]">
                {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Fim</label>
              <select value={slot.hora_fim} onChange={e => atualizarSlot(slot.dia_semana, "hora_fim", e.target.value)}
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0]">
                {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Duração da sessão</label>
            <select value={slot.duracao_minutos} onChange={e => atualizarSlot(slot.dia_semana, "duracao_minutos", parseInt(e.target.value))}
              className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0]">
              <option value={30}>30 minutos</option>
              <option value={50}>50 minutos</option>
              <option value={60}>60 minutos</option>
              <option value={90}>90 minutos</option>
            </select>
          </div>
        </div>
      ))}

      {slots.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
          <p className="text-[#9B7BB8] text-sm">Selecione os dias disponíveis acima.</p>
        </div>
      )}

      {slots.length > 0 && (
        <button onClick={salvar} disabled={salvando}
          className="flex items-center gap-2 bg-[#6B3FA0] hover:bg-[#7D50B5] text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
          <Save size={14} />
          {salvo ? "Salvo!" : salvando ? "Salvando..." : "Salvar disponibilidade"}
        </button>
      )}
    </div>
  );
}
