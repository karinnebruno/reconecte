"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const perguntas = [
  {
    id: 1,
    pergunta: "Como você descreveria seu relacionamento hoje?",
    opcoes: [
      { id: "a", texto: "Está distante — pouco diálogo e conexão" },
      { id: "b", texto: "Tem muitos conflitos e brigas frequentes" },
      { id: "c", texto: "Estou em um momento de decisão difícil" },
      { id: "d", texto: "Quero melhorar mesmo sem crises aparentes" },
    ],
  },
  {
    id: 2,
    pergunta: "Qual é o seu maior desafio agora?",
    opcoes: [
      { id: "a", texto: "Não consigo me comunicar sem brigar" },
      { id: "b", texto: "Perdemos a intimidade e cumplicidade" },
      { id: "c", texto: "Não sei se devo continuar ou terminar" },
      { id: "d", texto: "Quero aprender a ser mais feliz no amor" },
    ],
  },
  {
    id: 3,
    pergunta: "O que você busca com o Reconecte?",
    opcoes: [
      { id: "a", texto: "Reconectar com meu parceiro(a)" },
      { id: "b", texto: "Tomar a melhor decisão para mim" },
      { id: "c", texto: "Entender melhor o outro" },
      { id: "d", texto: "Construir um amor mais saudável" },
    ],
  },
];

const trilhaRecomendada: Record<string, { titulo: string; descricao: string; slug: string }> = {
  comunicacao: {
    titulo: "Comunicação sem conflito",
    descricao: "Aprenda a expressar o que sente sem gerar brigas — e a ouvir de verdade.",
    slug: "comunicacao-sem-conflito",
  },
  reconexao: {
    titulo: "Reconexão emocional",
    descricao: "Recupere a intimidade, a cumplicidade e a alegria de estar junto.",
    slug: "reconexao-emocional",
  },
  decisao: {
    titulo: "Clareza para decidir",
    descricao: "Entenda o que você realmente quer e tome decisões com mais segurança.",
    slug: "clareza-para-decidir",
  },
  felicidade: {
    titulo: "Amor que transforma",
    descricao: "Desenvolva padrões saudáveis e construa um relacionamento que te faz crescer.",
    slug: "amor-que-transforma",
  },
};

function recomendarTrilha(respostas: string[]): string {
  const contagem: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
  respostas.forEach((r) => { contagem[r] = (contagem[r] || 0) + 1; });
  const dominante = Object.entries(contagem).sort((x, y) => y[1] - x[1])[0][0];
  const mapa: Record<string, string> = { a: "comunicacao", b: "reconexao", c: "decisao", d: "felicidade" };
  return mapa[dominante] || "comunicacao";
}

export default function QuizPage() {
  const router = useRouter();
  const [atual, setAtual] = useState(0);
  const [respostas, setRespostas] = useState<string[]>([]);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [saindo, setSaindo] = useState(false);

  const pergunta = perguntas[atual];
  const progresso = ((atual) / perguntas.length) * 100;

  function selecionar(id: string) {
    setSelecionada(id);
  }

  function avancar() {
    if (!selecionada) return;
    const novasRespostas = [...respostas, selecionada];

    if (atual < perguntas.length - 1) {
      setSaindo(true);
      setTimeout(() => {
        setRespostas(novasRespostas);
        setAtual(atual + 1);
        setSelecionada(null);
        setSaindo(false);
      }, 300);
    } else {
      const chave = recomendarTrilha(novasRespostas);
      const trilha = trilhaRecomendada[chave];
      sessionStorage.setItem("trilha_recomendada", JSON.stringify(trilha));
      router.push("/resultado");
    }
  }

  return (
    <div className="min-h-dvh bg-[#FAF4FF] flex flex-col">

      {/* Header com progresso */}
      <div className="bg-[#1A0A2E] px-6 pt-12 pb-6">
        <button
          onClick={() => router.back()}
          className="text-[#9B7BB8] text-sm mb-6 flex items-center gap-2"
        >
          ← Voltar
        </button>
        <p className="text-[#9B7BB8] text-xs tracking-widest uppercase mb-3">
          Pergunta {atual + 1} de {perguntas.length}
        </p>
        {/* Barra de progresso */}
        <div className="w-full h-1 bg-[#6B3FA0]/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#6B3FA0] rounded-full"
            animate={{ width: `${progresso + 33}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Pergunta e opções */}
      <div className="flex-1 flex flex-col px-5 pt-8 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={atual}
            initial={{ opacity: 0, x: saindo ? -20 : 20 }}
            animate={{ opacity: saindo ? 0 : 1, x: saindo ? -20 : 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-[#1A0A2E] text-2xl font-light leading-snug mb-8">
              {pergunta.pergunta}
            </h2>

            <div className="space-y-3 flex-1">
              {pergunta.opcoes.map((opcao) => (
                <button
                  key={opcao.id}
                  onClick={() => selecionar(opcao.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 active:scale-98 ${
                    selecionada === opcao.id
                      ? "bg-[#6B3FA0] border-[#6B3FA0] text-white"
                      : "bg-white border-[#EDD5F5] text-[#1A0A2E] hover:border-[#9B7BB8]"
                  }`}
                >
                  <span className="text-sm leading-relaxed">{opcao.texto}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.button
          onClick={avancar}
          disabled={!selecionada}
          whileTap={{ scale: 0.97 }}
          className={`mt-6 w-full py-4 rounded-2xl text-sm tracking-wide transition-all duration-200 ${
            selecionada
              ? "bg-[#1A0A2E] text-white"
              : "bg-[#EDD5F5] text-[#9B7BB8] cursor-not-allowed"
          }`}
        >
          {atual < perguntas.length - 1 ? "Continuar" : "Ver minha trilha"}
        </motion.button>
      </div>
    </div>
  );
}
