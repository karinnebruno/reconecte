"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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

export default function AdminAgendamentos() {
  const router = useRouter();
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

  const pctAgendouEPagou = totalUsuarios > 0 ? Math.round((pagos.length / totalUsuarios) * 100) : 0;
  const pctAgendouNaoPagou = totalUsuarios > 0 ? Math.round((preAgendados.length / totalUsuarios) * 100) : 0;
  const pctNuncaAgendou = totalUsuarios > 0 ? Math.max(0, 100 - pctAgendouEPagou - pctAgendouNaoPagou) : 0;

  return (
    <div className="min-h-dvh bg-[#FAF4FF]">
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <button onClick={() => router.push("/admin")} className="text-[#9B7BB8] text-sm mb-5 flex items-center gap-2">
          ← Painel
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
          <h1 className="text-white text-2xl font-light">Agendamentos</h1>
        </motion.div>
      </div>

      <div className="px-5 pt-5 pb-10 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-3 text-center shadow-[0_2px_12px_rgba(26,10,46,0.06)]">
            <p className="text-[#6B3FA0] text-xl font-light">{pctAgendouEPagou}%</p>
            <p className="text-[#9B7BB8] text-[9px] mt-0.5 leading-snug">Agendou e pagou</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-[0_2px_12px_rgba(26,10,46,0.06)]">
            <p className="text-yellow-500 text-xl font-light">{pctAgendouNaoPagou}%</p>
            <p className="text-[#9B7BB8] text-[9px] mt-0.5 leading-snug">Pré-agendou sem pagar</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-[0_2px_12px_rgba(26,10,46,0.06)]">
            <p className="text-[#9B7BB8] text-xl font-light">{pctNuncaAgendou}%</p>
            <p className="text-[#9B7BB8] text-[9px] mt-0.5 leading-snug">Nunca agendou</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2">
          <button
            onClick={() => setAba("preagendados")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
              aba === "preagendados" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : "bg-white border border-[#EDD5F5] text-[#9B7BB8]"
            }`}
          >
            Não confirmados ({preAgendados.length})
          </button>
          <button
            onClick={() => setAba("pagos")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
              aba === "pagos" ? "bg-green-100 text-green-700 border border-green-200" : "bg-white border border-[#EDD5F5] text-[#9B7BB8]"
            }`}
          >
            Pagos ({pagos.length})
          </button>
        </div>

        {carregando && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
          </div>
        )}

        {!carregando && lista.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-[#1A0A2E] text-sm font-medium mb-1">Nenhum agendamento aqui</p>
            <p className="text-[#9B7BB8] text-xs">{aba === "preagendados" ? "Não há pré-agendamentos pendentes." : "Nenhuma sessão paga ainda."}</p>
          </div>
        )}

        {lista.map((a, i) => {
          const data = new Date(a.data_hora);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#EDD5F5] flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[#6B3FA0] text-[9px] uppercase">{DIAS[data.getDay()]}</span>
                  <span className="text-[#1A0A2E] text-lg font-light leading-none">{data.getDate()}</span>
                  <span className="text-[#9B7BB8] text-[9px]">{MESES[data.getMonth()]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1A0A2E] text-sm font-medium">{a.nome_completo || a.nome_contato || "Sem nome"}</p>
                  {a.whatsapp && <p className="text-[#9B7BB8] text-xs">📲 {a.whatsapp}</p>}
                  {a.tipo_sessao && (
                    <p className="text-[#9B7BB8] text-xs">{a.tipo_sessao === "casal" ? "👥 Em casal" : "👤 Individual"}</p>
                  )}
                  <p className="text-[#9B7BB8] text-xs mt-0.5">
                    às {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full ${
                  a.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {a.status === "confirmed" ? "Pago" : "Pré-agendado"}
                </span>
              </div>

              {a.status === "pending" && (
                <div className="flex gap-2 border-t border-[#F0E2FB] pt-3">
                  <button
                    onClick={() => atualizarStatus(a.id, "confirmed")}
                    className="flex-1 bg-[#6B3FA0] text-white py-2 rounded-xl text-xs"
                  >
                    Marcar como pago
                  </button>
                  <button
                    onClick={() => atualizarStatus(a.id, "cancelled")}
                    className="flex-1 border border-red-200 text-red-400 py-2 rounded-xl text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
