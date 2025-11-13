import { AppSidebar } from "@/components/dashboard/Sidebar/AdministradorSidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ComunicadosComponenteAdministrador } from "@/components/dashboard/ComunicadosComponenteAdministrador";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import Layout from "@/components/dashboard/layout/Layout";

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
    <Layout>

        <main className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex items-center mb-4">
            <h1 className="font-semibold text-lg md:text-2xl">Mural de Comunicados</h1>
          </div>
          {/* O componente principal dos comunicados será renderizado aqui */}
          <ComunicadosComponenteAdministrador user={user} />
        </main>
    </Layout>
  );
}