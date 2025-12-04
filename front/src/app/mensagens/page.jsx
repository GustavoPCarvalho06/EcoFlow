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
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  }

  return (
    <Layout>
       
        <main className="flex flex-1 flex-col p-4 md:p-6 bg-background h-full">
          <div className="flex items-center mb-4">
            <h1 className="font-semibold text-lg md:text-xl text-foreground">Mensagens</h1>
          </div>
          
          <ChatComponent user={user} token={tokenCookie?.value} />
        </main>
    </Layout>
  );
}