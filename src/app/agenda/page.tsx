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

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_COMPLETO = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

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

function gerarDiasMes(ano: number, mes: number): (Date | null)[] {
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const dias: (Date | null)[] = [];
  for (let i = 0; i < primeiroDia; i++) dias.push(null);
  for (let d = 1; d <= totalDias; d++) dias.push(new Date(ano, mes, d));
  return dias;
}

export default function AgendaPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [diasDisponiveis, setDiasDisponiveis] = useState<Set<string>>(new Set());
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() };
  });

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

      const diasSet = new Set((slotsData || []).map((s: Slot) => s.dia_semana));
      const disponiveisSet = new Set<string>();
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      for (let i = 1; i <= 60; i++) {
        const d = new Date(hoje);
        d.setDate(hoje.getDate() + i);
        if (diasSet.has(d.getDay())) {
          disponiveisSet.add(d.toDateString());
        }
      }
      setDiasDisponiveis(disponiveisSet);
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

    const horariosSupabase = gerarHorarios(slot, dia, ocupados);

    try {
      const dateStr = dia.toISOString().split("T")[0];
      const res = await fetch(`/api/google-busy?date=${dateStr}`);
      const { ocupados: googleOcupados } = await res.json();

      const livres = horariosSupabase.filter(hora => {
        const [h, m] = hora.split(":").map(Number);
        const inicioSlot = h * 60 + m;
        const fimSlot = inicioSlot + slot.duracao_minutos;
        return !googleOcupados.some((evento: { inicio: string; fim: string }) => {
          const [eh, em] = evento.inicio.split(":").map(Number);
          const [fh, fm] = evento.fim.split(":").map(Number);
          const inicioEvento = eh * 60 + em;
          const fimEvento = fh * 60 + fm;
          return inicioSlot < fimEvento && fimSlot > inicioEvento;
        });
      });

      setHorariosDisponiveis(livres);
    } catch {
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
      router.push(`/agenda/checkout?appointment=${data.id}`);
    } else {
      setConfirmando(false);
    }
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diasDoMes = gerarDiasMes(mesAtual.ano, mesAtual.mes);

  function navegarMes(direcao: number) {
    setMesAtual(prev => {
      let mes = prev.mes + direcao;
      let ano = prev.ano;
      if (mes > 11) { mes = 0; ano++; }
      if (mes < 0) { mes = 11; ano--; }
      return { ano, mes };
    });
    setDiaSelecionado(null);
    setHorarioSelecionado(null);
    setHorariosDisponiveis([]);
  }

  if (carregando) {
    return (
      <div className="min-h-dvh bg-[#FAF4FF] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
      </div>
    );
  }

  const slotSelecionado = diaSelecionado
    ? slots.find(s => s.dia_semana === diaSelecionado.getDay())
    : null;

  return (
    <div className="min-h-dvh bg-[#FAF4FF] pb-28">

      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Sessão de orientação</p>
          <h1 className="text-white text-2xl font-light">Agendar sessão</h1>
          <p className="text-[#9B7BB8] text-xs mt-1">Com Karinne Bruno · Neuropsicóloga</p>
        </motion.div>
      </div>

      <div className="px-5 pt-5 space-y-4">

        {diasDisponiveis.size === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-[#1A0A2E] text-sm font-medium mb-1">Sem horários disponíveis</p>
            <p className="text-[#9B7BB8] text-xs">Novos horários serão abertos em breve.</p>
          </div>
        ) : (
          <>
            {/* Calendário */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
            >
              {/* Navegação do mês */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navegarMes(-1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#9B7BB8] hover:bg-[#F0E2FB] transition-colors"
                >
                  ‹
                </button>
                <p className="text-[#1A0A2E] text-sm font-medium">
                  {MESES[mesAtual.mes]} {mesAtual.ano}
                </p>
                <button
                  onClick={() => navegarMes(1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#9B7BB8] hover:bg-[#F0E2FB] transition-colors"
                >
                  ›
                </button>
              </div>

              {/* Cabeçalho dos dias */}
              <div className="grid grid-cols-7 mb-2">
                {DIAS_SEMANA.map(d => (
                  <div key={d} className="text-center text-[#9B7BB8] text-[10px] font-medium pb-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid de dias */}
              <div className="grid grid-cols-7 gap-y-1">
                {diasDoMes.map((dia, i) => {
                  if (!dia) return <div key={`empty-${i}`} />;

                  const passado = dia < hoje;
                  const disponivel = diasDisponiveis.has(dia.toDateString());
                  const selecionado = diaSelecionado?.toDateString() === dia.toDateString();
                  const ehHoje = dia.toDateString() === hoje.toDateString();

                  return (
                    <button
                      key={dia.toISOString()}
                      disabled={passado || !disponivel}
                      onClick={() => selecionarDia(dia)}
                      className={`
                        relative flex flex-col items-center justify-center h-9 rounded-xl text-sm transition-all duration-150
                        ${selecionado ? "bg-[#6B3FA0] text-white" : ""}
                        ${!selecionado && disponivel && !passado ? "text-[#1A0A2E] hover:bg-[#F0E2FB]" : ""}
                        ${passado || !disponivel ? "text-[#D4C4E8] cursor-default" : "cursor-pointer"}
                      `}
                    >
                      <span className={`text-xs ${ehHoje && !selecionado ? "font-semibold text-[#6B3FA0]" : ""}`}>
                        {dia.getDate()}
                      </span>
                      {disponivel && !passado && !selecionado && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#6B3FA0]/40" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Horários */}
            <AnimatePresence>
              {diaSelecionado && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">
                    {DIAS_COMPLETO[diaSelecionado.getDay()]}, {diaSelecionado.getDate()} de {MESES[diaSelecionado.getMonth()]}
                  </p>

                  {horariosDisponiveis.length === 0 ? (
                    <div className="bg-white rounded-2xl p-5 text-center shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
                      <p className="text-[#9B7BB8] text-sm">Nenhum horário disponível neste dia.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {horariosDisponiveis.map(hora => (
                        <button
                          key={hora}
                          onClick={() => setHorarioSelecionado(hora)}
                          className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
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
                    <p className="text-[#6B3FA0] text-[10px] tracking-widest uppercase mb-2">Resumo</p>
                    <p className="text-[#1A0A2E] text-sm font-medium">
                      {DIAS_COMPLETO[diaSelecionado.getDay()]}, {diaSelecionado.getDate()} de {MESES[diaSelecionado.getMonth()]}
                    </p>
                    <p className="text-[#1A0A2E] text-sm">às {horarioSelecionado}</p>
                    <p className="text-[#9B7BB8] text-xs mt-1">
                      {slotSelecionado?.duracao_minutos} min · Sessão de orientação · R$ 250,00
                    </p>
                  </div>

                  <button
                    onClick={confirmarAgendamento}
                    disabled={confirmando}
                    className="w-full bg-[#1A0A2E] text-white py-4 rounded-2xl text-sm font-medium tracking-wide hover:bg-[#6B3FA0] transition-all duration-200 disabled:opacity-60"
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
