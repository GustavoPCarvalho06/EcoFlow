import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { AdminStatsCards } from "@/components/dashboard/AdminStatsCards";
import { UserPreviewTable } from "@/components/dashboard/UserPreviewTable";
import Layout from "../dashboard/layout/Layout";


async function getUserData(token) {

  if (!token) {
    console.log("Token não encontrado no Server Component.");
    return [];
  }

  try {
 
    const response = await fetch('http://localhost:3001/user/get', { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });

    if (!response.ok) {
  
      throw new Error(`Falha ao buscar dados (Status: ${response.status})`);
    }

    const users = await response.json();
    return users;
  } catch (error) {
    console.error("Erro ao buscar dados do backend:", error.message);
    return [];
  }
}

export default async function PageAdmin() {

  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');
  const token = tokenCookie?.value;

  let user = null;
  if (token) {
    try {

      user = jwt.decode(token);
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  }


  const allUsers = await getUserData(token);

  const stats = {
    totalUsers: allUsers.length,
    activeCollectors: allUsers.filter(u => u.cargo === 'coletor' && u.statusConta === 'ativo').length,
    inactiveUsers: allUsers.filter(u => u.statusConta === 'desligado').length,
    roles: 3,
  };

  const sortedUsers = [...allUsers].sort((a, b) => b.id - a.id);

  const activeUsers = sortedUsers.filter(u => u.statusConta === 'ativo');
  const inactiveUsers = sortedUsers.filter(u => u.statusConta === 'desligado');


  let previewUsers = activeUsers.slice(0, 5);


  if (previewUsers.length < 5) {
    const needed = 5 - previewUsers.length;
    previewUsers = previewUsers.concat(inactiveUsers.slice(0, needed));
  }

  return (
    <Layout>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Painel do Administrador</h1>
          </div>
          
          <AdminStatsCards stats={stats} />
          <UserPreviewTable users={previewUsers} cookies={cookieStore} />

        </main>
    </Layout>
  );
}