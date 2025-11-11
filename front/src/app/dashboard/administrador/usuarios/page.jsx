import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserManagementTable } from "@/components/dashboard/UserManagementTable";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function UsuariosPage() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get("token");

  let user = null;
  if (tokenCookie && tokenCookie.value) {
    try {
      user = jwt.decode(tokenCookie.value);
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar usuario={user} />

      <SidebarInset usuario={user}>
        <SiteHeader usuario={user} />

        <main className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">

          <div className="flex items-center justify-between pb-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Gerenciamento de Usuários
            </h1>
          </div>

          <div className="w-full bg-white rounded-xl shadow-md border p-5">
            <UserManagementTable />
          </div>

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
