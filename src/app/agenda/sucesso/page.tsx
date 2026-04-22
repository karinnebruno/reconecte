"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function SucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!sessionId) { router.push("/home"); return; }

    // Aguarda o webhook processar (máx 5s) e exibe a confirmação
    const supabase = createClient();
    let tentativas = 0;

    const verificar = setInterval(async () => {
      const { data } = await supabase
        .from("appointments")
        .select("status")
        .eq("stripe_session_id", sessionId)
        .single();

      if (data?.status === "confirmed" || tentativas >= 5) {
        clearInterval(verificar);
        setPronto(true);
      }
      tentativas++;
    }, 1000);

    // Garante que exibe mesmo se webhook ainda não chegou
    setTimeout(() => {
      clearInterval(verificar);
      setPronto(true);
    }, 6000);

    return () => clearInterval(verificar);
  }, [sessionId, router]);

  if (!pronto) {
    return (
      <div className="min-h-dvh bg-[#FAF4FF] flex flex-col items-center justify-center gap-4">
        <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
        <p className="text-[#9B7BB8] text-sm">Confirmando pagamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FAF4FF] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-[#EDD5F5] flex items-center justify-center text-4xl mx-auto mb-6"
        >
          ✨
        </motion.div>

        <h1 className="text-[#1A0A2E] text-2xl font-light mb-2">Agendamento confirmado!</h1>
        <p className="text-[#9B7BB8] text-sm leading-relaxed mb-8">
          Sua sessão de orientação com Karinne Bruno foi agendada com sucesso. Você receberá uma confirmação em breve.
        </p>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)] mb-8 text-left">
          <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">O que acontece agora?</p>
          <div className="space-y-3">
            {[
              { emoji: "📧", texto: "Você receberá um e-mail de confirmação" },
              { emoji: "📅", texto: "Karinne confirmará o horário em até 24h" },
              { emoji: "💬", texto: "O link da sessão será enviado por e-mail" },
            ].map(({ emoji, texto }) => (
              <div key={texto} className="flex items-center gap-3">
                <span className="text-lg">{emoji}</span>
                <span className="text-[#1A0A2E] text-xs">{texto}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push("/home")}
          className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm tracking-wide"
        >
          Voltar para o início
        </button>
      </motion.div>
    </div>
  );
}

export default function SucessoPage() {
  return <Suspense fallback={
    <div className="min-h-dvh bg-[#FAF4FF] flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
    </div>
  }>
    <SucessoContent />
  </Suspense>;
}
