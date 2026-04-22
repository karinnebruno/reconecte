"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  Plus, Search, ChevronRight, UserCheck, UserX, Phone, Mail, Users,
} from "lucide-react";
import PacienteModal from "@/components/dashboard/PacienteModal";

export interface Paciente {
  id: string;
  nome: string;
  whatsapp: string | null;
  email: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  status: "ativo" | "inativo";
  parceiro_id: string | null;
  parceiro?: { id: string; nome: string } | null;
  notas_admin: string | null;
  sessoes_restantes?: number;
  created_at: string;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "inativo">("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

  async function carregar() {
    const supabase = createClient();
    const { data } = await supabase
      .from("patients")
      .select(`
        id, nome, whatsapp, email, cpf, data_nascimento, status,
        parceiro_id, notas_admin, created_at,
        parceiro:patients!patients_parceiro_id_fkey(id, nome),
        session_packages(sessoes_restantes)
      `)
      .order("nome");

    setPacientes(
      (data || []).map((p: Record<string, unknown>) => ({
        ...p,
        sessoes_restantes: ((p.session_packages as { sessoes_restantes: number }[] | null) || []).reduce(
          (s: number, pkg: { sessoes_restantes: number }) => s + (pkg.sessoes_restantes || 0),
          0
        ),
      })) as Paciente[]
    );
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = pacientes.filter(p => {
    const matchBusca =
      !busca ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.whatsapp?.includes(busca) ||
      p.email?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  function abrirNovo() {
    setPacienteSelecionado(null);
    setModalAberto(true);
  }

  function abrirEdicao(p: Paciente) {
    setPacienteSelecionado(p);
    setModalAberto(true);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1A0A2E] text-2xl font-semibold">Pacientes</h1>
          <p className="text-[#9B7BB8] text-sm mt-0.5">{pacientes.length} cadastrados</p>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 bg-[#6B3FA0] hover:bg-[#7D50B5] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Novo paciente
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B7BB8]" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, WhatsApp ou e-mail..."
            className="w-full pl-9 pr-3 py-2.5 border border-[#EDD5F5] rounded-xl text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/70 focus:outline-none focus:border-[#6B3FA0] transition-colors bg-white"
          />
        </div>
        <div className="flex rounded-xl border border-[#EDD5F5] overflow-hidden bg-white flex-shrink-0">
          {(["todos", "ativo", "inativo"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-4 py-2.5 text-sm transition-colors ${
                filtroStatus === s
                  ? "bg-[#6B3FA0] text-white"
                  : "text-[#9B7BB8] hover:text-[#1A0A2E]"
              }`}
            >
              {s === "todos" ? "Todos" : s === "ativo" ? "Ativos" : "Inativos"}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(26,10,46,0.06)] overflow-hidden">
        {carregando ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="mx-auto text-[#EDD5F5] mb-3" />
            <p className="text-[#1A0A2E] text-sm font-medium">Nenhum paciente encontrado</p>
            <p className="text-[#9B7BB8] text-xs mt-1">
              {busca || filtroStatus !== "todos" ? "Tente ajustar os filtros." : "Cadastre o primeiro paciente."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F0FB]">
            {filtrados.map(p => (
              <button
                key={p.id}
                onClick={() => abrirEdicao(p)}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-[#FAF4FF] transition-colors text-left"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#EDD5F5] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#6B3FA0] text-sm font-medium">
                    {p.nome.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[#1A0A2E] text-sm font-medium truncate">{p.nome}</p>
                    {p.parceiro && (
                      <span className="text-[10px] bg-[#EDD5F5] text-[#6B3FA0] px-1.5 py-0.5 rounded-md flex-shrink-0">
                        Casal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {p.whatsapp && (
                      <span className="flex items-center gap-1 text-[#9B7BB8] text-xs">
                        <Phone size={10} />
                        {p.whatsapp}
                      </span>
                    )}
                    {p.email && (
                      <span className="flex items-center gap-1 text-[#9B7BB8] text-xs truncate">
                        <Mail size={10} />
                        {p.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sessões restantes */}
                {(p.sessoes_restantes ?? 0) > 0 && (
                  <div className="text-center flex-shrink-0 hidden sm:block">
                    <p className="text-[#6B3FA0] text-lg font-light leading-none">{p.sessoes_restantes}</p>
                    <p className="text-[#9B7BB8] text-[10px]">sessões</p>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.status === "ativo" ? (
                    <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      <UserCheck size={10} />
                      Ativo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      <UserX size={10} />
                      Inativo
                    </span>
                  )}
                  <ChevronRight size={14} className="text-[#9B7BB8]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <PacienteModal
          paciente={pacienteSelecionado}
          todosPacientes={pacientes}
          onClose={() => setModalAberto(false)}
          onSalvo={() => { setModalAberto(false); carregar(); }}
        />
      )}
    </div>
  );
}
