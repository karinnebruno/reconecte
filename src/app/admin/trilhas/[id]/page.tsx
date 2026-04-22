"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface Licao {
  id: string;
  titulo: string;
  tipo: "texto" | "quiz" | "exercicio";
  ordem: number;
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
  slug: string;
  emoji: string;
  is_published: boolean;
}

const tipoIcone = { texto: "📖", quiz: "🧩", exercicio: "✍️" };

export default function EditarTrilha() {
  const router = useRouter();
  const { id } = useParams();
  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [moduloAberto, setModuloAberto] = useState<string | null>(null);
  const [novoModulo, setNovoModulo] = useState("");
  const [adicionandoModulo, setAdicionandoModulo] = useState(false);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    const supabase = createClient();

    const { data: trilhaData } = await supabase
      .from("tracks")
      .select("id, titulo, slug, emoji, is_published")
      .eq("id", id)
      .single();
    if (!trilhaData) { router.push("/admin/trilhas"); return; }
    setTrilha(trilhaData);

    const { data: modulosData } = await supabase
      .from("modules")
      .select("id, titulo, ordem")
      .eq("track_id", id)
      .order("ordem");

    if (modulosData && modulosData.length > 0) {
      const moduloIds = modulosData.map(m => m.id);
      const { data: licoesData } = await supabase
        .from("lessons")
        .select("id, titulo, tipo, ordem, module_id")
        .in("module_id", moduloIds)
        .order("ordem");

      const estrutura: Modulo[] = modulosData.map(mod => ({
        ...mod,
        licoes: (licoesData || []).filter(l => l.module_id === mod.id),
      }));
      setModulos(estrutura);
      setModuloAberto(estrutura[0]?.id || null);
    } else {
      setModulos([]);
    }
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, [id]);

  async function criarModulo() {
    if (!novoModulo.trim()) return;
    const supabase = createClient();
    const ordemNova = (modulos[modulos.length - 1]?.ordem || 0) + 1;
    await supabase.from("modules").insert({ track_id: id, titulo: novoModulo.trim(), ordem: ordemNova });
    setNovoModulo("");
    setAdicionandoModulo(false);
    carregar();
  }

  async function excluirModulo(moduloId: string) {
    if (!confirm("Excluir este módulo e todas as suas lições?")) return;
    const supabase = createClient();
    await supabase.from("modules").delete().eq("id", moduloId);
    carregar();
  }

  async function excluirLicao(licaoId: string) {
    if (!confirm("Excluir esta lição?")) return;
    const supabase = createClient();
    await supabase.from("lessons").delete().eq("id", licaoId);
    carregar();
  }

  async function togglePublicado() {
    if (!trilha) return;
    const supabase = createClient();
    await supabase.from("tracks").update({ is_published: !trilha.is_published }).eq("id", trilha.id);
    carregar();
  }

  if (carregando) {
    return (
      <div className="min-h-dvh bg-[#FAF4FF] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!trilha) return null;

  return (
    <div className="min-h-dvh bg-[#FAF4FF]">
      {/* Header */}
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <button onClick={() => router.push("/admin/trilhas")} className="text-[#9B7BB8] text-sm mb-5 flex items-center gap-2">
          ← Trilhas
        </button>
        <div className="flex justify-between items-start">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">{trilha.emoji}</span>
              <h1 className="text-white text-xl font-light leading-snug">{trilha.titulo}</h1>
            </div>
            <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full ${
              trilha.is_published ? "bg-green-900/40 text-green-400" : "bg-[#6B3FA0]/20 text-[#9B7BB8]"
            }`}>
              {trilha.is_published ? "Publicada" : "Rascunho"}
            </span>
          </motion.div>
          <button
            onClick={togglePublicado}
            className="text-[#9B7BB8] text-xs border border-[#6B3FA0]/30 px-3 py-2 rounded-xl mt-1"
          >
            {trilha.is_published ? "Despublicar" : "Publicar"}
          </button>
        </div>
      </div>

      <div className="px-5 pt-5 pb-10 space-y-3">

        {/* Módulos */}
        {modulos.map((modulo, mi) => (
          <motion.div
            key={modulo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mi * 0.06 }}
            className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
          >
            {/* Header do módulo */}
            <div className="flex items-center p-4">
              <button
                onClick={() => setModuloAberto(moduloAberto === modulo.id ? null : modulo.id)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <div className="w-7 h-7 rounded-full bg-[#EDD5F5] text-[#6B3FA0] flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {mi + 1}
                </div>
                <div>
                  <p className="text-[#1A0A2E] text-sm font-medium">{modulo.titulo}</p>
                  <p className="text-[#9B7BB8] text-[11px]">{modulo.licoes.length} lições</p>
                </div>
                <span className={`text-[#9B7BB8] text-xs ml-2 transition-transform duration-200 ${moduloAberto === modulo.id ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>
              <button
                onClick={() => excluirModulo(modulo.id)}
                className="text-red-300 text-xs px-2 py-1 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            {/* Lições do módulo */}
            <AnimatePresence>
              {moduloAberto === modulo.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-t border-[#F0E2FB]"
                >
                  {modulo.licoes.map((licao, li) => (
                    <div key={licao.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#F0E2FB] last:border-0">
                      <span className="text-base">{tipoIcone[licao.tipo]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1A0A2E] text-sm truncate">{licao.titulo}</p>
                        <p className="text-[#9B7BB8] text-[10px] capitalize">{licao.tipo}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/trilhas/${id}/modulos/${modulo.id}?licao=${licao.id}`)}
                        className="text-[#6B3FA0] text-xs px-2 py-1 border border-[#EDD5F5] rounded-lg"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirLicao(licao.id)}
                        className="text-red-300 text-xs px-2 py-1 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Adicionar lição */}
                  <button
                    onClick={() => router.push(`/admin/trilhas/${id}/modulos/${modulo.id}`)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-[#6B3FA0] text-sm hover:bg-[#FAF4FF] transition-colors"
                  >
                    <span className="text-lg">+</span>
                    <span>Adicionar lição</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Adicionar módulo */}
        <AnimatePresence>
          {adicionandoModulo ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
            >
              <p className="text-[#9B7BB8] text-xs tracking-widest uppercase mb-3">Nome do módulo</p>
              <input
                autoFocus
                value={novoModulo}
                onChange={e => setNovoModulo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && criarModulo()}
                placeholder="Ex: Por que brigamos tanto?"
                className="w-full bg-[#FAF4FF] border border-[#EDD5F5] rounded-xl px-4 py-3 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors mb-3"
              />
              <div className="flex gap-2">
                <button onClick={criarModulo} className="flex-1 bg-[#6B3FA0] text-white py-2.5 rounded-xl text-xs tracking-wide">
                  Criar módulo
                </button>
                <button onClick={() => { setAdicionandoModulo(false); setNovoModulo(""); }} className="flex-1 border border-[#EDD5F5] text-[#9B7BB8] py-2.5 rounded-xl text-xs">
                  Cancelar
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setAdicionandoModulo(true)}
              className="w-full py-4 border-2 border-dashed border-[#EDD5F5] rounded-2xl text-[#6B3FA0] text-sm hover:border-[#6B3FA0] transition-colors"
            >
              + Adicionar módulo
            </motion.button>
          )}
        </AnimatePresence>

        {modulos.length === 0 && !adicionandoModulo && (
          <div className="text-center py-8">
            <p className="text-[#9B7BB8] text-sm">Comece adicionando o primeiro módulo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
