"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface Agendamento {
  id: string;
  data_hora: string;
  status: "pending" | "confirmed" | "cancelled";
  profiles: { nome: string; email: string } | null;
}

const STATUS_LABEL = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

const STATUS_COR = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-500",
};

const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const DIAS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export default function AdminAgendamentos() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "pending" | "confirmed">("todos");

  async function carregar() {
    const supabase = createClient();
    const { data } = await supabase
      .from("appointments")
      .select("id, data_hora, status, profiles(nome, email)")
      .order("data_hora", { ascending: true });

    setAgendamentos((data as unknown as Agendamento[]) || []);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function atualizarStatus(id: string, status: "confirmed" | "cancelled") {
    const supabase = createClient();
    await supabase.from("appointments").update({ status }).eq("id", id);
    carregar();
  }

  const lista = filtro === "todos"
    ? agendamentos
    : agendamentos.filter(a => a.status === filtro);

  const pendentes = agendamentos.filter(a => a.status === "pending").length;

  return (
    <div className="min-h-dvh bg-[#FAF4FF]">
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <button onClick={() => router.push("/admin")} className="text-[#9B7BB8] text-sm mb-5 flex items-center gap-2">
          ← Painel
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
          <h1 className="text-white text-2xl font-light">Agendamentos</h1>
          {pendentes > 0 && (
            <p className="text-[#B07FD4] text-xs mt-1">{pendentes} aguardando confirmação</p>
          )}
        </motion.div>
      </div>

      <div className="px-5 pt-5 pb-10 space-y-4">

        {/* Filtros */}
        <div className="flex gap-2">
          {(["todos", "pending", "confirmed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                filtro === f ? "bg-[#6B3FA0] text-white" : "bg-white border border-[#EDD5F5] text-[#9B7BB8]"
              }`}
            >
              {f === "todos" ? "Todos" : f === "pending" ? "Pendentes" : "Confirmados"}
            </button>
          ))}
        </div>

        {carregando && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
          </div>
        )}

        {!carregando && lista.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-[#1A0A2E] text-sm font-medium mb-1">Nenhum agendamento</p>
            <p className="text-[#9B7BB8] text-xs">Os agendamentos aparecerão aqui.</p>
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
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#EDD5F5] flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[#6B3FA0] text-[10px] uppercase">{DIAS[data.getDay()]}</span>
                    <span className="text-[#1A0A2E] text-lg font-light leading-none">{data.getDate()}</span>
                    <span className="text-[#9B7BB8] text-[9px]">{MESES[data.getMonth()]}</span>
                  </div>
                  <div>
                    <p className="text-[#1A0A2E] text-sm font-medium">
                      {a.profiles?.nome || "Usuária"}
                    </p>
                    <p className="text-[#9B7BB8] text-xs">{a.profiles?.email || ""}</p>
                    <p className="text-[#9B7BB8] text-xs mt-0.5">
                      às {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full tracking-wide ${STATUS_COR[a.status]}`}>
                  {STATUS_LABEL[a.status]}
                </span>
              </div>

              {a.status === "pending" && (
                <div className="flex gap-2 border-t border-[#F0E2FB] pt-3">
                  <button
                    onClick={() => atualizarStatus(a.id, "confirmed")}
                    className="flex-1 bg-[#6B3FA0] text-white py-2 rounded-xl text-xs"
                  >
                    Confirmar
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
