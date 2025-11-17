// Local do arquivo: front\src\app\Perfil\page.jsx

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
      {/* Passamos o objeto 'user' como propriedade para o componente cliente */}
      <Perfil initialUser={user} />
    </Layout>
  );
}