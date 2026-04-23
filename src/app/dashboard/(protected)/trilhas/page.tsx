"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Plus } from "lucide-react";

interface Trilha {
  id: string;
  titulo: string;
  slug: string;
  emoji: string;
  is_published: boolean;
  is_premium: boolean;
  ordem: number;
}

export default function TrilhasPage() {
  const router = useRouter();
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    const supabase = createClient();
    const { data } = await supabase.from("tracks").select("id, titulo, slug, emoji, is_published, is_premium, ordem").order("ordem");
    setTrilhas(data || []);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function togglePublicado(trilha: Trilha) {
    const supabase = createClient();
    await supabase.from("tracks").update({ is_published: !trilha.is_published }).eq("id", trilha.id);
    carregar();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta trilha e todo seu conteúdo?")) return;
    const supabase = createClient();
    await supabase.from("tracks").delete().eq("id", id);
    carregar();
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1A0A2E] text-2xl font-semibold">Trilhas</h1>
          <p className="text-[#9B7BB8] text-sm mt-0.5">{trilhas.length} trilhas</p>
        </div>
        <button onClick={() => router.push("/dashboard/trilhas/nova")}
          className="flex items-center gap-2 bg-[#6B3FA0] hover:bg-[#7D50B5] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus size={15} />
          Nova trilha
        </button>
      </div>

      <div className="space-y-3">
        {carregando ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
          </div>
        ) : trilhas.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <p className="text-[#1A0A2E] text-sm font-medium mb-1">Nenhuma trilha ainda</p>
            <p className="text-[#9B7BB8] text-xs">Clique em "Nova trilha" para começar.</p>
          </div>
        ) : trilhas.map(trilha => (
          <div key={trilha.id} className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6B3FA0, #B07FD4)" }}>
                {trilha.emoji || "📚"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1A0A2E] text-sm font-medium truncate">{trilha.titulo}</p>
                <p className="text-[#9B7BB8] text-xs">{trilha.slug}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {trilha.is_premium && (
                  <span className="text-[9px] bg-[#EDD5F5] text-[#6B3FA0] px-2 py-0.5 rounded-full">Premium</span>
                )}
                <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                  trilha.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {trilha.is_published ? "Publicada" : "Rascunho"}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-[#F0E2FB]">
              <button onClick={() => router.push(`/dashboard/trilhas/${trilha.id}`)}
                className="flex-1 py-2 text-xs text-[#6B3FA0] border border-[#EDD5F5] rounded-xl hover:bg-[#FAF4FF] transition-colors">
                Editar conteúdo
              </button>
              <button onClick={() => togglePublicado(trilha)}
                className="flex-1 py-2 text-xs text-[#1A0A2E] border border-[#EDD5F5] rounded-xl hover:bg-[#FAF4FF] transition-colors">
                {trilha.is_published ? "Despublicar" : "Publicar"}
              </button>
              <button onClick={() => excluir(trilha.id)}
                className="px-3 py-2 text-xs text-red-400 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
