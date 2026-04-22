"use client";

import { useEffect } from "react";
import Sidebar from "./Sidebar";

interface Props {
  role: "admin" | "secretaria";
  nome: string;
  children: React.ReactNode;
}

export default function DashboardShell({ role, nome, children }: Props) {
  useEffect(() => {
    const shell = document.getElementById("app-shell");
    if (!shell) return;
    shell.style.maxWidth = "100%";
    shell.style.boxShadow = "none";
    return () => {
      shell.style.maxWidth = "";
      shell.style.boxShadow = "";
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F5F0FB]">
      <Sidebar role={role} nome={nome} />
      <main className="flex-1 min-w-0 lg:h-screen lg:overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
