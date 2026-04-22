"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BottomNav } from "@/components/ui";

interface Trilha {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  emoji: string;
  is_premium: boolean;
  totalLicoes: number;
  licoesConcluidas: number;
}

export default function TrilhasPage() {
  const router = useRouter();
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [comprando, setComprando] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/entrar"); return; }

      const { data: tracksData } = await supabase
        .from("tracks")
        .select("id, slug, titulo, descricao, emoji, is_premium")
        .eq("is_published", true)
        .order("ordem");

      if (!tracksData || tracksData.length === 0) {
        setCarregando(false);
        return;
      }

      const trackIds = tracksData.map(t => t.id);

      const { data: modulosData } = await supabase
        .from("modules")
        .select("id, track_id")
        .in("track_id", trackIds);

      const moduloIds = (modulosData || []).map(m => m.id);

      const { data: licoesData } = await supabase
        .from("lessons")
        .select("id, module_id")
        .in("module_id", moduloIds.length > 0 ? moduloIds : ["none"]);

      const { data: progressoData } = await supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("user_id", user.id);

      const concluidasSet = new Set((progressoData || []).map(p => p.lesson_id));

      const moduloPorTrack: Record<string, string[]> = {};
      for (const mod of modulosData || []) {
        if (!moduloPorTrack[mod.track_id]) moduloPorTrack[mod.track_id] = [];
        moduloPorTrack[mod.track_id].push(mod.id);
      }

      const licoesPorModulo: Record<string, string[]> = {};
      for (const lic of licoesData || []) {
        if (!licoesPorModulo[lic.module_id]) licoesPorModulo[lic.module_id] = [];
        licoesPorModulo[lic.module_id].push(lic.id);
      }

      const resultado: Trilha[] = tracksData.map(track => {
        const modIds = moduloPorTrack[track.id] || [];
        const licIds = modIds.flatMap(mid => licoesPorModulo[mid] || []);
        const concluidas = licIds.filter(lid => concluidasSet.has(lid)).length;

        return {
          ...track,
          totalLicoes: licIds.length,
          licoesConcluidas: concluidas,
        };
      });

      setTrilhas(resultado);
      setCarregando(false);
    }

    carregar();
  }, [router]);

  if (carregando) {
    return (
      <div className="min-h-dvh bg-[#FAF4FF] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FAF4FF] pb-24">

      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">Sua rotina saudável</p>
          <h1 className="text-white text-2xl font-light">Desafios do casal</h1>
        </motion.div>
      </div>

      <div className="px-5 pt-5 space-y-3">
        {trilhas.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-[#1A0A2E] text-sm font-medium mb-1">Nenhuma trilha disponível ainda</p>
            <p className="text-[#9B7BB8] text-xs">Novas trilhas serão publicadas em breve.</p>
          </div>
        )}

        {trilhas.map((trilha, i) => {
          const progresso = trilha.totalLicoes > 0
            ? Math.round((trilha.licoesConcluidas / trilha.totalLicoes) * 100)
            : 0;

          async function handleComprar() {
            setComprando(trilha.id);
            const res = await fetch("/api/checkout-track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ trackId: trilha.id, trackSlug: trilha.slug, trackTitulo: trilha.titulo, trackEmoji: trilha.emoji }),
            });
            const { url } = await res.json();
            if (url) window.location.href = url;
            else setComprando(null);
          }

          return (
            <motion.div
              key={trilha.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="w-full text-left rounded-2xl shadow-[0_2px_16px_rgba(26,10,46,0.06)] bg-white overflow-hidden"
            >
              <button
                className="w-full flex gap-3 items-center p-4"
                onClick={() => !trilha.is_premium && router.push(`/trilhas/${trilha.slug}`)}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    trilha.is_premium ? "bg-[#EDD5F5]" : "bg-gradient-to-br from-[#6B3FA0] to-[#B07FD4]"
                  }`}
                >
                  {trilha.is_premium ? (
                    <span className="relative">
                      <span className="text-2xl">{trilha.emoji}</span>
                    </span>
                  ) : trilha.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className={`text-sm font-medium truncate ${trilha.is_premium ? "text-[#9B7BB8]" : "text-[#1A0A2E]"}`}>
                      {trilha.titulo}
                    </p>
                    {trilha.is_premium && (
                      <svg className="w-4 h-4 text-[#9B7BB8] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-[#9B7BB8] text-xs mb-2">
                    {trilha.totalLicoes > 0 ? `${trilha.totalLicoes} lições` : "Conteúdo em breve"}
                  </p>
                  {!trilha.is_premium && trilha.totalLicoes > 0 && (
                    <div className="w-full h-1 bg-[#EDD5F5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#6B3FA0] to-[#B07FD4] rounded-full transition-all duration-700"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                  )}
                </div>
              </button>

              {trilha.is_premium && (
                <div className="px-4 pb-4">
                  <button
                    onClick={handleComprar}
                    disabled={comprando === trilha.id}
                    className="w-full bg-[#6B3FA0] text-white py-2.5 rounded-xl text-xs font-medium tracking-wide disabled:opacity-60 transition-all"
                  >
                    {comprando === trilha.id ? "Aguarde..." : "🔓 Desbloquear por R$ 15,00"}
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
