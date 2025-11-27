import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import Layout from "@/components/dashboard/layout/Layout";
import { LogsTable } from "@/components/dashboard/LogsTable"; // Vamos criar esse componente abaixo

export default function HistoricoPage() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');
  const token = tokenCookie?.value;

  let user = null;
  if (token) {
    try {
      user = jwt.decode(token);
    } catch (error) { console.error(error); }
  }

  // Verificação de segurança simples
  if (!user || (user.cargo !== 'administrador' && user.cargo !== 'coordenador')) {
    return (
        <Layout>
            <div className="p-8 text-center text-red-500">
                Acesso negado. Apenas Admins e Coordenadores podem ver o histórico.
            </div>
        </Layout>
    );
  }

  return (
    <Layout>
      <main className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
        <div className="flex items-center justify-between pb-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Histórico de Atividades 
          </h1>
        </div>

        <div className="w-full bg-white rounded-xl shadow-md border p-5">
           {/* Passamos o token para o componente cliente poder fazer o fetch */}
          <LogsTable token={token} />
        </div>
      </main>
    </Layout>
  );
}