import Perfil from "@/components/Perfil/perfil";
import Layout from "@/components/dashboard/layout/Layout";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

export default async function PagePerfil() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');

  let user = null;
  if (tokenCookie && tokenCookie.value) {
    try {
      
      user = jwt.decode(tokenCookie.value);
    } catch (error) {
      console.error("Erro ao decodificar o token na página de perfil:", error);
    }
  }

  return (
    <Layout>
   
      <main className="min-h-screen bg-background">
       
        <Perfil initialUser={user} />
      </main>
    </Layout>
  );
}