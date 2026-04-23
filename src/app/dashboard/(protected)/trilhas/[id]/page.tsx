"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ChevronLeft, Plus } from "lucide-react";

interface Licao { id: string; titulo: string; tipo: "texto" | "quiz" | "exercicio"; ordem: number; }
interface Modulo { id: string; titulo: string; ordem: number; licoes: Licao[]; }
interface Trilha { id: string; titulo: string; slug: string; emoji: string; is_published: boolean; }

const tipoIcone = { texto: "📖", quiz: "🧩", exercicio: "✍️" };

export default function EditarTrilhaPage() {
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
    const { data: trilhaData } = await supabase.from("tracks").select("id, titulo, slug, emoji, is_published").eq("id", id).single();
    if (!trilhaData) { router.push("/dashboard/trilhas"); return; }
    setTrilha(trilhaData);

    const { data: modulosData } = await supabase.from("modules").select("id, titulo, ordem").eq("track_id", id).order("ordem");
    if (modulosData && modulosData.length > 0) {
      const { data: licoesData } = await supabase.from("lessons").select("id, titulo, tipo, ordem, module_id").in("module_id", modulosData.map(m => m.id)).order("ordem");
      const estrutura: Modulo[] = modulosData.map(mod => ({ ...mod, licoes: (licoesData || []).filter(l => l.module_id === mod.id) }));
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
    await supabase.from("modules").insert({ track_id: id, titulo: novoModulo.trim(), ordem: (modulos[modulos.length - 1]?.ordem || 0) + 1 });
    setNovoModulo(""); setAdicionandoModulo(false); carregar();
  }

  async function excluirModulo(moduloId: string) {
    if (!confirm("Excluir este módulo e todas as lições?")) return;
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

  if (carregando) return <div className="flex justify-center py-20"><div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" /></div>;
  if (!trilha) return null;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/trilhas")} className="text-[#9B7BB8] hover:text-[#1A0A2E] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{trilha.emoji}</span>
            <h1 className="text-[#1A0A2E] text-xl font-semibold truncate">{trilha.titulo}</h1>
          </div>
        </div>
        <button onClick={togglePublicado}
          className={`text-xs px-3 py-1.5 rounded-xl border transition-colors flex-shrink-0 ${
            trilha.is_published ? "border-green-200 text-green-700 bg-green-50" : "border-[#EDD5F5] text-[#9B7BB8]"
          }`}>
          {trilha.is_published ? "Publicada" : "Publicar"}
        </button>
      </div>

      {/* Módulos */}
      <div className="space-y-3">
        {modulos.map((modulo, mi) => (
          <div key={modulo.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <div className="flex items-center p-4">
              <button onClick={() => setModuloAberto(moduloAberto === modulo.id ? null : modulo.id)}
                className="flex-1 flex items-center gap-3 text-left">
                <div className="w-7 h-7 rounded-full bg-[#EDD5F5] text-[#6B3FA0] flex items-center justify-center text-xs font-medium flex-shrink-0">{mi + 1}</div>
                <div>
                  <p className="text-[#1A0A2E] text-sm font-medium">{modulo.titulo}</p>
                  <p className="text-[#9B7BB8] text-[11px]">{modulo.licoes.length} lições</p>
                </div>
                <span className={`text-[#9B7BB8] text-xs ml-2 transition-transform duration-200 ${moduloAberto === modulo.id ? "rotate-180" : ""}`}>▾</span>
              </button>
              <button onClick={() => excluirModulo(modulo.id)} className="text-red-300 text-xs px-2 py-1 hover:text-red-500">✕</button>
            </div>

            <AnimatePresence>
              {moduloAberto === modulo.id && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-[#F0E2FB]">
                  {modulo.licoes.map(licao => (
                    <div key={licao.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#F0E2FB] last:border-0">
                      <span className="text-base">{tipoIcone[licao.tipo]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1A0A2E] text-sm truncate">{licao.titulo}</p>
                        <p className="text-[#9B7BB8] text-[10px] capitalize">{licao.tipo}</p>
                      </div>
                      <button onClick={() => router.push(`/dashboard/trilhas/${id}/modulos/${modulo.id}?licao=${licao.id}`)}
                        className="text-[#6B3FA0] text-xs px-2 py-1 border border-[#EDD5F5] rounded-lg">Editar</button>
                      <button onClick={() => excluirLicao(licao.id)} className="text-red-300 text-xs px-2 py-1 hover:text-red-500">✕</button>
                    </div>
                  ))}
                  <button onClick={() => router.push(`/dashboard/trilhas/${id}/modulos/${modulo.id}`)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-[#6B3FA0] text-sm hover:bg-[#FAF4FF] transition-colors">
                    <Plus size={15} />Adicionar lição
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Novo módulo */}
        <AnimatePresence>
          {adicionandoModulo ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
              <p className="text-[#9B7BB8] text-xs tracking-widests uppercase mb-3">Nome do módulo</p>
              <input autoFocus value={novoModulo} onChange={e => setNovoModulo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && criarModulo()}
                placeholder="Ex: Por que brigamos tanto?"
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors mb-3" />
              <div className="flex gap-2">
                <button onClick={criarModulo} className="flex-1 bg-[#6B3FA0] text-white py-2.5 rounded-xl text-xs">Criar módulo</button>
                <button onClick={() => { setAdicionandoModulo(false); setNovoModulo(""); }}
                  className="flex-1 border border-[#EDD5F5] text-[#9B7BB8] py-2.5 rounded-xl text-xs">Cancelar</button>
              </div>
            </motion.div>
          ) : (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setAdicionandoModulo(true)}
              className="w-full py-4 border-2 border-dashed border-[#EDD5F5] rounded-2xl text-[#6B3FA0] text-sm hover:border-[#6B3FA0] transition-colors flex items-center justify-center gap-2">
              <Plus size={15} /> Adicionar módulo
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
