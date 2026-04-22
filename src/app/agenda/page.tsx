"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BottomNav } from "@/components/ui";

interface Slot {
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  duracao_minutos: number;
}

interface Horario {
  data: Date;
  hora: string;
  label: string;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function gerarHorarios(slot: Slot, data: Date, ocupados: string[]): string[] {
  const horarios: string[] = [];
  const [hIni, mIni] = slot.hora_inicio.split(":").map(Number);
  const [hFim, mFim] = slot.hora_fim.split(":").map(Number);
  let atual = hIni * 60 + mIni;
  const fim = hFim * 60 + mFim;

  while (atual + slot.duracao_minutos <= fim) {
    const h = String(Math.floor(atual / 60)).padStart(2, "0");
    const m = String(atual % 60).padStart(2, "0");
    const label = `${h}:${m}`;
    const dataHora = `${data.toISOString().split("T")[0]}T${label}`;
    if (!ocupados.includes(dataHora)) horarios.push(label);
    atual += slot.duracao_minutos;
  }
  return horarios;
}

export default function AgendaPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [diasDisponiveis, setDiasDisponiveis] = useState<Date[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/entrar"); return; }
      setUserId(user.id);

      const { data: slotsData } = await supabase
        .from("availability")
        .select("dia_semana, hora_inicio, hora_fim, duracao_minutos")
        .eq("ativo", true);

      const { data: agendamentos } = await supabase
        .from("appointments")
        .select("data_hora")
        .in("status", ["pending", "confirmed"]);

      const ocupadosStr = (agendamentos || []).map(a =>
        new Date(a.data_hora).toISOString().slice(0, 16)
      );
      setOcupados(ocupadosStr);
      setSlots(slotsData || []);

      // Gera próximos 30 dias disponíveis
      const diasSet = new Set((slotsData || []).map(s => s.dia_semana));
      const dias: Date[] = [];
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      for (let i = 1; i <= 30; i++) {
        const d = new Date(hoje);
        d.setDate(hoje.getDate() + i);
        if (diasSet.has(d.getDay())) dias.push(d);
      }
      setDiasDisponiveis(dias);
      setCarregando(false);
    }
    carregar();
  }, [router]);

  async function selecionarDia(dia: Date) {
    setDiaSelecionado(dia);
    setHorarioSelecionado(null);
    setHorariosDisponiveis([]);

    const slot = slots.find(s => s.dia_semana === dia.getDay());
    if (!slot) return;

    // Busca horários já agendados no Supabase
    const horariosSupabase = gerarHorarios(slot, dia, ocupados);

    // Consulta Google Calendar para remover horários ocupados
    try {
      const dateStr = dia.toISOString().split("T")[0];
      const res = await fetch(`/api/google-busy?date=${dateStr}`);
      const { ocupados: googleOcupados } = await res.json();

      // Filtra horários que conflitam com eventos do Google
      const livres = horariosSupabase.filter(hora => {
        const [h, m] = hora.split(":").map(Number);
        const inicioSlot = h * 60 + m;
        const fimSlot = inicioSlot + slot.duracao_minutos;

        return !googleOcupados.some((evento: { inicio: string; fim: string }) => {
          const [eh, em] = evento.inicio.split(":").map(Number);
          const [fh, fm] = evento.fim.split(":").map(Number);
          const inicioEvento = eh * 60 + em;
          const fimEvento = fh * 60 + fm;
          // Conflita se houver qualquer sobreposição
          return inicioSlot < fimEvento && fimSlot > inicioEvento;
        });
      });

      setHorariosDisponiveis(livres);
    } catch {
      // Se Google Calendar falhar, mostra os horários do Supabase mesmo assim
      setHorariosDisponiveis(horariosSupabase);
    }
  }

  async function confirmarAgendamento() {
    if (!diaSelecionado || !horarioSelecionado || !userId) return;
    setConfirmando(true);

    const [h, m] = horarioSelecionado.split(":").map(Number);
    const dataHora = new Date(diaSelecionado);
    dataHora.setHours(h, m, 0, 0);

    const supabase = createClient();
    const { data } = await supabase.from("appointments").insert({
      user_id: userId,
      data_hora: dataHora.toISOString(),
      status: "pending",
    }).select().single();

    if (data) {
      // Redireciona para checkout Stripe
      router.push(`/agenda/checkout?appointment=${data.id}`);
    } else {
      setConfirmando(false);
    }
  }

  if (carregando) {
    return (
      <div className="min-h-dvh bg-[#FAF4FF] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FAF4FF] pb-24">

      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Sessão de orientação</p>
          <h1 className="text-white text-2xl font-light">Agendar sessão</h1>
          <p className="text-[#9B7BB8] text-xs mt-1">Com Karinne Bruno · Neuropsicóloga</p>
        </motion.div>
      </div>

      <div className="px-5 pt-5 space-y-5 pb-8">

        {diasDisponiveis.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-[#1A0A2E] text-sm font-medium mb-1">Sem horários disponíveis</p>
            <p className="text-[#9B7BB8] text-xs">Novos horários serão abertos em breve.</p>
          </div>
        ) : (
          <>
            {/* Seleção de dia */}
            <div>
              <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">Escolha o dia</p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
                {diasDisponiveis.map((dia, i) => {
                  const ativo = diaSelecionado?.toDateString() === dia.toDateString();
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => selecionarDia(dia)}
                      className={`flex-shrink-0 flex flex-col items-center w-14 py-3 rounded-2xl transition-all duration-200 ${
                        ativo ? "bg-[#6B3FA0] text-white" : "bg-white border border-[#EDD5F5] text-[#1A0A2E]"
                      }`}
                    >
                      <span className={`text-[9px] tracking-wider uppercase ${ativo ? "text-[#D4BBEE]" : "text-[#9B7BB8]"}`}>
                        {DIAS_SEMANA[dia.getDay()]}
                      </span>
                      <span className="text-lg font-light mt-0.5">{dia.getDate()}</span>
                      <span className={`text-[9px] ${ativo ? "text-[#D4BBEE]" : "text-[#9B7BB8]"}`}>
                        {MESES[dia.getMonth()]}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de horário */}
            <AnimatePresence>
              {diaSelecionado && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">
                    Horários disponíveis
                  </p>

                  {horariosDisponiveis.length === 0 ? (
                    <p className="text-[#9B7BB8] text-sm text-center py-4">
                      Nenhum horário disponível neste dia.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {horariosDisponiveis.map(hora => (
                        <button
                          key={hora}
                          onClick={() => setHorarioSelecionado(hora)}
                          className={`py-3 rounded-xl text-sm transition-all duration-200 ${
                            horarioSelecionado === hora
                              ? "bg-[#6B3FA0] text-white"
                              : "bg-white border border-[#EDD5F5] text-[#1A0A2E] hover:border-[#6B3FA0]"
                          }`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resumo e confirmação */}
            <AnimatePresence>
              {diaSelecionado && horarioSelecionado && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="bg-[#EDD5F5] rounded-2xl p-4">
                    <p className="text-[#6B3FA0] text-[10px] tracking-widest uppercase mb-2">Resumo do agendamento</p>
                    <p className="text-[#1A0A2E] text-sm font-medium">
                      {DIAS_SEMANA[diaSelecionado.getDay()]}, {diaSelecionado.getDate()} de {MESES[diaSelecionado.getMonth()]}
                    </p>
                    <p className="text-[#1A0A2E] text-sm">às {horarioSelecionado}</p>
                    <p className="text-[#9B7BB8] text-xs mt-1">
                      {slots.find(s => s.dia_semana === diaSelecionado.getDay())?.duracao_minutos} minutos · Sessão de orientação
                    </p>
                  </div>

                  <button
                    onClick={confirmarAgendamento}
                    disabled={confirmando}
                    className="w-full bg-[#1A0A2E] text-white py-4 rounded-2xl text-sm tracking-wide hover:bg-[#6B3FA0] transition-all duration-200 disabled:opacity-60"
                  >
                    {confirmando ? "Aguarde..." : "Continuar para pagamento →"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
