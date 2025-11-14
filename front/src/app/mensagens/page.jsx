import { ChatComponent } from "@/components/dashboard/ChatComponent"; 
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import Layout from "@/components/dashboard/layout/Layout";

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
    <Layout>
        <main className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex items-center mb-4">
            <h1 className="font-semibold text-lg md:text-xl">Mensagens</h1>
          </div>
          {/* 2. CORREÇÃO DO NOME E PASSAGEM DOS DADOS (PROPS) */}
          <ChatComponent user={user} token={tokenCookie?.value} />
        </main>
    </Layout>
  );
}