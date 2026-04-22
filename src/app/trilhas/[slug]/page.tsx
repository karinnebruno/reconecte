"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface Licao {
  id: string;
  titulo: string;
  tipo: "texto" | "quiz" | "exercicio";
  ordem: number;
  concluida: boolean;
}

interface Modulo {
  id: string;
  titulo: string;
  ordem: number;
  licoes: Licao[];
}

interface Trilha {
  id: string;
  titulo: string;
  descricao: string;
  emoji: string;
  slug: string;
}

const tipoIcone = { texto: "📖", quiz: "🧩", exercicio: "✍️" };
const tipoLabel = { texto: "Leitura", quiz: "Quiz", exercicio: "Exercício" };

export default function TrilhaDetalhe() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [moduloAberto, setModuloAberto] = useState<string | null>(null);
  const [totalLicoes, setTotalLicoes] = useState(0);
  const [licoesConcluidas, setLicoesConcluidas] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/entrar"); return; }

      // Busca a trilha pelo slug
      const { data: trilhaData } = await supabase
        .from("tracks")
        .select("id, titulo, descricao, emoji, slug")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (!trilhaData) { router.push("/trilhas"); return; }
      setTrilha(trilhaData);

      // Busca módulos e lições
      const { data: modulosData } = await supabase
        .from("modules")
        .select("id, titulo, ordem")
        .eq("track_id", trilhaData.id)
        .order("ordem");

      if (!modulosData) { setCarregando(false); return; }

      // Busca todas as lições dos módulos
      const moduloIds = modulosData.map(m => m.id);
      const { data: licoesData } = await supabase
        .from("lessons")
        .select("id, titulo, tipo, ordem, module_id")
        .in("module_id", moduloIds)
        .order("ordem");

      // Busca progresso do usuário
      const { data: progressoData } = await supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("user_id", user.id);

      const concluidasSet = new Set((progressoData || []).map(p => p.lesson_id));

      // Monta estrutura
      const estrutura: Modulo[] = modulosData.map(mod => ({
        ...mod,
        licoes: (licoesData || [])
          .filter(l => l.module_id === mod.id)
          .map(l => ({ ...l, concluida: concluidasSet.has(l.id) })),
      }));

      setModulos(estrutura);
      setModuloAberto(estrutura[0]?.id || null);

      const total = estrutura.reduce((acc, m) => acc + m.licoes.length, 0);
      const concluidas = estrutura.reduce((acc, m) => acc + m.licoes.filter(l => l.concluida).length, 0);
      setTotalLicoes(total);
      setLicoesConcluidas(concluidas);
      setCarregando(false);
    }

    carregar();
  }, [slug, router]);

  function proximaLicaoDisponivel(): { moduloId: string; licaoOrdem: number } | null {
    for (const modulo of modulos) {
      for (const licao of modulo.licoes) {
        if (!licao.concluida) return { moduloId: modulo.id, licaoOrdem: licao.ordem };
      }
    }
    return null;
  }

  const progresso = totalLicoes > 0 ? Math.round((licoesConcluidas / totalLicoes) * 100) : 0;
  const proxima = proximaLicaoDisponivel();

  if (carregando) {
    return (
      <div className="min-h-dvh bg-[#FAF4FF] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!trilha) return null;

  return (
    <div className="min-h-dvh bg-[#FAF4FF] pb-8">

      {/* Header */}
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <button onClick={() => router.back()} className="text-[#9B7BB8] text-sm mb-5 flex items-center gap-2">
          ← Trilhas
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-4 items-start">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #6B3FA0, #B07FD4)" }}
            >
              {trilha.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-xl font-light leading-snug mb-1">{trilha.titulo}</h1>
              <p className="text-[#9B7BB8] text-xs leading-relaxed">{trilha.descricao}</p>
            </div>
          </div>

          {/* Progresso geral */}
          <div className="mt-5">
            <div className="flex justify-between mb-2">
              <span className="text-[#9B7BB8] text-xs">{licoesConcluidas} de {totalLicoes} lições</span>
              <span className="text-[#B07FD4] text-xs">{progresso}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#6B3FA0]/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6B3FA0] to-[#B07FD4] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progresso}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Botão continuar */}
      {proxima && (
        <div className="px-5 pt-5">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => router.push(`/trilhas/${slug}/licao/${proxima.licaoOrdem}`)}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#6B3FA0] text-white py-4 rounded-2xl text-sm tracking-wide"
          >
            {licoesConcluidas === 0 ? "Começar trilha" : "Continuar de onde parei"}
          </motion.button>
        </div>
      )}

      {progresso === 100 && (
        <div className="px-5 pt-5">
          <div className="bg-[#EDD5F5] border border-[#6B3FA0]/30 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-[#6B3FA0] text-sm font-medium">Trilha concluída!</p>
            <p className="text-[#9B7BB8] text-xs mt-1">Você completou todos os módulos.</p>
          </div>
        </div>
      )}

      {/* Módulos e lições */}
      <div className="px-5 pt-5 space-y-3">
        {modulos.map((modulo, mi) => {
          const concluiuModulo = modulo.licoes.every(l => l.concluida);
          const aberto = moduloAberto === modulo.id;

          return (
            <motion.div
              key={modulo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.07 }}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
            >
              {/* Cabeçalho do módulo */}
              <button
                onClick={() => setModuloAberto(aberto ? null : modulo.id)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    concluiuModulo ? "bg-[#6B3FA0] text-white" : "bg-[#EDD5F5] text-[#6B3FA0]"
                  }`}>
                    {concluiuModulo ? "✓" : mi + 1}
                  </div>
                  <div className="text-left">
                    <p className="text-[#1A0A2E] text-sm font-medium">{modulo.titulo}</p>
                    <p className="text-[#9B7BB8] text-[11px]">
                      {modulo.licoes.filter(l => l.concluida).length}/{modulo.licoes.length} lições
                    </p>
                  </div>
                </div>
                <span className={`text-[#9B7BB8] text-xs transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>

              {/* Lista de lições */}
              {aberto && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-[#F0E2FB]"
                >
                  {modulo.licoes.map((licao, li) => (
                    <button
                      key={licao.id}
                      onClick={() => router.push(`/trilhas/${slug}/licao/${licao.ordem}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAF4FF] transition-colors border-b border-[#F0E2FB] last:border-0"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                        licao.concluida
                          ? "bg-[#6B3FA0] text-white"
                          : "bg-[#F0E2FB] text-[#9B7BB8]"
                      }`}>
                        {licao.concluida ? "✓" : li + 1}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-sm ${licao.concluida ? "text-[#9B7BB8]" : "text-[#1A0A2E]"}`}>
                          {licao.titulo}
                        </p>
                        <p className="text-[#B07FD4] text-[10px] mt-0.5">
                          {tipoIcone[licao.tipo]} {tipoLabel[licao.tipo]}
                        </p>
                      </div>
                      <span className="text-[#9B7BB8] text-xs">→</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {modulos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-[#1A0A2E] text-sm font-medium mb-1">Conteúdo em preparação</p>
            <p className="text-[#9B7BB8] text-xs">As lições desta trilha estarão disponíveis em breve.</p>
          </div>
        )}
      </div>
    </div>
  );
}
