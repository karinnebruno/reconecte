"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Suspense } from "react";

type Tipo = "texto" | "quiz" | "exercicio";

interface BlocoTexto { tipo: "paragrafo" | "destaque"; valor: string; }
interface ConteudoTexto { blocos: BlocoTexto[]; }
interface ConteudoQuiz { pergunta: string; opcoes: string[]; resposta_correta: number; explicacao: string; }
interface ConteudoExercicio { instrucao: string; reflexao: string; campo_resposta: boolean; }

function EditorLicao() {
  const router = useRouter();
  const { id: trilhaId, moduloId } = useParams();
  const searchParams = useSearchParams();
  const licaoId = searchParams.get("licao");

  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<Tipo>("texto");
  const [ordemModulo, setOrdemModulo] = useState(1);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // Texto
  const [blocos, setBlocos] = useState<BlocoTexto[]>([{ tipo: "paragrafo", valor: "" }]);

  // Quiz
  const [quizPergunta, setQuizPergunta] = useState("");
  const [quizOpcoes, setQuizOpcoes] = useState(["", "", "", ""]);
  const [quizCorreta, setQuizCorreta] = useState(0);
  const [quizExplicacao, setQuizExplicacao] = useState("");

  // Exercício
  const [instrucao, setInstrucao] = useState("");
  const [reflexao, setReflexao] = useState("");
  const [campoResposta, setCampoResposta] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function carregar() {
      // Próxima ordem
      const { data: licoes } = await supabase
        .from("lessons")
        .select("ordem")
        .eq("module_id", moduloId)
        .order("ordem", { ascending: false })
        .limit(1);
      setOrdemModulo((licoes?.[0]?.ordem || 0) + 1);

      // Se editando lição existente
      if (licaoId) {
        const { data: licao } = await supabase
          .from("lessons")
          .select("titulo, tipo, conteudo, ordem")
          .eq("id", licaoId)
          .single();
        if (licao) {
          setTitulo(licao.titulo);
          setTipo(licao.tipo as Tipo);
          setOrdemModulo(licao.ordem);
          const c = licao.conteudo;
          if (licao.tipo === "texto") setBlocos((c as ConteudoTexto).blocos || [{ tipo: "paragrafo", valor: "" }]);
          if (licao.tipo === "quiz") {
            const q = c as ConteudoQuiz;
            setQuizPergunta(q.pergunta || "");
            setQuizOpcoes(q.opcoes?.length === 4 ? q.opcoes : ["", "", "", ""]);
            setQuizCorreta(q.resposta_correta ?? 0);
            setQuizExplicacao(q.explicacao || "");
          }
          if (licao.tipo === "exercicio") {
            const e = c as ConteudoExercicio;
            setInstrucao(e.instrucao || "");
            setReflexao(e.reflexao || "");
            setCampoResposta(e.campo_resposta ?? true);
          }
        }
      }
    }
    carregar();
  }, [moduloId, licaoId]);

  function montarConteudo() {
    if (tipo === "texto") return { blocos: blocos.filter(b => b.valor.trim()) };
    if (tipo === "quiz") return { pergunta: quizPergunta, opcoes: quizOpcoes, resposta_correta: quizCorreta, explicacao: quizExplicacao };
    return { instrucao, reflexao, campo_resposta: campoResposta };
  }

  async function salvar() {
    if (!titulo.trim()) { setErro("O título é obrigatório."); return; }
    setSalvando(true); setErro("");
    const supabase = createClient();
    const payload = { module_id: moduloId, titulo: titulo.trim(), tipo, conteudo: montarConteudo(), ordem: ordemModulo };

    const { error } = licaoId
      ? await supabase.from("lessons").update(payload).eq("id", licaoId)
      : await supabase.from("lessons").insert(payload);

    if (error) { setErro("Erro ao salvar."); setSalvando(false); return; }
    router.push(`/admin/trilhas/${trilhaId}`);
  }

  return (
    <div className="min-h-dvh bg-[#FAF4FF]">
      <div className="bg-[#1A0A2E] px-5 pt-12 pb-6">
        <button onClick={() => router.back()} className="text-[#9B7BB8] text-sm mb-5 flex items-center gap-2">← Voltar</button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#9B7BB8] text-xs tracking-[0.2em] uppercase mb-1">{licaoId ? "Editar lição" : "Nova lição"}</p>
          <h1 className="text-white text-2xl font-light">{licaoId ? "Editar" : "Criar lição"}</h1>
        </motion.div>
      </div>

      <div className="px-5 pt-6 pb-10 space-y-5">

        {/* Título */}
        <div>
          <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Título da lição</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="Ex: O ciclo do conflito"
            className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
          />
        </div>

        {/* Tipo */}
        {!licaoId && (
          <div>
            <p className="text-[#9B7BB8] text-xs tracking-widest uppercase mb-3">Tipo de lição</p>
            <div className="grid grid-cols-3 gap-2">
              {([["texto", "📖", "Leitura"], ["quiz", "🧩", "Quiz"], ["exercicio", "✍️", "Exercício"]] as const).map(([t, icon, label]) => (
                <button key={t} onClick={() => setTipo(t)}
                  className={`py-3 rounded-2xl text-sm flex flex-col items-center gap-1 border transition-all ${tipo === t ? "bg-[#6B3FA0] border-[#6B3FA0] text-white" : "bg-white border-[#EDD5F5] text-[#1A0A2E]"}`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editor: texto */}
        {tipo === "texto" && (
          <div className="space-y-3">
            <p className="text-[#9B7BB8] text-xs tracking-widest uppercase">Blocos de conteúdo</p>
            {blocos.map((bloco, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-[#EDD5F5]">
                <div className="flex gap-2 mb-2">
                  {(["paragrafo", "destaque"] as const).map(t => (
                    <button key={t} onClick={() => setBlocos(blocos.map((b, bi) => bi === i ? { ...b, tipo: t } : b))}
                      className={`text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full transition-all ${bloco.tipo === t ? "bg-[#6B3FA0] text-white" : "bg-[#EDD5F5] text-[#6B3FA0]"}`}
                    >
                      {t === "paragrafo" ? "Parágrafo" : "Destaque"}
                    </button>
                  ))}
                  {blocos.length > 1 && (
                    <button onClick={() => setBlocos(blocos.filter((_, bi) => bi !== i))} className="ml-auto text-red-300 text-xs px-2">✕</button>
                  )}
                </div>
                <textarea value={bloco.valor}
                  onChange={e => setBlocos(blocos.map((b, bi) => bi === i ? { ...b, valor: e.target.value } : b))}
                  placeholder={bloco.tipo === "destaque" ? "Frase de destaque em itálico..." : "Texto do parágrafo..."}
                  rows={3}
                  className="w-full bg-[#FAF4FF] border border-[#F0E2FB] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors"
                />
              </div>
            ))}
            <button onClick={() => setBlocos([...blocos, { tipo: "paragrafo", valor: "" }])}
              className="w-full py-3 border-2 border-dashed border-[#EDD5F5] rounded-2xl text-[#6B3FA0] text-sm">
              + Adicionar bloco
            </button>
          </div>
        )}

        {/* Editor: quiz */}
        {tipo === "quiz" && (
          <div className="space-y-4">
            <div>
              <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Pergunta</label>
              <textarea value={quizPergunta} onChange={e => setQuizPergunta(e.target.value)} rows={2}
                placeholder="Qual é a pergunta do quiz?"
                className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <p className="text-[#9B7BB8] text-xs tracking-widest uppercase">Opções (selecione a correta)</p>
              {quizOpcoes.map((op, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <button onClick={() => setQuizCorreta(i)}
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs border-2 transition-all ${quizCorreta === i ? "bg-[#6B3FA0] border-[#6B3FA0] text-white" : "border-[#EDD5F5] text-[#9B7BB8]"}`}
                  >
                    {quizCorreta === i ? "✓" : i + 1}
                  </button>
                  <input value={op} onChange={e => setQuizOpcoes(quizOpcoes.map((o, oi) => oi === i ? e.target.value : o))}
                    placeholder={`Opção ${i + 1}`}
                    className="flex-1 bg-white border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Explicação após resposta</label>
              <textarea value={quizExplicacao} onChange={e => setQuizExplicacao(e.target.value)} rows={3}
                placeholder="Explique por que essa é a resposta correta..."
                className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Editor: exercício */}
        {tipo === "exercicio" && (
          <div className="space-y-4">
            <div>
              <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Instrução do exercício</label>
              <textarea value={instrucao} onChange={e => setInstrucao(e.target.value)} rows={3}
                placeholder="Descreva o que o usuário deve fazer..."
                className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#9B7BB8] text-xs tracking-widest uppercase mb-2">Pergunta de reflexão</label>
              <textarea value={reflexao} onChange={e => setReflexao(e.target.value)} rows={2}
                placeholder="Uma pergunta para aprofundar a reflexão..."
                className="w-full bg-white border border-[#EDD5F5] rounded-2xl px-4 py-3 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors"
              />
            </div>
            <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-4 border border-[#EDD5F5]">
              <div>
                <p className="text-[#1A0A2E] text-sm">Campo de resposta livre</p>
                <p className="text-[#9B7BB8] text-xs mt-0.5">Usuário pode escrever sua reflexão</p>
              </div>
              <button onClick={() => setCampoResposta(!campoResposta)}
                className={`w-12 h-6 rounded-full transition-all duration-200 relative ${campoResposta ? "bg-[#6B3FA0]" : "bg-[#EDD5F5]"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${campoResposta ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        )}

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-xs">{erro}</p>
          </div>
        )}

        <button onClick={salvar} disabled={salvando}
          className="w-full bg-[#1A0A2E] text-white py-4 rounded-2xl text-sm tracking-wide hover:bg-[#6B3FA0] transition-all duration-200 disabled:opacity-60"
        >
          {salvando ? "Salvando..." : licaoId ? "Salvar alterações" : "Criar lição"}
        </button>
      </div>
    </div>
  );
}

export default function EditorLicaoPage() {
  return <Suspense><EditorLicao /></Suspense>;
}
