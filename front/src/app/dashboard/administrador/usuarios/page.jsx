import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserManagementTable } from "@/components/dashboard/UserManagementTable";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

export default async function UsuariosPage() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');

  let user = null;
  if (tokenCookie && tokenCookie.value) {
    try {
      const decodedToken = jwt.decode(tokenCookie.value);
      user = decodedToken;
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}
    >
      {/* Passamos o 'user' para a sidebar, como de costume */}
      <AppSidebar usuario={user} />
      
      <SidebarInset usuario={user}>
        <SiteHeader usuario={user} />
        <main className="flex flex-1 flex-col gap-4 p-4 md-p-6">
          {/* 
            A tabela de gerenciamento agora é chamada sem props.
            Ela mesma fará a busca de dados no backend.
          */}
          <UserManagementTable />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}