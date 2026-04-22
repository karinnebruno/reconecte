"use client";

import Sidebar from "./Sidebar";

interface Props {
  role: "admin" | "secretaria";
  nome: string;
  children: React.ReactNode;
}

export default function DashboardShell({ role, nome, children }: Props) {
  return (
    <div className="flex min-h-screen bg-[#F5F0FB]">
      <Sidebar role={role} nome={nome} />
      <main className="flex-1 min-w-0 lg:h-screen lg:overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
