import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import MapboxMap from "@/components/Map/MapboxMap.jsx";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

export default async function MapaPage() {
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
      <AppSidebar usuario={user} />
      <SidebarInset usuario={user}>
        <SiteHeader usuario={user} />
        {/* Usamos 'overflow-hidden' para garantir que o mapa não ultrapasse os limites */}
        <main className="flex flex-1 flex-col p-4 md:p-6 overflow-hidden">
          <div className="flex items-center mb-4">
            <h1 className="font-semibold text-lg md:text-2xl">Mapa de Coleta</h1>
          </div>
          {/* O componente do mapa ocupará todo o espaço restante */}
          <div className="flex-1 rounded-lg border overflow-hidden">
                 <MapboxMap latitude={-23.647222} longitude={-46.557282} zoom={14} height="px" />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}