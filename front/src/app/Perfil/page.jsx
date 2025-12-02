// =================================================================================
// Arquivo: src/app/Perfil/page.jsx
// =================================================================================

import Perfil from "@/components/Perfil/perfil";
import Layout from "@/components/dashboard/layout/Layout";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

// Esta página agora é um Server Component que busca os dados
export default async function PagePerfil() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');

  let user = null;
  if (tokenCookie && tokenCookie.value) {
    try {
      // Decodificamos o token aqui, no servidor
      user = jwt.decode(tokenCookie.value);
    } catch (error) {
      console.error("Erro ao decodificar o token na página de perfil:", error);
    }
  }

  return (
    <Layout>
      {/* 'bg-background' garante o fundo correto na página toda */}
      <main className="min-h-screen bg-background">
        {/* Passamos o objeto 'user' como propriedade para o componente cliente */}
        <Perfil initialUser={user} />
      </main>
    </Layout>
  );
}