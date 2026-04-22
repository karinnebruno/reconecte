"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

// ── Tipos de conteúdo ──────────────────────────────────────────────

interface ConteudoTexto {
  blocos: Array<{ tipo: "paragrafo" | "destaque" | "imagem"; valor: string }>;
}

interface ConteudoQuiz {
  pergunta: string;
  opcoes: string[];
  resposta_correta: number;
  explicacao: string;
}

interface ConteudoExercicio {
  instrucao: string;
  reflexao: string;
  campo_resposta: boolean;
}

interface Licao {
  id: string;
  titulo: string;
  tipo: "texto" | "quiz" | "exercicio";
  conteudo: ConteudoTexto | ConteudoQuiz | ConteudoExercicio;
  ordem: number;
  module_id: string;
}

// ── Tela principal ─────────────────────────────────────────────────

export default function LicaoPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const ordem = parseInt(params.ordem as string);

  const [licao, setLicao] = useState<Licao | null>(null);
  const [proximaOrdem, setProximaOrdem] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [concluida, setConcluida] = useState(false);
  const [celebrando, setCelebrando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [respostaExercicio, setRespostaExercicio] = useState("");
  const [quizRespondido, setQuizRespondido] = useState<number | null>(null);
  const [quizCorreto, setQuizCorreto] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/entrar"); return; }
      setUserId(user.id);

      // Busca a trilha
      const { data: trilha } = await supabase
        .from("tracks")
        .select("id")
        .eq("slug", slug)
        .single();
      if (!trilha) { router.push("/trilhas"); return; }

      // Busca todos os módulos da trilha
      const { data: modulos } = await supabase
        .from("modules")
        .select("id")
        .eq("track_id", trilha.id)
        .order("ordem");
      if (!modulos) { setCarregando(false); return; }

      const moduloIds = modulos.map(m => m.id);

      // Busca lições ordenadas
      const { data: licoes } = await supabase
        .from("lessons")
        .select("id, titulo, tipo, conteudo, ordem, module_id")
        .in("module_id", moduloIds)
        .order("ordem");
      if (!licoes) { setCarregando(false); return; }

      const licaoAtual = licoes.find(l => l.ordem === ordem);
      if (!licaoAtual) { router.push(`/trilhas/${slug}`); return; }
      setLicao(licaoAtual as Licao);

      // Próxima lição
      const idx = licoes.findIndex(l => l.ordem === ordem);
      if (idx >= 0 && idx < licoes.length - 1) {
        setProximaOrdem(licoes[idx + 1].ordem);
      }

      // Verifica se já foi concluída
      const { data: prog } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", licaoAtual.id)
        .single();
      if (prog) setConcluida(true);

      setCarregando(false);
    }

    carregar();
  }, [slug, ordem, router]);

  async function concluirLicao() {
    if (!userId || !licao || concluida) return;
    const supabase = createClient();

    await supabase.from("user_progress").insert({
      user_id: userId,
      lesson_id: licao.id,
    });

    // Atualiza streak
    const hoje = new Date().toISOString().split("T")[0];
    const { data: streakData } = await supabase
      .from("streaks")
      .select("current_streak, last_activity_date")
      .eq("user_id", userId)
      .single();

    if (streakData) {
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);
      const ontemStr = ontem.toISOString().split("T")[0];
      const novoStreak = streakData.last_activity_date === ontemStr
        ? streakData.current_streak + 1
        : 1;

      await supabase.from("streaks").update({
        current_streak: novoStreak,
        longest_streak: Math.max(novoStreak, streakData.current_streak),
        last_activity_date: hoje,
      }).eq("user_id", userId);
    }

    setConcluida(true);
    setCelebrando(true);
    setTimeout(() => setCelebrando(false), 2500);
  }

  function avancar() {
    if (proximaOrdem !== null) {
      router.push(`/trilhas/${slug}/licao/${proximaOrdem}`);
    } else {
      router.push(`/trilhas/${slug}`);
    }
  }

  if (carregando) {
    return (
      <div className="min-h-dvh bg-[#FAF4FF] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!licao) return null;

  return (
    <div className="min-h-dvh bg-[#FAF4FF] flex flex-col">

      {/* Celebração ao concluir */}
      <AnimatePresence>
        {celebrando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="bg-[#6B3FA0] rounded-3xl px-8 py-6 text-center shadow-2xl"
            >
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-white text-lg font-light">Lição concluída!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-5">
        <button onClick={() => router.push(`/trilhas/${slug}`)} className="text-[#9B7BB8] text-sm mb-4 flex items-center gap-2">
          ← Trilha
        </button>
        <div className="flex items-center justify-between">
          <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase">
            Lição {ordem}
          </p>
          {concluida && (
            <span className="text-[10px] tracking-widest uppercase bg-[#6B3FA0]/30 text-[#B07FD4] px-2.5 py-1 rounded-full">
              ✓ Concluída
            </span>
          )}
        </div>
        <h1 className="text-white text-xl font-light mt-1 leading-snug">{licao.titulo}</h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 px-5 pt-6 pb-8 overflow-y-auto">
        {licao.tipo === "texto" && (
          <LicaoTexto conteudo={licao.conteudo as ConteudoTexto} />
        )}
        {licao.tipo === "quiz" && (
          <LicaoQuiz
            conteudo={licao.conteudo as ConteudoQuiz}
            respondido={quizRespondido}
            correto={quizCorreto}
            onResponder={(idx) => {
              setQuizRespondido(idx);
              setQuizCorreto(idx === (licao.conteudo as ConteudoQuiz).resposta_correta);
            }}
          />
        )}
        {licao.tipo === "exercicio" && (
          <LicaoExercicio
            conteudo={licao.conteudo as ConteudoExercicio}
            resposta={respostaExercicio}
            onChange={setRespostaExercicio}
          />
        )}
      </div>

      {/* Botão de ação */}
      <div className="px-5 pb-8 pt-2">
        {!concluida ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (licao.tipo === "quiz" && quizRespondido === null) return;
              concluirLicao();
            }}
            disabled={licao.tipo === "quiz" && quizRespondido === null}
            className={`w-full py-4 rounded-2xl text-sm tracking-wide transition-all duration-200 ${
              licao.tipo === "quiz" && quizRespondido === null
                ? "bg-[#EDD5F5] text-[#9B7BB8] cursor-not-allowed"
                : "bg-[#1A0A2E] text-white hover:bg-[#6B3FA0]"
            }`}
          >
            {licao.tipo === "quiz" && quizRespondido === null
              ? "Selecione uma resposta"
              : "Marcar como concluída"}
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={avancar}
            className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm tracking-wide"
          >
            {proximaOrdem !== null ? "Próxima lição →" : "Concluir trilha ✓"}
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ── Componentes de tipo de lição ───────────────────────────────────

function LicaoTexto({ conteudo }: { conteudo: ConteudoTexto }) {
  return (
    <div className="space-y-4">
      {conteudo.blocos?.map((bloco, i) => {
        if (bloco.tipo === "paragrafo") {
          return (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="text-[#1A0A2E] text-sm leading-relaxed"
            >
              {bloco.valor}
            </motion.p>
          );
        }
        if (bloco.tipo === "destaque") {
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-[#EDD5F5] border-l-4 border-[#6B3FA0] rounded-r-2xl px-4 py-3"
            >
              <p className="text-[#6B3FA0] text-sm leading-relaxed italic">{bloco.valor}</p>
            </motion.div>
          );
        }
        return null;
      })}
    </div>
  );
}

function LicaoQuiz({
  conteudo,
  respondido,
  correto,
  onResponder,
}: {
  conteudo: ConteudoQuiz;
  respondido: number | null;
  correto: boolean | null;
  onResponder: (idx: number) => void;
}) {
  return (
    <div>
      <p className="text-[#1A0A2E] text-base font-medium leading-snug mb-6">
        {conteudo.pergunta}
      </p>

      <div className="space-y-3">
        {conteudo.opcoes?.map((opcao, idx) => {
          let estilo = "bg-white border-[#EDD5F5] text-[#1A0A2E]";
          if (respondido !== null) {
            if (idx === conteudo.resposta_correta) {
              estilo = "bg-green-50 border-green-400 text-green-800";
            } else if (idx === respondido && !correto) {
              estilo = "bg-red-50 border-red-300 text-red-700";
            } else {
              estilo = "bg-white border-[#EDD5F5] text-[#9B7BB8]";
            }
          } else if (respondido === idx) {
            estilo = "bg-[#EDD5F5] border-[#6B3FA0] text-[#6B3FA0]";
          }

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07 }}
              onClick={() => respondido === null && onResponder(idx)}
              disabled={respondido !== null}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 text-sm leading-relaxed ${estilo}`}
            >
              {opcao}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {respondido !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 rounded-2xl p-4 ${correto ? "bg-green-50 border border-green-200" : "bg-[#FAF4FF] border border-[#EDD5F5]"}`}
          >
            <p className={`text-sm font-medium mb-1 ${correto ? "text-green-700" : "text-[#6B3FA0]"}`}>
              {correto ? "✓ Correto!" : "Quase lá!"}
            </p>
            <p className="text-[#1A0A2E] text-sm leading-relaxed">{conteudo.explicacao}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LicaoExercicio({
  conteudo,
  resposta,
  onChange,
}: {
  conteudo: ConteudoExercicio;
  resposta: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[#1A0A2E] text-sm leading-relaxed">{conteudo.instrucao}</p>
      </motion.div>

      {conteudo.reflexao && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#EDD5F5] border-l-4 border-[#6B3FA0] rounded-r-2xl px-4 py-3"
        >
          <p className="text-[#6B3FA0] text-xs tracking-widest uppercase mb-1">Para refletir</p>
          <p className="text-[#1A0A2E] text-sm leading-relaxed italic">{conteudo.reflexao}</p>
        </motion.div>
      )}

      {conteudo.campo_resposta && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Sua reflexão (opcional)</p>
          <textarea
            value={resposta}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escreva seus pensamentos aqui..."
            rows={4}
            className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors"
          />
        </motion.div>
      )}
    </div>
  );
}
