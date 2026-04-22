"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const emojisOpcoes = ["💬", "❤️", "🧭", "🌱", "🔒", "🤝", "💡", "🌿", "✨", "🧠"];

export default function NovaTrilha() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [slug, setSlug] = useState("");
  const [emoji, setEmoji] = useState("💬");
  const [isPremium, setIsPremium] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function gerarSlug(texto: string) {
    return texto
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function onChangeTitulo(v: string) {
    setTitulo(v);
    setSlug(gerarSlug(v));
  }

  async function salvar() {
    if (!titulo.trim() || !slug.trim()) { setErro("Título e slug são obrigatórios."); return; }
    setSalvando(true);
    setErro("");

    const supabase = createClient();
    const { data: ultima } = await supabase.from("tracks").select("ordem").order("ordem", { ascending: false }).limit(1).single();
    const ordemNova = (ultima?.ordem || 0) + 1;

    const { error } = await supabase.from("tracks").insert({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      slug: slug.trim(),
      emoji,
      is_premium: isPremium,
      is_published: false,
      ordem: ordemNova,
    });

    if (error) {
      setErro(error.message.includes("unique") ? "Esse slug já existe. Escolha outro." : "Erro ao salvar.");
      setSalvando(false);
      return;
    }

    router.push("/admin/trilhas");
  }

  return (
    <div className="min-h-dvh bg-[#FAF4FF]">
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <button onClick={() => router.back()} className="text-[#9B7BB8] text-sm mb-5 flex items-center gap-2">
          ← Trilhas
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Nova trilha</p>
          <h1 className="text-white text-2xl font-light">Criar trilha</h1>
        </motion.div>
      </div>

      <div className="px-5 pt-6 pb-10 space-y-5">

        {/* Emoji */}
        <div>
          <p className="text-[#9B7BB8] text-xs tracking-widest uppercase mb-3">Ícone</p>
          <div className="flex gap-2 flex-wrap">
            {emojisOpcoes.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all ${
                  emoji === e ? "bg-[#6B3FA0] scale-110" : "bg-white border border-[#EDD5F5]"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Título</label>
          <input
            value={titulo}
            onChange={e => onChangeTitulo(e.target.value)}
            placeholder="Ex: Comunicação sem conflito"
            className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Slug (URL)</label>
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="comunicacao-sem-conflito"
            className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors font-mono"
          />
          <p className="text-[#9B7BB8] text-[10px] mt-1">Gerado automaticamente. Não use espaços ou acentos.</p>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Descrição</label>
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Descreva em uma frase o que o usuário vai aprender..."
            rows={3}
            className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors"
          />
        </div>

        {/* Premium */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-4 border border-[#EDD5F5]">
          <div>
            <p className="text-[#1A0A2E] text-sm font-medium">Conteúdo premium</p>
            <p className="text-[#9B7BB8] text-xs mt-0.5">Somente para usuários pagantes</p>
          </div>
          <button
            onClick={() => setIsPremium(!isPremium)}
            className={`w-12 h-6 rounded-full transition-all duration-200 relative ${isPremium ? "bg-[#6B3FA0]" : "bg-[#EDD5F5]"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${isPremium ? "left-6" : "left-0.5"}`} />
          </button>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-xs">{erro}</p>
          </div>
        )}

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full bg-[#1A0A2E] text-white py-4 rounded-2xl text-sm tracking-wide hover:bg-[#6B3FA0] transition-all duration-200 disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Criar trilha"}
        </button>

        <p className="text-[#9B7BB8] text-xs text-center">
          A trilha será salva como rascunho. Publique quando o conteúdo estiver pronto.
        </p>
      </div>
    </div>
  );
}
