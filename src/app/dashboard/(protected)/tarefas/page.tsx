"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Plus, CheckSquare, Square, Trash2 } from "lucide-react";

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  responsavel: "admin" | "secretaria" | "ambos";
  status: "pendente" | "concluida";
  created_at: string;
}

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoResponsavel, setNovoResponsavel] = useState<"admin" | "secretaria" | "ambos">("ambos");
  const [adicionando, setAdicionando] = useState(false);
  const [filtro, setFiltro] = useState<"todas" | "pendente" | "concluida">("pendente");

  async function carregar() {
    const supabase = createClient();
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    setTarefas((data || []) as Tarefa[]);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function adicionar() {
    if (!novoTitulo.trim()) return;
    setAdicionando(true);
    const supabase = createClient();
    await supabase.from("tasks").insert({
      titulo: novoTitulo.trim(),
      descricao: novaDescricao.trim() || null,
      responsavel: novoResponsavel,
      status: "pendente",
    });
    setNovoTitulo("");
    setNovaDescricao("");
    setNovoResponsavel("ambos");
    setAdicionando(false);
    carregar();
  }

  async function alternarStatus(id: string, statusAtual: string) {
    const novoStatus = statusAtual === "pendente" ? "concluida" : "pendente";
    const supabase = createClient();
    await supabase.from("tasks").update({ status: novoStatus }).eq("id", id);
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, status: novoStatus as "pendente" | "concluida" } : t));
  }

  async function excluir(id: string) {
    const supabase = createClient();
    await supabase.from("tasks").delete().eq("id", id);
    setTarefas(prev => prev.filter(t => t.id !== id));
  }

  const filtradas = tarefas.filter(t => filtro === "todas" || t.status === filtro);
  const pendentes = tarefas.filter(t => t.status === "pendente").length;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-[#1A0A2E] text-2xl font-semibold">Tarefas</h1>
        <p className="text-[#9B7BB8] text-sm mt-0.5">
          {pendentes > 0 ? `${pendentes} pendente${pendentes > 1 ? "s" : ""}` : "Tudo em dia ✓"}
        </p>
      </div>

      {/* Adicionar */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)] space-y-3">
        <p className="text-[#9B7BB8] text-[10px] tracking-widests uppercase">Nova tarefa</p>
        <input
          type="text"
          value={novoTitulo}
          onChange={e => setNovoTitulo(e.target.value)}
          onKeyDown={e => e.key === "Enter" && adicionar()}
          placeholder="Título da tarefa..."
          className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
        />
        <input
          type="text"
          value={novaDescricao}
          onChange={e => setNovaDescricao(e.target.value)}
          placeholder="Descrição (opcional)..."
          className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] placeholder:text-[#9B7BB8]/60 focus:outline-none focus:border-[#6B3FA0] transition-colors"
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <select
              value={novoResponsavel}
              onChange={e => setNovoResponsavel(e.target.value as "admin" | "secretaria" | "ambos")}
              className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] bg-white focus:outline-none focus:border-[#6B3FA0]"
            >
              <option value="ambos">Ambos</option>
              <option value="admin">Apenas admin</option>
              <option value="secretaria">Apenas secretária</option>
            </select>
          </div>
          <button
            onClick={adicionar}
            disabled={!novoTitulo.trim() || adicionando}
            className="flex items-center gap-2 bg-[#6B3FA0] hover:bg-[#7D50B5] text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
          >
            <Plus size={15} />
            Adicionar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex rounded-xl border border-[#EDD5F5] overflow-hidden bg-white">
        {([["todas", "Todas"], ["pendente", "Pendentes"], ["concluida", "Concluídas"]] as const).map(([v, l]) => (
          <button key={v} onClick={() => setFiltro(v)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              filtro === v ? "bg-[#6B3FA0] text-white" : "text-[#9B7BB8] hover:text-[#1A0A2E]"
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {carregando ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-[#6B3FA0] border-t-transparent animate-spin" />
          </div>
        ) : filtradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-[0_2px_16px_rgba(26,10,46,0.06)]">
            <CheckSquare size={28} className="mx-auto text-[#EDD5F5] mb-3" />
            <p className="text-[#9B7BB8] text-sm">Nenhuma tarefa aqui.</p>
          </div>
        ) : filtradas.map(t => (
          <div
            key={t.id}
            className={`bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,10,46,0.06)] flex items-start gap-3 ${
              t.status === "concluida" ? "opacity-60" : ""
            }`}
          >
            <button onClick={() => alternarStatus(t.id, t.status)} className="mt-0.5 flex-shrink-0 text-[#6B3FA0]">
              {t.status === "concluida"
                ? <CheckSquare size={18} strokeWidth={1.5} />
                : <Square size={18} strokeWidth={1.5} />
              }
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${t.status === "concluida" ? "line-through text-[#9B7BB8]" : "text-[#1A0A2E]"}`}>
                {t.titulo}
              </p>
              {t.descricao && <p className="text-[#9B7BB8] text-xs mt-0.5">{t.descricao}</p>}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md mt-1.5 inline-block ${
                t.responsavel === "admin"
                  ? "bg-[#EDD5F5] text-[#6B3FA0]"
                  : t.responsavel === "secretaria"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {t.responsavel === "admin" ? "Admin" : t.responsavel === "secretaria" ? "Secretária" : "Todos"}
              </span>
            </div>
            <button onClick={() => excluir(t.id)} className="text-[#9B7BB8] hover:text-red-400 p-1 flex-shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
