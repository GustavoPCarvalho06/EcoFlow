import { ComunicadosComponenteCoordenador } from "@/components/dashboard/ComunicadosComponenteCoordenador";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import Layout from "@/components/dashboard/layout/Layout";
import { ComunicadosComponenteAdministrador } from "@/components/dashboard/ComunicadosComponenteAdministrador";

export default async function ComunicadosPage() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');
  
  const token = tokenCookie?.value;

  let user = null;
  if (token) {
    try {
      const decodedToken = jwt.decode(token);
      user = decodedToken;
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  }

  switch (user.cargo) {
    case 'coordenador':
      return (
        <Layout>
          <main className="flex flex-1 flex-col p-4 md:p-6">
            <div className="flex items-center mb-4">
              <h1 className="font-semibold text-lg md:text-2xl">Mural de Comunicados (Coord)</h1>
            </div>
          
            <ComunicadosComponenteCoordenador user={user} token={token} />
          </main>
        </Layout>
      );

    case 'administrador':
      return (
        <Layout>
          <main className="flex flex-1 flex-col p-4 md:p-6">
            <div className="flex items-center mb-4">
              <h1 className="font-semibold text-lg md:text-2xl">Mural de Comunicados (Admin)</h1>
            </div>
           
            <ComunicadosComponenteAdministrador user={user} token={token} />
          </main>
        </Layout>
      );
      
    default:
        return (
            <Layout>
                <main className="flex flex-1 flex-col p-4 md:p-6">
                    <h1>Acesso restrito ou cargo desconhecido.</h1>
                </main>
            </Layout>
        )
  }
}