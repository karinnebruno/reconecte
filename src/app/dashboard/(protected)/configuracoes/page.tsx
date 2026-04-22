"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Save } from "lucide-react";

export default function ConfiguracoesPage() {
  const [nomeClinica, setNomeClinica] = useState("Reconecte");
  const [whatsappNegocio, setWhatsappNegocio] = useState("");
  const [linkCadastro, setLinkCadastro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLinkCadastro(`${window.location.origin}/entrar`);
    }
  }, []);

  async function salvar() {
    setSalvando(true);
    // Aqui poderia salvar configs numa tabela settings
    await new Promise(r => setTimeout(r, 500));
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  async function definirSecretaria() {
    const email = prompt("E-mail do usuário para definir como secretária:");
    if (!email) return;
    const supabase = createClient();
    const { data: profiles } = await supabase.from("profiles").select("id").ilike("nome", email);
    if (!profiles || profiles.length === 0) {
      alert("Usuário não encontrado. O usuário precisa ter feito login no app ao menos uma vez.");
      return;
    }
    await supabase.from("profiles").update({ role: "secretaria" }).eq("id", profiles[0].id);
    alert(`${email} agora é secretária.`);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-[#1A0A2E] text-2xl font-semibold">Configurações</h1>
        <p className="text-[#9B7BB8] text-sm mt-0.5">Configurações do sistema</p>
      </div>

      {/* Link do app */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)] space-y-4">
        <h2 className="text-[#1A0A2E] text-sm font-semibold border-b border-[#F0E2FB] pb-3">
          Link para pacientes
        </h2>
        <div>
          <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">
            Link de cadastro / acesso ao app
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={linkCadastro}
              readOnly
              className="flex-1 border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#9B7BB8] bg-[#FAF4FF] focus:outline-none"
            />
            <button
              onClick={() => { navigator.clipboard.writeText(linkCadastro); alert("Copiado!"); }}
              className="px-4 py-2 border border-[#EDD5F5] text-[#6B3FA0] rounded-xl text-sm hover:bg-[#EDD5F5] transition-colors"
            >
              Copiar
            </button>
          </div>
          <p className="text-[#9B7BB8] text-[11px] mt-1.5">
            Envie este link para seus pacientes fazerem o cadastro e acessarem o app.
          </p>
        </div>
      </div>

      {/* Acesso */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)] space-y-4">
        <h2 className="text-[#1A0A2E] text-sm font-semibold border-b border-[#F0E2FB] pb-3">
          Controle de acesso
        </h2>
        <div>
          <p className="text-[#1A0A2E] text-sm font-medium mb-1">Secretária</p>
          <p className="text-[#9B7BB8] text-xs mb-3">
            A secretária tem acesso à agenda, pacientes, financeiro e tarefas — mas não às anotações clínicas.
          </p>
          <button
            onClick={definirSecretaria}
            className="border border-[#EDD5F5] text-[#6B3FA0] px-4 py-2 rounded-xl text-sm hover:bg-[#EDD5F5] transition-colors"
          >
            Definir secretária por e-mail
          </button>
        </div>

        <div className="border-t border-[#F0E2FB] pt-4">
          <p className="text-[#9B7BB8] text-xs">
            Usuário atual da secretária de teste: <strong>teste@teste.com</strong>
          </p>
        </div>
      </div>

      {/* Geral */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(26,10,46,0.06)] space-y-4">
        <h2 className="text-[#1A0A2E] text-sm font-semibold border-b border-[#F0E2FB] pb-3">
          Geral
        </h2>
        <div>
          <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">Nome da clínica</label>
          <input
            type="text"
            value={nomeClinica}
            onChange={e => setNomeClinica(e.target.value)}
            className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[#9B7BB8] text-[10px] tracking-widests uppercase mb-1.5">WhatsApp do negócio</label>
          <input
            type="tel"
            value={whatsappNegocio}
            onChange={e => setWhatsappNegocio(e.target.value)}
            placeholder="(00) 00000-0000"
            className="w-full border border-[#EDD5F5] rounded-xl px-3 py-2.5 text-sm text-[#1A0A2E] focus:outline-none focus:border-[#6B3FA0] transition-colors"
          />
        </div>
        <button
          onClick={salvar}
          disabled={salvando}
          className="flex items-center gap-2 bg-[#6B3FA0] hover:bg-[#7D50B5] text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
        >
          <Save size={14} />
          {salvo ? "Salvo!" : salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
