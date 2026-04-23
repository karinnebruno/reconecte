"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ChevronLeft } from "lucide-react";

const emojisOpcoes = ["💬", "❤️", "🧭", "🌱", "🔒", "🤝", "💡", "🌿", "✨", "🧠"];

export default function NovaTrilhaPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [slug, setSlug] = useState("");
  const [emoji, setEmoji] = useState("💬");
  const [isPremium, setIsPremium] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function gerarSlug(texto: string) {
    return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  }

  function onChangeTitulo(v: string) { setTitulo(v); setSlug(gerarSlug(v)); }

  async function salvar() {
    if (!titulo.trim() || !slug.trim()) { setErro("Título e slug são obrigatórios."); return; }
    setSalvando(true); setErro("");
    const supabase = createClient();
    const { data: ultima } = await supabase.from("tracks").select("ordem").order("ordem", { ascending: false }).limit(1).single();
    const { error } = await supabase.from("tracks").insert({
      titulo: titulo.trim(), descricao: descricao.trim(), slug: slug.trim(),
      emoji, is_premium: isPremium, is_published: false, ordem: (ultima?.ordem || 0) + 1,
    });
    if (error) {
      setErro(error.message.includes("unique") ? "Esse slug já existe." : "Erro ao salvar.");
      setSalvando(false); return;
    }
    router.push("/dashboard/trilhas");
  }

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#9B7BB8] hover:text-[#1A0A2E] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-[#1A0A2E] text-2xl font-semibold">Nova trilha</h1>
          <p className="text-[#9B7BB8] text-sm">Será salva como rascunho</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)] space-y-5">
        {/* Emoji */}
        <div>
          <p className="text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-3">Ícone</p>
          <div className="flex gap-2 flex-wrap">
            {emojisOpcoes.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all ${
                  emoji === e ? "bg-[#6B3FA0] scale-110" : "bg-[#FAF4FF] border border-[#EDD5F5]"
                }`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Título</label>
          <input value={titulo} onChange={e => onChangeTitulo(e.target.value)} placeholder="Ex: Comunicação sem conflito"
            className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors" />
        </div>

        <div>
          <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Slug (URL)</label>
          <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="comunicacao-sem-conflito"
            className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] font-mono focus:outline-none focus:border-[#6B3FA0] transition-colors" />
        </div>

        <div>
          <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Descrição</label>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
            placeholder="Descreva em uma frase o que o paciente vai aprender..." rows={3}
            className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors" />
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-[#1A0A2E] text-sm font-medium">Conteúdo premium</p>
            <p className="text-[#9B7BB8] text-xs mt-0.5">Somente para usuários pagantes</p>
          </div>
          <button onClick={() => setIsPremium(!isPremium)}
            className={`w-12 h-6 rounded-full transition-all duration-200 relative ${isPremium ? "bg-[#6B3FA0]" : "bg-[#EDD5F5]"}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${isPremium ? "left-6" : "left-0.5"}`} />
          </button>
        </div>

        {erro && <p className="text-red-500 text-xs">{erro}</p>}

        <button onClick={salvar} disabled={salvando}
          className="w-full bg-[#6B3FA0] hover:bg-[#7D50B5] text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
          {salvando ? "Salvando..." : "Criar trilha"}
        </button>
      </div>
    </div>
  );
}
