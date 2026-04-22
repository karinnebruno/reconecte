"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function SucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [etapa, setEtapa] = useState<"aguardando" | "formulario" | "pronto">("aguardando");
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [tipoSessao, setTipoSessao] = useState<"individual" | "casal" | "">("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!sessionId) { router.push("/home"); return; }

    const supabase = createClient();
    let tentativas = 0;

    const verificar = setInterval(async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id, status")
        .eq("stripe_session_id", sessionId)
        .single();

      if (data?.status === "confirmed" || tentativas >= 6) {
        clearInterval(verificar);
        if (data?.id) setAppointmentId(data.id);
        setEtapa("formulario");
      }
      tentativas++;
    }, 1000);

    setTimeout(() => {
      clearInterval(verificar);
      setEtapa("formulario");
    }, 7000);

    return () => clearInterval(verificar);
  }, [sessionId, router]);

  async function salvarDados() {
    if (!appointmentId || !nomeCompleto || !tipoSessao) return;
    setSalvando(true);
    const supabase = createClient();
    await supabase.from("appointments").update({
      nome_completo: nomeCompleto,
      email_paciente: email,
      cpf,
      data_nascimento: dataNascimento || null,
      tipo_sessao: tipoSessao,
    }).eq("id", appointmentId);
    setSalvando(false);
    setEtapa("pronto");
  }

  if (etapa === "aguardando") {
    return (
      <div className="min-h-dvh bg-[#FAF4FF] flex flex-col items-center justify-center gap-4">
        <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
        <p className="text-[#9B7BB8] text-sm">Confirmando pagamento...</p>
      </div>
    );
  }

  if (etapa === "formulario") {
    return (
      <div className="min-h-dvh bg-[#FAF4FF] pb-10">
        <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Pagamento confirmado ✓</p>
            <h1 className="text-white text-2xl font-light">Complete seus dados</h1>
          </motion.div>
        </div>

        <div className="px-5 pt-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#EDD5F5] rounded-2xl p-4"
          >
            <p className="text-[#6B3FA0] text-sm">
              💜 Pagamento realizado! Preencha seus dados para que Karinne possa entrar em contato pelo WhatsApp e confirmar sua sessão.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 space-y-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
          >
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-2">Nome completo *</label>
              <input
                type="text"
                value={nomeCompleto}
                onChange={e => setNomeCompleto(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-2">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-2">Data de nascimento</label>
              <input
                type="date"
                value={dataNascimento}
                onChange={e => setDataNascimento(e.target.value)}
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-2">Tipo de sessão *</label>
              <div className="grid grid-cols-2 gap-2">
                {(["individual", "casal"] as const).map(tipo => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setTipoSessao(tipo)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                      tipoSessao === tipo
                        ? "bg-[#6B3FA0] text-white border-[#6B3FA0]"
                        : "bg-white text-[#1A0A2E] border-[#EDD5F5]"
                    }`}
                  >
                    {tipo === "individual" ? "👤 Individual" : "👥 Em casal"}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={salvarDados}
            disabled={salvando || !nomeCompleto || !tipoSessao}
            className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm font-medium tracking-wide disabled:opacity-50 transition-all"
          >
            {salvando ? "Salvando..." : "Enviar dados →"}
          </motion.button>

          <button
            onClick={() => setEtapa("pronto")}
            className="w-full text-[#9B7BB8] text-xs py-2"
          >
            Preencher depois
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FAF4FF] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-[#EDD5F5] flex items-center justify-center text-4xl mx-auto mb-6"
        >
          💜
        </motion.div>

        <h1 className="text-[#1A0A2E] text-2xl font-light mb-2">Sessão agendada!</h1>
        <p className="text-[#9B7BB8] text-sm leading-relaxed mb-8">
          Karinne entrará em contato pelo seu <strong>WhatsApp</strong> em até 24h para confirmar o horário e enviar o link da sessão.
        </p>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)] mb-8 text-left">
          <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">Próximos passos</p>
          <div className="space-y-3">
            {[
              { emoji: "📲", texto: "Aguarde o WhatsApp de confirmação em até 24h" },
              { emoji: "📅", texto: "Salve o horário na sua agenda" },
              { emoji: "💻", texto: "O link do Google Meet será enviado pelo WhatsApp" },
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
