"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Plus } from "lucide-react";

interface Desafio {
  id: string;
  texto: string;
  ordem: number;
}

export default function DesafiosPage() {
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

  async function adicionar() {
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
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-[#1A0A2E] text-2xl font-semibold">Desafios diários</h1>
        <p className="text-[#9B7BB8] text-sm mt-0.5">Hoje: desafio #{hoje} · {desafios.length}/30 cadastrados</p>
      </div>

      {/* Adicionar novo */}
      {desafios.length < 30 && (
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)] space-y-3">
          <p className="text-[#9B7BB8] text-[10px] tracking-widests uppercase">Adicionar desafio #{desafios.length + 1}</p>
          <textarea
            value={novoTexto}
            onChange={e => setNovoTexto(e.target.value)}
            placeholder="Digite o texto do desafio..."
            rows={3}
            className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors"
          />
          <button onClick={adicionar} disabled={!novoTexto.trim() || salvando}
            className="flex items-center gap-2 bg-[#6B3FA0] hover:bg-[#7D50B5] text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
            <Plus size={15} />
            {salvando ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {carregando ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
          </div>
        ) : desafios.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <p className="text-[#9B7BB8] text-sm">Nenhum desafio cadastrado ainda.</p>
          </div>
        ) : desafios.map(d => (
          <div key={d.id}
            className={`bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)] flex items-start gap-3 ${d.ordem === hoje ? "ring-2 ring-[#6B3FA0]" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
              d.ordem === hoje ? "bg-[#6B3FA0] text-white" : "bg-[#EDD5F5] text-[#6B3FA0]"
            }`}>
              {d.ordem}
            </div>
            <div className="flex-1 min-w-0">
              {editando === d.id ? (
                <div className="space-y-2">
                  <textarea value={textoEdit} onChange={e => setTextoEdit(e.target.value)} rows={3}
                    className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors" />
                  <div className="flex gap-2">
                    <button onClick={() => salvarEdicao(d.id)}
                      className="flex-1 bg-[#6B3FA0] text-white py-1.5 rounded-lg text-xs">
                      {salvando ? "Salvando..." : "Salvar"}
                    </button>
                    <button onClick={() => setEditando(null)}
                      className="flex-1 border border-[#EDD5F5] text-[#9B7BB8] py-1.5 rounded-lg text-xs">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[#1A0A2E] text-sm leading-relaxed">{d.texto}</p>
                  {d.ordem === hoje && (
                    <span className="text-[9px] bg-[#6B3FA0]/10 text-[#6B3FA0] px-2 py-0.5 rounded-full mt-1 inline-block">✦ Hoje</span>
                  )}
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => { setEditando(d.id); setTextoEdit(d.texto); }}
                      className="text-[10px] text-[#9B7BB8] hover:text-[#6B3FA0]">
                      Editar
                    </button>
                    <button onClick={() => remover(d.id)} className="text-[10px] text-red-400">
                      Remover
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
