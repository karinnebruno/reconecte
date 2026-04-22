import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component layouts não podem setar cookies — ignorar
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nome, email")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "secretaria"].includes(profile.role ?? "")) {
    redirect("/dashboard/login");
  }

  return (
    <DashboardShell
      role={profile!.role as "admin" | "secretaria"}
      nome={profile!.nome || profile!.email || user.email || "Usuário"}
    >
      {children}
    </DashboardShell>
  );
}
