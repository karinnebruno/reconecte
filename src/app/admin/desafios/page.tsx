"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface Desafio {
  id: string;
  texto: string;
  ordem: number;
}

export default function AdminDesafios() {
  const router = useRouter();
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [textoEdit, setTextoEdit] = useState("");
  const [novoTexto, setNovoTexto] = useState("");
  const [salvando, setSalvando] = useState(false);

  const hoje = Math.floor(Date.now() / 86400000) % 30 + 1;

  async function carregar() {
    const supabase = createClient();
    const { data } = await supabase.from("daily_challenges").select("id, texto, ordem").order("ordem");
    setDesafios(data || []);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function salvarEdicao(id: string) {
    if (!textoEdit.trim()) return;
    setSalvando(true);
    const supabase = createClient();
    await supabase.from("daily_challenges").update({ texto: textoEdit.trim() }).eq("id", id);
    setEditando(null);
    setTextoEdit("");
    setSalvando(false);
    carregar();
  }

  async function adicionarDesafio() {
    if (!novoTexto.trim()) return;
    const proximaOrdem = (desafios[desafios.length - 1]?.ordem ?? 0) + 1;
    if (proximaOrdem > 30) { alert("Já existem 30 desafios cadastrados."); return; }
    setSalvando(true);
    const supabase = createClient();
    await supabase.from("daily_challenges").insert({ texto: novoTexto.trim(), ordem: proximaOrdem });
    setNovoTexto("");
    setSalvando(false);
    carregar();
  }

  async function remover(id: string) {
    if (!confirm("Remover este desafio?")) return;
    const supabase = createClient();
    await supabase.from("daily_challenges").delete().eq("id", id);
    carregar();
  }

  return (
    <div className="min-h-dvh bg-[#FAF4FF]">
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <button onClick={() => router.push("/admin")} className="text-[#9B7BB8] text-sm mb-5 flex items-center gap-2">
          ← Painel
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
          <h1 className="text-white text-2xl font-light">Desafios diários</h1>
          <p className="text-[#9B7BB8] text-xs mt-1">Hoje: desafio #{hoje} · {desafios.length}/30 cadastrados</p>
        </motion.div>
      </div>

      <div className="px-5 pt-5 pb-10 space-y-3">

        {/* Adicionar novo */}
        {desafios.length < 30 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]"
          >
            <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">Adicionar desafio #{desafios.length + 1}</p>
            <textarea
              value={novoTexto}
              onChange={e => setNovoTexto(e.target.value)}
              placeholder="Digite o desafio do dia..."
              rows={3}
              className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors mb-3"
            />
            <button
              onClick={adicionarDesafio}
              disabled={!novoTexto.trim() || salvando}
              className="w-full bg-[#6B3FA0] text-white py-2.5 rounded-xl text-xs disabled:opacity-50 transition-all"
            >
              {salvando ? "Salvando..." : "Adicionar desafio"}
            </button>
          </motion.div>
        )}

        {carregando && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
          </div>
        )}

        {desafios.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)] ${d.ordem === hoje ? "ring-2 ring-[#6B3FA0]" : ""}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                d.ordem === hoje ? "bg-[#6B3FA0] text-white" : "bg-[#EDD5F5] text-[#6B3FA0]"
              }`}>
                {d.ordem}
              </div>
              <div className="flex-1 min-w-0">
                {editando === d.id ? (
                  <>
                    <textarea
                      value={textoEdit}
                      onChange={e => setTextoEdit(e.target.value)}
                      rows={3}
                      className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors mb-2"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => salvarEdicao(d.id)} className="flex-1 bg-[#6B3FA0] text-white py-1.5 rounded-lg text-xs">
                        {salvando ? "Salvando..." : "Salvar"}
                      </button>
                      <button onClick={() => setEditando(null)} className="flex-1 border border-[#EDD5F5] text-[#9B7BB8] py-1.5 rounded-lg text-xs">
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[#1A0A2E] text-sm leading-relaxed">{d.texto}</p>
                    {d.ordem === hoje && (
                      <span className="text-[9px] bg-[#6B3FA0]/10 text-[#6B3FA0] px-2 py-0.5 rounded-full mt-1 inline-block">
                        ✦ Hoje
                      </span>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => { setEditando(d.id); setTextoEdit(d.texto); }}
                        className="text-[10px] text-[#9B7BB8] hover:text-[#6B3FA0]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => remover(d.id)}
                        className="text-[10px] text-red-400"
                      >
                        Remover
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {!carregando && desafios.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">✦</p>
            <p className="text-[#1A0A2E] text-sm font-medium mb-1">Nenhum desafio cadastrado</p>
            <p className="text-[#9B7BB8] text-xs">Adicione os 30 desafios diários acima.</p>
          </div>
        )}
      </div>
    </div>
  );
}
