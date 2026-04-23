"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Agendamento {
  id: string;
  data_hora: string;
  status: "pending" | "confirmed" | "cancelled";
  nome_contato: string | null;
  whatsapp: string | null;
  nome_completo: string | null;
  tipo_sessao: string | null;
}

const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const DIAS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<"preagendados" | "pagos">("preagendados");
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  async function carregar() {
    const supabase = createClient();
    const [{ data }, { count: usuarios }] = await Promise.all([
      supabase.from("appointments").select("id, data_hora, status, nome_contato, whatsapp, nome_completo, tipo_sessao").order("data_hora", { ascending: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).neq("role", "admin"),
    ]);
    setAgendamentos((data as unknown as Agendamento[]) || []);
    setTotalUsuarios(usuarios || 0);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function atualizarStatus(id: string, status: "confirmed" | "cancelled") {
    const supabase = createClient();
    await supabase.from("appointments").update({ status }).eq("id", id);
    carregar();
  }

  const preAgendados = agendamentos.filter(a => a.status === "pending");
  const pagos = agendamentos.filter(a => a.status === "confirmed");
  const lista = aba === "preagendados" ? preAgendados : pagos;

  const pctPagou = totalUsuarios > 0 ? Math.round((pagos.length / totalUsuarios) * 100) : 0;
  const pctPendente = totalUsuarios > 0 ? Math.round((preAgendados.length / totalUsuarios) * 100) : 0;
  const pctNunca = totalUsuarios > 0 ? Math.max(0, 100 - pctPagou - pctPendente) : 0;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-[#1A0A2E] text-2xl font-semibold">Agendamentos</h1>
        <p className="text-[#9B7BB8] text-sm mt-0.5">{agendamentos.length} no total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Agendou e pagou", val: `${pctPagou}%`, cor: "text-green-600" },
          { label: "Pré-agendou sem pagar", val: `${pctPendente}%`, cor: "text-yellow-600" },
          { label: "Nunca agendou", val: `${pctNunca}%`, cor: "text-[#9B7BB8]" },
        ].map(({ label, val, cor }) => (
          <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <p className={`text-xl font-light ${cor}`}>{val}</p>
            <p className="text-[#9B7BB8] text-[10px] mt-0.5 leading-snug">{label}</p>
          </div>
        ))}
      </div>

      {/* Abas */}
      <div className="flex rounded-xl border border-[#EDD5F5] overflow-hidden bg-white">
        <button onClick={() => setAba("preagendados")}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${aba === "preagendados" ? "bg-yellow-500 text-white" : "text-[#9B7BB8] hover:text-[#1A0A2E]"}`}>
          Não confirmados ({preAgendados.length})
        </button>
        <button onClick={() => setAba("pagos")}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${aba === "pagos" ? "bg-[#6B3FA0] text-white" : "text-[#9B7BB8] hover:text-[#1A0A2E]"}`}>
          Confirmados ({pagos.length})
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {carregando ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
          </div>
        ) : lista.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <p className="text-[#9B7BB8] text-sm">Nenhum agendamento aqui.</p>
          </div>
        ) : lista.map(a => {
          const d = new Date(a.data_hora);
          return (
            <div key={a.id} className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#EDD5F5] flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[#6B3FA0] text-[9px] uppercase">{DIAS[d.getDay()]}</span>
                  <span className="text-[#1A0A2E] text-lg font-light leading-none">{d.getDate()}</span>
                  <span className="text-[#9B7BB8] text-[9px]">{MESES[d.getMonth()]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1A0A2E] text-sm font-medium">{a.nome_completo || a.nome_contato || "Sem nome"}</p>
                  {a.whatsapp && <p className="text-[#9B7BB8] text-xs">📲 {a.whatsapp}</p>}
                  {a.tipo_sessao && <p className="text-[#9B7BB8] text-xs">{a.tipo_sessao === "casal" ? "👥 Casal" : "👤 Individual"}</p>}
                  <p className="text-[#9B7BB8] text-xs mt-0.5">
                    às {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full flex-shrink-0 ${
                  a.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {a.status === "confirmed" ? "Confirmado" : "Pendente"}
                </span>
              </div>
              {a.status === "pending" && (
                <div className="flex gap-2 border-t border-[#F0E2FB] pt-3">
                  <button onClick={() => atualizarStatus(a.id, "confirmed")}
                    className="flex-1 bg-[#6B3FA0] text-white py-2 rounded-xl text-xs hover:bg-[#7D50B5] transition-colors">
                    Confirmar
                  </button>
                  <button onClick={() => atualizarStatus(a.id, "cancelled")}
                    className="flex-1 border border-red-200 text-red-400 py-2 rounded-xl text-xs hover:bg-red-50 transition-colors">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
