"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { X, Trash2, Link2, Package, History } from "lucide-react";
import type { Paciente } from "@/app/dashboard/pacientes/page";

interface Props {
  paciente: Paciente | null;
  todosPacientes: Paciente[];
  onClose: () => void;
  onSalvo: () => void;
}

type Aba = "dados" | "pacotes" | "historico" | "anotacoes";

interface Pacote {
  id: string;
  tipo: string;
  sessoes_total: number;
  sessoes_usadas: number;
  sessoes_restantes: number;
  valor_pago: number | null;
  data_compra: string;
}

interface Sessao {
  id: string;
  data_hora: string;
  presente: boolean | null;
  tipo: string;
  anotacoes: string | null;
}

export default function PacienteModal({ paciente, todosPacientes, onClose, onSalvo }: Props) {
  const isNovo = !paciente;
  const [aba, setAba] = useState<Aba>("dados");
  const [salvando, setSalvando] = useState(false);
  const [role, setRole] = useState<string>("admin");

  // Campos
  const [nome, setNome] = useState(paciente?.nome ?? "");
  const [whatsapp, setWhatsapp] = useState(paciente?.whatsapp ?? "");
  const [email, setEmail] = useState(paciente?.email ?? "");
  const [cpf, setCpf] = useState(paciente?.cpf ?? "");
  const [dataNascimento, setDataNascimento] = useState(paciente?.data_nascimento ?? "");
  const [status, setStatus] = useState<"ativo" | "inativo">(paciente?.status ?? "ativo");
  const [parceiroId, setParceiroId] = useState(paciente?.parceiro_id ?? "");
  const [notasAdmin, setNotasAdmin] = useState(paciente?.notas_admin ?? "");

  // Dados relacionados
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);

  // Novo pacote
  const [novoPacoteTipo, setNovoPacoteTipo] = useState("avulsa");
  const [novoPacoteQtd, setNovoPacoteQtd] = useState(1);
  const [novoPacoteValor, setNovoPacoteValor] = useState("");
  const [adicionandoPacote, setAdicionandoPacote] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (p) setRole(p.role);
      }
      if (paciente) {
        const [{ data: pkgs }, { data: sess }] = await Promise.all([
          supabase.from("session_packages").select("*").eq("patient_id", paciente.id).order("data_compra", { ascending: false }),
          supabase.from("clinical_sessions").select("id, data_hora, presente, tipo, anotacoes").eq("patient_id", paciente.id).order("data_hora", { ascending: false }).limit(30),
        ]);
        setPacotes((pkgs || []) as Pacote[]);
        setSessoes((sess || []) as Sessao[]);
      }
    }
    init();
  }, [paciente]);

  async function salvar() {
    if (!nome.trim()) return;
    setSalvando(true);
    const supabase = createClient();
    const payload = {
      nome: nome.trim(),
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
      cpf: cpf.trim() || null,
      data_nascimento: dataNascimento || null,
      status,
      parceiro_id: parceiroId || null,
      notas_admin: role === "admin" ? notasAdmin : undefined,
    };
    if (isNovo) {
      await supabase.from("patients").insert(payload);
    } else {
      await supabase.from("patients").update(payload).eq("id", paciente!.id);
    }
    setSalvando(false);
    onSalvo();
  }

  async function excluir() {
    if (!paciente || !confirm(`Excluir ${paciente.nome}? Esta ação não pode ser desfeita.`)) return;
    const supabase = createClient();
    await supabase.from("patients").delete().eq("id", paciente.id);
    onSalvo();
  }

  async function adicionarPacote() {
    if (!paciente) return;
    setAdicionandoPacote(true);
    const supabase = createClient();
    await supabase.from("session_packages").insert({
      patient_id: paciente.id,
      tipo: novoPacoteTipo,
      sessoes_total: novoPacoteQtd,
      sessoes_usadas: 0,
      valor_pago: novoPacoteValor ? Number(novoPacoteValor) : null,
    });
    const { data } = await supabase.from("session_packages").select("*").eq("patient_id", paciente.id).order("data_compra", { ascending: false });
    setPacotes((data || []) as Pacote[]);
    setNovoPacoteTipo("avulsa");
    setNovoPacoteQtd(1);
    setNovoPacoteValor("");
    setAdicionandoPacote(false);
  }

  async function marcarPresenca(sessaoId: string, presente: boolean) {
    const supabase = createClient();
    await supabase.from("clinical_sessions").update({ presente }).eq("id", sessaoId);
    setSessoes(prev => prev.map(s => s.id === sessaoId ? { ...s, presente } : s));
  }

  const outrosPacientes = todosPacientes.filter(p => p.id !== paciente?.id);

  const abas: { id: Aba; label: string }[] = [
    { id: "dados", label: "Dados" },
    { id: "pacotes", label: "Pacotes" },
    { id: "historico", label: "Histórico" },
    ...(role === "admin" ? [{ id: "anotacoes" as Aba, label: "Anotações" }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E2FB]">
          <h2 className="text-[#1A0A2E] font-semibold text-base">
            {isNovo ? "Novo paciente" : paciente.nome}
          </h2>
          <div className="flex items-center gap-2">
            {!isNovo && role === "admin" && (
              <button onClick={excluir} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={15} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-[#9B7BB8] hover:bg-[#FAF4FF] rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Abas (só no modo edição) */}
        {!isNovo && (
          <div className="flex border-b border-[#F0E2FB] px-5 gap-1">
            {abas.map(a => (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
                  aba === a.id
                    ? "border-[#6B3FA0] text-[#6B3FA0]"
                    : "border-transparent text-[#9B7BB8] hover:text-[#1A0A2E]"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ABA DADOS */}
          {(isNovo || aba === "dados") && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">Nome completo *</label>
                  <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                    className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors"
                    placeholder="Nome do paciente" />
                </div>
                <div>
                  <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">WhatsApp</label>
                  <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                    className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors"
                    placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors"
                    placeholder="paciente@email.com" />
                </div>
                <div>
                  <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">CPF</label>
                  <input type="text" value={cpf} onChange={e => setCpf(e.target.value)}
                    className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors"
                    placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">Data de nascimento</label>
                  <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)}
                    className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors" />
                </div>
                <div>
                  <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as "ativo" | "inativo")}
                    className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors bg-white">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-1.5">
                    <span className="flex items-center gap-1"><Link2 size={10} /> Parceiro (terapia de casal)</span>
                  </label>
                  <select value={parceiroId} onChange={e => setParceiroId(e.target.value)}
                    className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors bg-white">
                    <option value="">Nenhum</option>
                    {outrosPacientes.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ABA PACOTES */}
          {!isNovo && aba === "pacotes" && (
            <div className="space-y-4">
              {/* Adicionar pacote */}
              <div className="bg-[#FAF4FF] rounded-xl p-4 space-y-3">
                <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase flex items-center gap-1.5">
                  <Package size={11} /> Adicionar pacote
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#9B7BB8] text-[10px] mb-1">Tipo</label>
                    <select value={novoPacoteTipo} onChange={e => setNovoPacoteTipo(e.target.value)}
                      className="w-full border border-[#EDD5F5] rounded-lg px-2 py-2 text-xs text-[#1A0A2E] bg-white focus:outline-none focus:border-[#6B3FA0]">
                      <option value="avulsa">Avulsa</option>
                      <option value="pacote_4">Pacote 4</option>
                      <option value="pacote_8">Pacote 8</option>
                      <option value="pacote_12">Pacote 12</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#9B7BB8] text-[10px] mb-1">Sessões</label>
                    <input type="number" min={1} value={novoPacoteQtd} onChange={e => setNovoPacoteQtd(Number(e.target.value))}
                      className="w-full border border-[#EDD5F5] rounded-lg px-2 py-2 text-xs text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0]" />
                  </div>
                  <div>
                    <label className="block text-[#9B7BB8] text-[10px] mb-1">Valor (R$)</label>
                    <input type="number" value={novoPacoteValor} onChange={e => setNovoPacoteValor(e.target.value)}
                      placeholder="250"
                      className="w-full border border-[#EDD5F5] rounded-lg px-2 py-2 text-xs text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0]" />
                  </div>
                </div>
                <button onClick={adicionarPacote} disabled={adicionandoPacote}
                  className="w-full bg-[#6B3FA0] text-white py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors">
                  {adicionandoPacote ? "Salvando..." : "Adicionar pacote"}
                </button>
              </div>

              {/* Lista de pacotes */}
              <div className="space-y-2">
                {pacotes.length === 0 ? (
                  <p className="text-[#9B7BB8] text-sm text-center py-6">Nenhum pacote cadastrado.</p>
                ) : pacotes.map(pkg => (
                  <div key={pkg.id} className="bg-white border border-[#EDD5F5] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[#1A0A2E] text-sm font-medium capitalize">{pkg.tipo.replace("_", " ")}</p>
                      <p className="text-[#9B7BB8] text-xs mt-0.5">
                        {new Date(pkg.data_compra).toLocaleDateString("pt-BR")}
                        {pkg.valor_pago ? ` · R$ ${pkg.valor_pago.toLocaleString("pt-BR")}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#6B3FA0] text-xl font-light">{pkg.sessoes_restantes}</p>
                      <p className="text-[#9B7BB8] text-[10px]">de {pkg.sessoes_total} restantes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA HISTÓRICO */}
          {!isNovo && aba === "historico" && (
            <div className="space-y-2">
              {sessoes.length === 0 ? (
                <div className="py-12 text-center">
                  <History size={28} className="mx-auto text-[#EDD5F5] mb-3" />
                  <p className="text-[#9B7BB8] text-sm">Nenhuma sessão registrada.</p>
                </div>
              ) : sessoes.map(s => (
                <div key={s.id} className="bg-white border border-[#EDD5F5] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[#1A0A2E] text-sm font-medium">
                      {new Date(s.data_hora).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                      {" · "}
                      {new Date(s.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      s.presente === true ? "bg-green-100 text-green-700" :
                      s.presente === false ? "bg-red-100 text-red-500" :
                      "bg-[#EDD5F5] text-[#6B3FA0]"
                    }`}>
                      {s.presente === true ? "Presente" : s.presente === false ? "Faltou" : "—"}
                    </span>
                  </div>
                  <p className="text-[#9B7BB8] text-xs capitalize">{s.tipo}</p>
                  {s.presente === null && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => marcarPresenca(s.id, true)}
                        className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-lg transition-colors hover:bg-green-100">
                        ✓ Presente
                      </button>
                      <button onClick={() => marcarPresenca(s.id, false)}
                        className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-lg transition-colors hover:bg-red-100">
                        ✗ Faltou
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ABA ANOTAÇÕES (admin only) */}
          {!isNovo && aba === "anotacoes" && role === "admin" && (
            <div>
              <p className="text-[#9B7BB8] text-[10px] tracking-widest uppercase mb-3">
                Anotações clínicas · Visível apenas para você
              </p>
              <textarea
                value={notasAdmin}
                onChange={e => setNotasAdmin(e.target.value)}
                rows={12}
                placeholder="Anotações de sessão, observações clínicas, evolução do paciente..."
                className="w-full border border-[#EDD5F5] rounded-xl px-3 py-3 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/50 focus:outline-none focus:border-[#6B3FA0] resize-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {(isNovo || aba === "dados" || aba === "anotacoes") && (
          <div className="px-5 py-4 border-t border-[#F0E2FB] flex gap-3">
            <button onClick={onClose}
              className="flex-1 border border-[#EDD5F5] text-[#9B7BB8] py-2.5 rounded-xl text-sm hover:bg-[#FAF4FF] transition-colors">
              Cancelar
            </button>
            <button onClick={salvar} disabled={salvando || !nome.trim()}
              className="flex-1 bg-[#6B3FA0] text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-[#7D50B5] transition-colors">
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
