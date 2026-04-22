"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { X } from "lucide-react";

interface Props {
  dataSugerida: Date;
  onClose: () => void;
  onSalvo: () => void;
}

export default function SessaoModal({ dataSugerida, onClose, onSalvo }: Props) {
  const [pacienteId, setPacienteId] = useState("");
  const [pacotes, setPacotes] = useState<{ id: string; tipo: string; sessoes_restantes: number }[]>([]);
  const [pacoteId, setPacoteId] = useState("");
  const [data, setData] = useState(dataSugerida.toISOString().split("T")[0]);
  const [hora, setHora] = useState("09:00");
  const [tipo, setTipo] = useState<"individual" | "casal">("individual");
  const [anotacoes, setAnotacoes] = useState("");
  const [pacientes, setPacientes] = useState<{ id: string; nome: string }[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [role, setRole] = useState("admin");

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (p) setRole(p.role);
      }
      const { data: pacs } = await supabase.from("patients").select("id, nome").eq("status", "ativo").order("nome");
      setPacientes(pacs || []);
    }
    init();
  }, []);

  useEffect(() => {
    if (!pacienteId) { setPacotes([]); setPacoteId(""); return; }
    async function buscarPacotes() {
      const supabase = createClient();
      const { data } = await supabase
        .from("session_packages")
        .select("id, tipo, sessoes_restantes")
        .eq("patient_id", pacienteId)
        .gt("sessoes_restantes", 0);
      setPacotes(data || []);
    }
    buscarPacotes();
  }, [pacienteId]);

  async function salvar() {
    if (!pacienteId) return;
    setSalvando(true);
    const supabase = createClient();
    const dataHora = new Date(`${data}T${hora}:00`).toISOString();

    await supabase.from("clinical_sessions").insert({
      patient_id: pacienteId,
      package_id: pacoteId || null,
      data_hora: dataHora,
      tipo,
      anotacoes: anotacoes.trim() || null,
    });

    // Descontar do pacote se selecionado
    if (pacoteId) {
      const pkg = pacotes.find(p => p.id === pacoteId);
      if (pkg) {
        await supabase.from("session_packages")
          .update({ sessoes_usadas: pkg.sessoes_restantes <= pkg.sessoes_restantes
            ? undefined  // será calculado pelo campo gerado
            : undefined
          })
          .eq("id", pacoteId);
        // Incrementar sessoes_usadas
        await supabase.rpc("incrementar_sessoes_usadas", { package_id: pacoteId });
      }
    }

    setSalvando(false);
    onSalvo();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E2FB]">
          <h2 className="text-[#1A0A2E] font-semibold text-base">Nova sessão</h2>
          <button onClick={onClose} className="p-2 text-[#9B7BB8] hover:bg-[#FAF4FF] rounded-lg">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Paciente *</label>
            <select value={pacienteId} onChange={e => setPacienteId(e.target.value)}
              className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] bg-white focus:outline-none focus:border-[#6B3FA0]">
              <option value="">Selecione...</option>
              {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          {pacotes.length > 0 && (
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">
                Descontar do pacote
              </label>
              <select value={pacoteId} onChange={e => setPacoteId(e.target.value)}
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] bg-white focus:outline-none focus:border-[#6B3FA0]">
                <option value="">Não descontar</option>
                {pacotes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.tipo.replace("_", " ")} — {p.sessoes_restantes} restante(s)
                  </option>
                ))}
              </select>
            </div>
          )}

          {pacienteId && pacotes.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-yellow-700 text-xs">Este paciente não tem saldo de sessões. Adicione um pacote antes.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Data *</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)}
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0]" />
            </div>
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Hora *</label>
              <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0]" />
            </div>
          </div>

          <div>
            <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Tipo</label>
            <div className="flex rounded-xl border border-[#EDD5F5] overflow-hidden">
              {(["individual", "casal"] as const).map(t => (
                <button key={t} onClick={() => setTipo(t)}
                  className={`flex-1 py-2 text-sm transition-colors capitalize ${
                    tipo === t ? "bg-[#6B3FA0] text-white" : "text-[#9B7BB8] hover:bg-[#FAF4FF]"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {role === "admin" && (
            <div>
              <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Anotações</label>
              <textarea value={anotacoes} onChange={e => setAnotacoes(e.target.value)}
                rows={3} placeholder="Notas clínicas..."
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/50 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors" />
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[#F0E2FB] flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-[#EDD5F5] text-[#9B7BB8] py-2.5 rounded-xl text-sm hover:bg-[#FAF4FF] transition-colors">
            Cancelar
          </button>
          <button onClick={salvar} disabled={salvando || !pacienteId}
            className="flex-1 bg-[#6B3FA0] text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-[#7D50B5] transition-colors">
            {salvando ? "Salvando..." : "Criar sessão"}
          </button>
        </div>
      </div>
    </div>
  );
}
