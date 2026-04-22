"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Users, CalendarDays, DollarSign, TrendingUp, Clock, AlertCircle } from "lucide-react";

interface Stats {
  totalPacientes: number;
  pacientesAtivos: number;
  sessoesHoje: number;
  sессoesMes: number;
  receitaMes: number;
  despesasMes: number;
  sessoesPendentes: number;
}

interface ProximaSessao {
  id: string;
  data_hora: string;
  paciente_nome: string;
  tipo: string;
  presente: boolean | null;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({
    totalPacientes: 0,
    pacientesAtivos: 0,
    sessoesHoje: 0,
    sессoesMes: 0,
    receitaMes: 0,
    despesasMes: 0,
    sessoesPendentes: 0,
  });
  const [proximas, setProximas] = useState<ProximaSessao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const supabase = createClient();
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
      const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).toISOString();
      const fimHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59).toISOString();

      const [
        { count: totalPacientes },
        { count: pacientesAtivos },
        { count: sessoesHoje },
        { count: sessoesMes },
        { data: entradas },
        { data: saidas },
        { count: sessoesPendentes },
        { data: proximasList },
      ] = await Promise.all([
        supabase.from("patients").select("*", { count: "exact", head: true }),
        supabase.from("patients").select("*", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("clinical_sessions").select("*", { count: "exact", head: true }).gte("data_hora", inicioHoje).lte("data_hora", fimHoje),
        supabase.from("clinical_sessions").select("*", { count: "exact", head: true }).gte("data_hora", inicioMes).lte("data_hora", fimMes),
        supabase.from("financial_entries").select("valor").eq("tipo", "entrada").gte("data", inicioMes).lte("data", fimMes),
        supabase.from("financial_entries").select("valor").eq("tipo", "saida").gte("data", inicioMes).lte("data", fimMes),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("clinical_sessions")
          .select("id, data_hora, tipo, presente, patients(nome)")
          .gte("data_hora", new Date().toISOString())
          .order("data_hora")
          .limit(5),
      ]);

      const receitaMes = (entradas || []).reduce((s, e) => s + (Number(e.valor) || 0), 0);
      const despesasMes = (saidas || []).reduce((s, e) => s + (Number(e.valor) || 0), 0);

      setStats({
        totalPacientes: totalPacientes || 0,
        pacientesAtivos: pacientesAtivos || 0,
        sessoesHoje: sessoesHoje || 0,
        sессoesMes: sessoesMes || 0,
        receitaMes,
        despesasMes,
        sessoesPendentes: sessoesPendentes || 0,
      });

      setProximas(
        (proximasList || []).map((s: Record<string, unknown>) => ({
          id: s.id as string,
          data_hora: s.data_hora as string,
          tipo: s.tipo as string,
          presente: s.presente as boolean | null,
          paciente_nome: (s.patients as { nome?: string } | null)?.nome ?? "—",
        }))
      );
      setCarregando(false);
    }
    carregar();
  }, []);

  const lucroMes = stats.receitaMes - stats.despesasMes;

  const kpis = [
    {
      label: "Pacientes ativos",
      valor: carregando ? "—" : stats.pacientesAtivos,
      sub: `${stats.totalPacientes} total`,
      icon: Users,
      cor: "text-[#6B3FA0]",
      bg: "bg-[#EDD5F5]",
    },
    {
      label: "Sessões hoje",
      valor: carregando ? "—" : stats.sessoesHoje,
      sub: `${stats.sессoesMes} no mês`,
      icon: CalendarDays,
      cor: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Receita do mês",
      valor: carregando ? "—" : `R$ ${stats.receitaMes.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
      sub: `Despesas: R$ ${stats.despesasMes.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
      icon: DollarSign,
      cor: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Lucro do mês",
      valor: carregando ? "—" : `R$ ${lucroMes.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
      sub: lucroMes >= 0 ? "Positivo ✓" : "Negativo ⚠",
      icon: TrendingUp,
      cor: lucroMes >= 0 ? "text-green-600" : "text-red-500",
      bg: lucroMes >= 0 ? "bg-green-50" : "bg-red-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-[#1A0A2E] text-2xl font-semibold">Visão geral</h1>
        <p className="text-[#9B7BB8] text-sm mt-0.5">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Alerta pendentes */}
      {stats.sessoesPendentes > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <AlertCircle size={16} className="text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-800 text-sm">
            <strong>{stats.sessoesPendentes}</strong> agendamento{stats.sessoesPendentes > 1 ? "s" : ""} aguardando confirmação no app.
          </p>
          <a href="/dashboard/agenda" className="text-yellow-700 text-xs underline ml-auto whitespace-nowrap">Ver agenda →</a>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, valor, sub, icon: Icon, cor, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={cor} strokeWidth={1.5} />
            </div>
            <p className="text-[#1A0A2E] text-2xl font-light">{valor}</p>
            <p className="text-[#1A0A2E] text-xs font-medium mt-1">{label}</p>
            <p className="text-[#9B7BB8] text-[11px] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Próximas sessões */}
      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(26,10,46,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F0E2FB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-[#6B3FA0]" strokeWidth={1.5} />
            <h2 className="text-[#1A0A2E] text-sm font-semibold">Próximas sessões</h2>
          </div>
          <a href="/dashboard/agenda" className="text-[#6B3FA0] text-xs hover:underline">Ver agenda →</a>
        </div>

        {proximas.length === 0 && !carregando ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[#9B7BB8] text-sm">Nenhuma sessão agendada.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F0FB]">
            {proximas.map(s => {
              const d = new Date(s.data_hora);
              return (
                <div key={s.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EDD5F5] flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[#1A0A2E] text-base font-light leading-none">{d.getDate()}</span>
                    <span className="text-[#6B3FA0] text-[9px] uppercase">
                      {d.toLocaleString("pt-BR", { month: "short" })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A0A2E] text-sm font-medium truncate">{s.paciente_nome}</p>
                    <p className="text-[#9B7BB8] text-xs">
                      {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                      {s.tipo === "casal" ? "Casal" : "Individual"}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full flex-shrink-0 ${
                    s.presente === true
                      ? "bg-green-100 text-green-700"
                      : s.presente === false
                      ? "bg-red-100 text-red-500"
                      : "bg-[#EDD5F5] text-[#6B3FA0]"
                  }`}>
                    {s.presente === true ? "Presente" : s.presente === false ? "Faltou" : "Aguardando"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
