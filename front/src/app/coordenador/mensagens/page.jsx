// src/app/dashboard/administrador/mensagens/page.jsx (VERSÃO CORRIGIDA)

import { AppSidebarCoordenador, CoordenadorSidebar } from "@/components/dashboard/Sidebar/SidebarCoordenador";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// 1. CORREÇÃO DA IMPORTAÇÃO
import { ChatComponent } from "@/components/dashboard/ChatComponent"; 
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

export default async function MensagensPage() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');

  let user = null;
  if (tokenCookie && tokenCookie.value) {
    try {
      const decodedToken = jwt.decode(tokenCookie.value);
      user = decodedToken;
      console.log("Token Decodificado (page.jsx):", user); 
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  } else {
      // DEBUG: Informe se o token não foi encontrado
      console.log("Cookie de token não encontrado.");
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}
    >
      <CoordenadorSidebar usuario={user} />
      <SidebarInset usuario={user}>
        <SiteHeader usuario={user} />
        <main className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex items-center mb-4">
            <h1 className="font-semibold text-lg md:text-xl">Mensagens</h1>
          </div>

          {/* 2. CORREÇÃO DO NOME E PASSAGEM DOS DADOS (PROPS) */}
          <ChatComponent user={user} token={tokenCookie?.value} />

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}