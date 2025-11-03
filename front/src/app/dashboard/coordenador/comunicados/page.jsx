import { AppSidebarCoordenador } from "@/components/dashboard/app-sidebar-coordenador";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ComunicadosComponenteCoordenador } from "@/components/dashboard/ComunicadosComponenteCoordenador";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

export default async function ComunicadosPage() {
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
      <AppSidebarCoordenador usuario={user} />
      <SidebarInset usuario={user}>
        <SiteHeader usuario={user} />
        <main className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex items-center mb-4">
            <h1 className="font-semibold text-lg md:text-2xl">Mural de Comunicados</h1>
          </div>
          {/* O componente principal dos comunicados será renderizado aqui */}
          <ComunicadosComponenteCoordenador user={user} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}