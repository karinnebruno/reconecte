"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import SessaoModal from "@/components/dashboard/SessaoModal";

interface Sessao {
  id: string;
  data_hora: string;
  tipo: string;
  presente: boolean | null;
  paciente_nome: string;
  paciente_id: string;
}

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function AgendaDashboard() {
  const hoje = new Date();
  const [mes, setMes] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() });
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(hoje);
  const [modalAberto, setModalAberto] = useState(false);
  const [sessaoSelecionada, setSessaoSelecionada] = useState<Sessao | null>(null);

  async function carregar() {
    const supabase = createClient();
    const inicio = new Date(mes.ano, mes.mes, 1).toISOString();
    const fim = new Date(mes.ano, mes.mes + 1, 0, 23, 59, 59).toISOString();
    const { data } = await supabase
      .from("clinical_sessions")
      .select("id, data_hora, tipo, presente, patients(id, nome)")
      .gte("data_hora", inicio)
      .lte("data_hora", fim)
      .order("data_hora");

    setSessoes(
      (data || []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        data_hora: s.data_hora as string,
        tipo: s.tipo as string,
        presente: s.presente as boolean | null,
        paciente_id: (s.patients as { id: string; nome: string } | null)?.id ?? "",
        paciente_nome: (s.patients as { id: string; nome: string } | null)?.nome ?? "—",
      }))
    );
  }

  useEffect(() => { carregar(); }, [mes]);

  // Gerar dias do calendário
  const primeiroDia = new Date(mes.ano, mes.mes, 1);
  const ultimoDia = new Date(mes.ano, mes.mes + 1, 0);
  const diasAntes = primeiroDia.getDay();
  const totalCelulas = Math.ceil((diasAntes + ultimoDia.getDate()) / 7) * 7;

  const diasCalendario: (Date | null)[] = [];
  for (let i = 0; i < diasAntes; i++) diasCalendario.push(null);
  for (let d = 1; d <= ultimoDia.getDate(); d++) diasCalendario.push(new Date(mes.ano, mes.mes, d));
  while (diasCalendario.length < totalCelulas) diasCalendario.push(null);

  const sessoesNoDia = (dia: Date) => sessoes.filter(s => {
    const d = new Date(s.data_hora);
    return d.getDate() === dia.getDate() && d.getMonth() === dia.getMonth() && d.getFullYear() === dia.getFullYear();
  });

  const sessoesDiaSelecionado = sessoesNoDia(diaSelecionado);

  async function marcarPresenca(id: string, presente: boolean) {
    const supabase = createClient();
    await supabase.from("clinical_sessions").update({ presente }).eq("id", id);
    setSessoes(prev => prev.map(s => s.id === id ? { ...s, presente } : s));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1A0A2E] text-2xl font-semibold">Agenda</h1>
          <p className="text-[#9B7BB8] text-sm mt-0.5">{sessoes.length} sessões em {MESES[mes.mes]}</p>
        </div>
        <button
          onClick={() => { setSessaoSelecionada(null); setModalAberto(true); }}
          className="flex items-center gap-2 bg-[#6B3FA0] hover:bg-[#7D50B5] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          Nova sessão
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendário */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_16px_rgba(26,10,46,0.06)] p-5">
          {/* Navegação */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMes(m => {
              const d = new Date(m.ano, m.mes - 1);
              return { ano: d.getFullYear(), mes: d.getMonth() };
            })} className="p-1.5 hover:bg-[#FAF4FF] rounded-lg text-[#9B7BB8] transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-[#1A0A2E] text-sm font-semibold">
              {MESES[mes.mes]} {mes.ano}
            </h2>
            <button onClick={() => setMes(m => {
              const d = new Date(m.ano, m.mes + 1);
              return { ano: d.getFullYear(), mes: d.getMonth() };
            })} className="p-1.5 hover:bg-[#FAF4FF] rounded-lg text-[#9B7BB8] transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Cabeçalho dias */}
          <div className="grid grid-cols-7 mb-2">
            {DIAS.map(d => (
              <div key={d} className="text-center text-[#9B7BB8] text-[10px] tracking-widest uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {diasCalendario.map((dia, i) => {
              if (!dia) return <div key={i} />;
              const ehHoje = dia.toDateString() === hoje.toDateString();
              const ehSelecionado = dia.toDateString() === diaSelecionado.toDateString();
              const qtdSessoes = sessoesNoDia(dia).length;
              return (
                <button
                  key={i}
                  onClick={() => setDiaSelecionado(dia)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
                    ehSelecionado
                      ? "bg-[#6B3FA0] text-white"
                      : ehHoje
                      ? "bg-[#EDD5F5] text-[#6B3FA0] font-semibold"
                      : "hover:bg-[#FAF4FF] text-[#1A0A2E]"
                  }`}
                >
                  <span>{dia.getDate()}</span>
                  {qtdSessoes > 0 && (
                    <span className={`text-[8px] mt-0.5 font-medium ${ehSelecionado ? "text-white/80" : "text-[#6B3FA0]"}`}>
                      {qtdSessoes}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sessões do dia */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(26,10,46,0.06)] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#F0E2FB]">
            <p className="text-[#1A0A2E] text-sm font-semibold">
              {diaSelecionado.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
            </p>
            <p className="text-[#9B7BB8] text-xs">{sessoesDiaSelecionado.length} sessão(ões)</p>
          </div>

          <div className="divide-y divide-[#F5F0FB] max-h-80 overflow-y-auto">
            {sessoesDiaSelecionado.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[#9B7BB8] text-sm">Sem sessões neste dia.</p>
              </div>
            ) : sessoesDiaSelecionado.map(s => (
              <div key={s.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[#1A0A2E] text-sm font-medium truncate">{s.paciente_nome}</p>
                  <span className="text-[#9B7BB8] text-xs flex-shrink-0 ml-2">
                    {new Date(s.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-[#9B7BB8] text-xs capitalize mb-2">{s.tipo}</p>
                {s.presente === null ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => marcarPresenca(s.id, true)}
                      className="flex-1 text-[10px] bg-green-50 text-green-700 py-1 rounded-lg hover:bg-green-100 transition-colors">
                      ✓ Presente
                    </button>
                    <button onClick={() => marcarPresenca(s.id, false)}
                      className="flex-1 text-[10px] bg-red-50 text-red-500 py-1 rounded-lg hover:bg-red-100 transition-colors">
                      ✗ Faltou
                    </button>
                  </div>
                ) : (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    s.presente ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                  }`}>
                    {s.presente ? "Presente" : "Faltou"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalAberto && (
        <SessaoModal
          dataSugerida={diaSelecionado}
          onClose={() => setModalAberto(false)}
          onSalvo={() => { setModalAberto(false); carregar(); }}
        />
      )}
    </div>
  );
}
