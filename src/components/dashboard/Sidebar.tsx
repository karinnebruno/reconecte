"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  DollarSign,
  CheckSquare,
  Settings,
  LogOut,
  Menu,
  X,
  CalendarCheck,
  Clock,
  Zap,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

interface SidebarProps {
  role: "admin" | "secretaria";
  nome: string;
}

const navAdmin = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/dashboard/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/dashboard/agendamentos", label: "Agendamentos", icon: CalendarCheck },
  { href: "/dashboard/disponibilidade", label: "Disponibilidade", icon: Clock },
  { href: "/dashboard/desafios", label: "Desafios diários", icon: Zap },
  { href: "/dashboard/trilhas", label: "Trilhas", icon: BookOpen },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

const navSecretaria = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/dashboard/tarefas", label: "Tarefas", icon: CheckSquare },
];

export default function Sidebar({ role, nome }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const nav = role === "admin" ? navAdmin : navSecretaria;

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/dashboard/login");
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#2D1155]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#6B3FA0] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">✦</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">Reconecte</p>
            <p className="text-[#9B7BB8] text-[10px]">Gestão clínica</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setAberto(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              isActive(href)
                ? "bg-[#6B3FA0] text-white"
                : "text-[#9B7BB8] hover:bg-[#2D1155] hover:text-white"
            }`}
          >
            <Icon size={16} strokeWidth={isActive(href) ? 2 : 1.5} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[#2D1155] space-y-0.5">
        <div className="px-3 py-2">
          <p className="text-white text-xs font-medium truncate">{nome}</p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md mt-0.5 inline-block ${
            role === "admin"
              ? "bg-[#6B3FA0]/30 text-[#C49FE8]"
              : "bg-[#2D1155] text-[#9B7BB8]"
          }`}>
            {role === "admin" ? "Admin" : "Secretária"}
          </span>
        </div>
        <button
          onClick={sair}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#9B7BB8] hover:bg-[#2D1155] hover:text-white transition-all w-full"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 bg-[#1A0A2E] border-r border-[#2D1155] h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile: top bar + drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1A0A2E] border-b border-[#2D1155] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6B3FA0] flex items-center justify-center">
            <span className="text-white text-xs">✦</span>
          </div>
          <p className="text-white text-sm font-medium">Reconecte</p>
        </div>
        <button onClick={() => setAberto(true)} className="text-[#9B7BB8] p-1">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {aberto && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setAberto(false)} />
          <aside className="relative w-60 bg-[#1A0A2E] h-full flex flex-col border-r border-[#2D1155]">
            <button
              onClick={() => setAberto(false)}
              className="absolute top-4 right-4 text-[#9B7BB8]"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
