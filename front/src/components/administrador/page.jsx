// =================================================================================
// Arquivo: src/components/administrador/page.jsx (ou o caminho correto do seu PageAdmin)
// =================================================================================

import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { AdminStatsCards } from "@/components/dashboard/AdminStatsCards";
import { UserPreviewTable } from "@/components/dashboard/UserPreviewTable";
import Layout from "../dashboard/layout/Layout";

// 1. A função agora aceita o 'token' como argumento
async function getUserData(token) {
  // Se não tiver token, nem tenta buscar
  if (!token) {
    console.log("Token não encontrado no Server Component.");
    return [];
  }

  try {
    // 2. Adicionamos o Header de Autorização
    const response = await fetch('http://localhost:3001/user/get', { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // <--- O PULO DO GATO
      }
    });

    if (!response.ok) {
      // Se o token for inválido ou expirado (401/403), o backend vai rejeitar
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
  // 3. Pegamos o cookie do token aqui
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');
  const token = tokenCookie?.value; // Extrai a string do token

  let user = null;
  if (token) {
    try {
      // Apenas decodifica para saber quem é o admin logado (para UI)
      user = jwt.decode(token);
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  }

  // 4. Passamos o token extraído para a função de busca
  const allUsers = await getUserData(token);

  const stats = {
    totalUsers: allUsers.length,
    activeCollectors: allUsers.filter(u => u.cargo === 'coletor' && u.statusConta === 'ativo').length,
    inactiveUsers: allUsers.filter(u => u.statusConta === 'desligado').length,
    roles: 3,
  };

  // =======================================================
  // LÓGICA DE PRÉ-VISUALIZAÇÃO (Mantida)
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
    <Layout>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Painel do Administrador</h1>
          </div>
          
          <AdminStatsCards stats={stats} />
          {/* Agora passamos a nova lista 'previewUsers' para a tabela */}
          <UserPreviewTable users={previewUsers} />

        </main>
    </Layout>
  );
}