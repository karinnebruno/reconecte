"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Plus, TrendingUp, TrendingDown, DollarSign, Download } from "lucide-react";
import LancamentoModal from "@/components/dashboard/LancamentoModal";

interface Lancamento {
  id: string;
  tipo: "entrada" | "saida";
  valor: number;
  descricao: string | null;
  categoria: string | null;
  data: string;
  paciente_nome?: string | null;
}

type Periodo = "mes" | "trimestre" | "ano";

export default function FinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>("mes");

  async function carregar() {
    setCarregando(true);
    const supabase = createClient();
    const agora = new Date();
    let inicio: Date;
    if (periodo === "mes") inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
    else if (periodo === "trimestre") inicio = new Date(agora.getFullYear(), agora.getMonth() - 2, 1);
    else inicio = new Date(agora.getFullYear(), 0, 1);

    const { data } = await supabase
      .from("financial_entries")
      .select("id, tipo, valor, descricao, categoria, data, patients(nome)")
      .gte("data", inicio.toISOString())
      .order("data", { ascending: false });

    setLancamentos(
      (data || []).map((l: Record<string, unknown>) => ({
        ...l,
        paciente_nome: (l.patients as { nome?: string } | null)?.nome ?? null,
      })) as Lancamento[]
    );
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, [periodo]);

  const entradas = lancamentos.filter(l => l.tipo === "entrada");
  const saidas = lancamentos.filter(l => l.tipo === "saida");
  const totalEntradas = entradas.reduce((s, l) => s + l.valor, 0);
  const totalSaidas = saidas.reduce((s, l) => s + l.valor, 0);
  const lucro = totalEntradas - totalSaidas;

  function exportarCSV() {
    const header = "Data,Tipo,Descrição,Categoria,Valor,Paciente";
    const linhas = lancamentos.map(l =>
      [
        new Date(l.data).toLocaleDateString("pt-BR"),
        l.tipo,
        `"${l.descricao || ""}"`,
        `"${l.categoria || ""}"`,
        l.valor.toFixed(2).replace(".", ","),
        `"${l.paciente_nome || ""}"`,
      ].join(",")
    );
    const csv = [header, ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro_${periodo}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  const labelPeriodo: Record<Periodo, string> = {
    mes: "Este mês",
    trimestre: "Últimos 3 meses",
    ano: "Este ano",
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[#1A0A2E] text-2xl font-semibold">Financeiro</h1>
          <p className="text-[#9B7BB8] text-sm mt-0.5">{labelPeriodo[periodo]}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Período */}
          <div className="flex rounded-xl border border-[#EDD5F5] overflow-hidden bg-white">
            {(["mes", "trimestre", "ano"] as const).map(p => (
              <button key={p} onClick={() => setPeriodo(p)}
                className={`px-3 py-2 text-xs transition-colors ${
                  periodo === p ? "bg-[#6B3FA0] text-white" : "text-[#9B7BB8] hover:text-[#1A0A2E]"
                }`}>
                {p === "mes" ? "Mês" : p === "trimestre" ? "Trim." : "Ano"}
              </button>
            ))}
          </div>
          <button onClick={exportarCSV}
            className="flex items-center gap-1.5 border border-[#EDD5F5] text-[#9B7BB8] px-3 py-2 rounded-xl text-xs hover:text-[#1A0A2E] hover:bg-[#FAF4FF] transition-colors bg-white">
            <Download size={13} />
            Exportar CSV
          </button>
          <button onClick={() => setModalAberto(true)}
            className="flex items-center gap-1.5 bg-[#6B3FA0] hover:bg-[#7D50B5] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} />
            Lançamento
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-green-600" strokeWidth={1.5} />
          </div>
          <p className="text-[#1A0A2E] text-xl font-light">
            R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[#9B7BB8] text-xs mt-0.5">Entradas</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <TrendingDown size={18} className="text-red-500" strokeWidth={1.5} />
          </div>
          <p className="text-[#1A0A2E] text-xl font-light">
            R$ {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[#9B7BB8] text-xs mt-0.5">Saídas</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${lucro >= 0 ? "bg-[#EDD5F5]" : "bg-red-50"}`}>
            <DollarSign size={18} className={lucro >= 0 ? "text-[#6B3FA0]" : "text-red-500"} strokeWidth={1.5} />
          </div>
          <p className={`text-xl font-light ${lucro >= 0 ? "text-[#1A0A2E]" : "text-red-500"}`}>
            R$ {lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[#9B7BB8] text-xs mt-0.5">Lucro</p>
        </div>
      </div>

      {/* Tabela de lançamentos */}
      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(26,10,46,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F0E2FB]">
          <h2 className="text-[#1A0A2E] text-sm font-semibold">Lançamentos</h2>
        </div>
        {carregando ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
          </div>
        ) : lancamentos.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[#9B7BB8] text-sm">Nenhum lançamento no período.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F5F0FB]">
                  <th className="text-left text-[#9B7BB8] text-[10px] tracking-widest uppercase px-5 py-3">Data</th>
                  <th className="text-left text-[#9B7BB8] text-[10px] tracking-widest uppercase px-3 py-3">Descrição</th>
                  <th className="text-left text-[#9B7BB8] text-[10px] tracking-widest uppercase px-3 py-3 hidden sm:table-cell">Categoria</th>
                  <th className="text-left text-[#9B7BB8] text-[10px] tracking-widest uppercase px-3 py-3 hidden md:table-cell">Paciente</th>
                  <th className="text-right text-[#9B7BB8] text-[10px] tracking-widests uppercase px-5 py-3">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0FB]">
                {lancamentos.map(l => (
                  <tr key={l.id} className="hover:bg-[#FAF4FF] transition-colors">
                    <td className="px-5 py-3.5 text-[#9B7BB8] text-xs whitespace-nowrap">
                      {new Date(l.data).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-3 py-3.5 text-[#1A0A2E]">
                      {l.descricao || <span className="text-[#9B7BB8]">—</span>}
                    </td>
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      {l.categoria ? (
                        <span className="text-[10px] bg-[#EDD5F5] text-[#6B3FA0] px-2 py-0.5 rounded-md">{l.categoria}</span>
                      ) : <span className="text-[#9B7BB8]">—</span>}
                    </td>
                    <td className="px-3 py-3.5 text-[#9B7BB8] text-xs hidden md:table-cell">
                      {l.paciente_nome || "—"}
                    </td>
                    <td className={`px-5 py-3.5 text-right font-medium whitespace-nowrap ${
                      l.tipo === "entrada" ? "text-green-600" : "text-red-500"
                    }`}>
                      {l.tipo === "entrada" ? "+" : "-"}R$ {l.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAberto && (
        <LancamentoModal
          onClose={() => setModalAberto(false)}
          onSalvo={() => { setModalAberto(false); carregar(); }}
        />
      )}
    </div>
  );
}
