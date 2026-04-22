"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onSalvo: () => void;
}

const CATEGORIAS_ENTRADA = ["Sessão avulsa", "Pacote de sessões", "Protocolo", "Outro"];
const CATEGORIAS_SAIDA = ["Meta Ads", "Contabilidade", "Impostos", "Plataformas", "Material", "Outro"];

export default function LancamentoModal({ onClose, onSalvo }: Props) {
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [pacienteId, setPacienteId] = useState("");
  const [pacientes, setPacientes] = useState<{ id: string; nome: string }[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function buscarPacientes() {
      const supabase = createClient();
      const { data } = await supabase.from("patients").select("id, nome").eq("status", "ativo").order("nome");
      setPacientes(data || []);
    }
    buscarPacientes();
  }, []);

  async function salvar() {
    if (!valor || !categoria) return;
    setSalvando(true);
    const supabase = createClient();
    await supabase.from("financial_entries").insert({
      tipo,
      valor: Number(valor.replace(",", ".")),
      descricao: descricao.trim() || null,
      categoria,
      data: new Date(data + "T12:00:00").toISOString(),
      patient_id: pacienteId || null,
    });
    setSalvando(false);
    onSalvo();
  }

  const categorias = tipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E2FB]">
          <h2 className="text-[#1A0A2E] font-semibold text-base">Novo lançamento</h2>
          <button onClick={onClose} className="p-2 text-[#9B7BB8] hover:bg-[#FAF4FF] rounded-lg">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Tipo */}
          <div className="flex rounded-xl border border-[#EDD5F5] overflow-hidden">
            <button onClick={() => { setTipo("entrada"); setCategoria(""); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tipo === "entrada" ? "bg-green-500 text-white" : "text-[#9B7BB8] hover:bg-[#FAF4FF]"
              }`}>
              + Entrada
            </button>
            <button onClick={() => { setTipo("saida"); setCategoria(""); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tipo === "saida" ? "bg-red-500 text-white" : "text-[#9B7BB8] hover:bg-[#FAF4FF]"
              }`}>
              – Saída
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">Valor (R$) *</label>
              <input type="text" value={valor} onChange={e => setValor(e.target.value)}
                placeholder="250,00"
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors" />
            </div>
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">Data *</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)}
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-[#9B7BB8] text-[10px] tracking-widets uppercase mb-1.5">Categoria *</label>
            <div className="flex flex-wrap gap-2">
              {categorias.map(c => (
                <button key={c} onClick={() => setCategoria(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    categoria === c
                      ? "bg-[#6B3FA0] text-white border-[#6B3FA0]"
                      : "border-[#EDD5F5] text-[#9B7BB8] hover:border-[#6B3FA0] hover:text-[#6B3FA0]"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Descrição</label>
            <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)}
              placeholder="Detalhe opcional..."
              className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors" />
          </div>

          {tipo === "entrada" && (
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Vincular paciente</label>
              <select value={pacienteId} onChange={e => setPacienteId(e.target.value)}
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors bg-white">
                <option value="">Sem vínculo</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[#F0E2FB] flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-[#EDD5F5] text-[#9B7BB8] py-2.5 rounded-xl text-sm hover:bg-[#FAF4FF] transition-colors">
            Cancelar
          </button>
          <button onClick={salvar} disabled={salvando || !valor || !categoria}
            className="flex-1 bg-[#6B3FA0] text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-[#7D50B5] transition-colors">
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
