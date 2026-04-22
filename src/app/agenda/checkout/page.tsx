"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const DIAS_SEMANA = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];

interface Appointment {
  id: string;
  data_hora: string;
  status: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment");

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!appointmentId) { router.push("/agenda"); return; }

    const supabase = createClient();
    supabase
      .from("appointments")
      .select("id, data_hora, status")
      .eq("id", appointmentId)
      .single()
      .then(({ data }) => {
        if (!data) { router.push("/agenda"); return; }
        setAppointment(data);
        setCarregando(false);
      });
  }, [appointmentId, router]);

  async function pagar() {
    if (!appointment) return;
    setProcessando(true);
    setErro("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id, dataHora: appointment.data_hora }),
      });

      const { url, error } = await res.json();
      if (error || !url) {
        setErro("Erro ao iniciar pagamento. Tente novamente.");
        setProcessando(false);
        return;
      }

      window.location.href = url;
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setProcessando(false);
    }
  }

  if (carregando) {
    return (
      <div className="min-h-dvh bg-[#FAF4FF] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!appointment) return null;

  const data = new Date(appointment.data_hora);
  const diaSemana = DIAS_SEMANA[data.getDay()];
  const dia = data.getDate();
  const mes = MESES[data.getMonth()];
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-dvh bg-[#FAF4FF]">
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <button onClick={() => router.push("/agenda")} className="text-[#9B7BB8] text-sm mb-5 flex items-center gap-2">
          ← Voltar
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Confirmar pagamento</p>
          <h1 className="text-white text-2xl font-light">Sessão de orientação</h1>
        </motion.div>
      </div>

      <div className="px-5 pt-6 space-y-4">

        {/* Resumo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
        >
          <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-4">Resumo</p>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6B3FA0] to-[#B07FD4] flex items-center justify-center text-2xl flex-shrink-0">
              🧠
            </div>
            <div>
              <p className="text-[#1A0A2E] text-sm font-medium">Sessão de Orientação</p>
              <p className="text-[#9B7BB8] text-xs mt-0.5">Com Karinne Bruno · Neuropsicóloga</p>
            </div>
          </div>

          <div className="space-y-2 border-t border-[#F0E2FB] pt-4">
            <div className="flex justify-between">
              <span className="text-[#9B7BB8] text-xs">Data</span>
              <span className="text-[#1A0A2E] text-xs capitalize">{diaSemana}, {dia} de {mes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9B7BB8] text-xs">Horário</span>
              <span className="text-[#1A0A2E] text-xs">às {hora}</span>
            </div>
            <div className="flex justify-between border-t border-[#F0E2FB] pt-2 mt-2">
              <span className="text-[#1A0A2E] text-sm font-medium">Total</span>
              <span className="text-[#6B3FA0] text-sm font-medium">R$ 250,00</span>
            </div>
          </div>
        </motion.div>

        {/* Info pagamento */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#EDD5F5] rounded-2xl p-4"
        >
          <p className="text-[#6B3FA0] text-xs leading-relaxed">
            🔒 Pagamento seguro processado pela Stripe. Você será redirecionada para concluir o pagamento e voltará aqui após a confirmação.
          </p>
        </motion.div>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-xs">{erro}</p>
          </div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={pagar}
          disabled={processando}
          className="w-full bg-[#1A0A2E] text-white py-4 rounded-2xl text-sm tracking-wide hover:bg-[#6B3FA0] transition-all duration-200 disabled:opacity-60"
        >
          {processando ? "Redirecionando..." : "Pagar R$ 250,00 →"}
        </motion.button>

        <p className="text-center text-[#9B7BB8] text-[10px]">
          Ao pagar você concorda com os termos de agendamento
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={
    <div className="min-h-dvh bg-[#FAF4FF] flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
    </div>
  }>
    <CheckoutContent />
  </Suspense>;
}
