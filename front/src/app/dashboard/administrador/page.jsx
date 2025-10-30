import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { redirect } from "next/navigation";
import { AdminStatsCards } from "@/components/dashboard/AdminStatsCards";
import { UserPreviewTable } from "@/components/dashboard/UserPreviewTable";

async function getUserData() {
  try {
    const response = await fetch('http://localhost:3001/user/get', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Falha ao buscar dados dos usuários');
    }
    const users = await response.json();
    return users;
  } catch (error) {
    console.error("Erro ao buscar dados do backend:", error.message);
    return [];
  }
}

export default async function Page() {
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

  const allUsers = await getUserData();

  const stats = {
    totalUsers: allUsers.length,
    activeCollectors: allUsers.filter(u => u.cargo === 'coletor' && u.statusConta === 'ativo').length,
    inactiveUsers: allUsers.filter(u => u.statusConta === 'desligado').length,
    roles: 3,
  };

  // =======================================================
  // NOVA LÓGICA PARA SELECIONAR OS USUÁRIOS DA PRÉ-VISUALIZAÇÃO
  // =======================================================
  
  // 1. Ordena todos os usuários por ID decrescente (mais recentes primeiro)
  const sortedUsers = [...allUsers].sort((a, b) => b.id - a.id);

  // 2. Separa os usuários em duas listas: ativos e desligados
  const activeUsers = sortedUsers.filter(u => u.statusConta === 'ativo');
  const inactiveUsers = sortedUsers.filter(u => u.statusConta === 'desligado');

  // 3. Pega os 5 primeiros usuários ativos
  let previewUsers = activeUsers.slice(0, 5);

  // 4. Se a lista não tiver 5 usuários, completa com os desligados mais recentes
  if (previewUsers.length < 5) {
    const needed = 5 - previewUsers.length;
    previewUsers = previewUsers.concat(inactiveUsers.slice(0, needed));
  }
  // =======================================================

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}
    >
      <AppSidebar variant="inset" usuario={user} />
      <SidebarInset usuario={user}>
        <SiteHeader usuario={user} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Painel do Administrador</h1>
          </div>
          
          <AdminStatsCards stats={stats} />
          {/* Agora passamos a nova lista 'previewUsers' para a tabela */}
          <UserPreviewTable users={previewUsers} />

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}