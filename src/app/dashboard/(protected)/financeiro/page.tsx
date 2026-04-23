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
}

function getDescricaoDisplay(l: Lancamento): string {
  if (!l.descricao) return l.categoria || "—";
  const m = l.descricao.match(/^Sessões - (.+)$/);
  if (m) return m[1];
  return l.descricao;
}

function getCategoriaDisplay(l: Lancamento): string {
  if (l.tipo === "entrada") return l.valor <= 350 ? "Orientação" : "Protocolo";
  return l.categoria || l.descricao || "—";
}

function hoje(): string {
  return new Date().toISOString().split("T")[0];
}

function primeiroDiaMes(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

export default function FinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [dataInicio, setDataInicio] = useState(primeiroDiaMes());
  const [dataFim, setDataFim] = useState(hoje());

  async function carregar() {
    setCarregando(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("financial_entries")
      .select("id, tipo, valor, descricao, categoria, data")
      .gte("data", dataInicio)
      .lte("data", dataFim + "T23:59:59")
      .order("data", { ascending: false });

    setLancamentos((data || []) as Lancamento[]);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, [dataInicio, dataFim]);

  const entradas = lancamentos.filter(l => l.tipo === "entrada");
  const saidas = lancamentos.filter(l => l.tipo === "saida");
  const totalEntradas = entradas.reduce((s, l) => s + l.valor, 0);
  const totalSaidas = saidas.reduce((s, l) => s + l.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  function exportarCSV() {
    const header = "Data,Descrição,Categoria,Tipo,Valor";
    const linhas = lancamentos.map(l =>
      [
        new Date(l.data).toLocaleDateString("pt-BR"),
        `"${getDescricaoDisplay(l)}"`,
        `"${getCategoriaDisplay(l)}"`,
        l.tipo,
        (l.tipo === "entrada" ? "" : "-") + l.valor.toFixed(2).replace(".", ","),
      ].join(",")
    );
    const csv = [header, ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro_${dataInicio}_${dataFim}.csv`;
    a.click();
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[#1A0A2E] text-2xl font-semibold">Financeiro</h1>
          <p className="text-[#9B7BB8] text-sm mt-0.5">{lancamentos.length} lançamentos no período</p>
        </div>
        <div className="flex gap-2 flex-wrap">
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

      {/* Filtro de data */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)] flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">De</label>
          <input
            type="date"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
            className="border border-[#EDD5F5] rounded-xl px-3 py-2 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Até</label>
          <input
            type="date"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
            className="border border-[#EDD5F5] rounded-xl px-3 py-2 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors"
          />
        </div>
        {/* Atalhos rápidos */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { label: "Este mês", fn: () => { setDataInicio(primeiroDiaMes()); setDataFim(hoje()); } },
            { label: "Mês passado", fn: () => {
              const d = new Date(); const y = d.getFullYear(); const m = d.getMonth();
              const ini = new Date(y, m - 1, 1); const fim = new Date(y, m, 0);
              setDataInicio(ini.toISOString().split("T")[0]);
              setDataFim(fim.toISOString().split("T")[0]);
            }},
            { label: "Este ano", fn: () => { setDataInicio(`${new Date().getFullYear()}-01-01`); setDataFim(hoje()); } },
          ].map(({ label, fn }) => (
            <button key={label} onClick={fn}
              className="px-3 py-2 text-xs border border-[#EDD5F5] rounded-xl text-[#9B7BB8] hover:text-[#6B3FA0] hover:border-[#6B3FA0] transition-colors">
              {label}
            </button>
          ))}
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
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${saldo >= 0 ? "bg-[#EDD5F5]" : "bg-red-50"}`}>
            <DollarSign size={18} className={saldo >= 0 ? "text-[#6B3FA0]" : "text-red-500"} strokeWidth={1.5} />
          </div>
          <p className={`text-xl font-light ${saldo >= 0 ? "text-[#1A0A2E]" : "text-red-500"}`}>
            R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[#9B7BB8] text-xs mt-0.5">Saldo</p>
        </div>
      </div>

      {/* Tabela */}
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
                  <th className="text-left text-[#9B7BB8] text-[10px] tracking-widests uppercase px-3 py-3">Descrição</th>
                  <th className="text-left text-[#9B7BB8] text-[10px] tracking-widests uppercase px-3 py-3 hidden sm:table-cell">Categoria</th>
                  <th className="text-right text-[#9B7BB8] text-[10px] tracking-widests uppercase px-5 py-3">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0FB]">
                {lancamentos.map(l => (
                  <tr key={l.id} className="hover:bg-[#FAF4FF] transition-colors">
                    <td className="px-5 py-3.5 text-[#9B7BB8] text-xs whitespace-nowrap">
                      {new Date(l.data).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-3 py-3.5 text-[#1A0A2E] text-sm">
                      {getDescricaoDisplay(l)}
                    </td>
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                        l.tipo === "entrada"
                          ? "bg-[#EDD5F5] text-[#6B3FA0]"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {getCategoriaDisplay(l)}
                      </span>
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
