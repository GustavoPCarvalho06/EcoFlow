// src/app/dashboard/administrador/layout.jsx (VERSÃO FINAL E CORRETA)

import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { UnreadCountProvider } from "@/context/UnreadCountContext";

export default function AdministradorLayout({ children }) {
  
  // A lógica para obter os dados do usuário agora vive AQUI, no layout.
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');
  let user = null;
  if (tokenCookie && tokenCookie.value) {
    try {
      user = jwt.decode(tokenCookie.value);
    } catch (error) {
      console.error("Erro ao decodificar token no layout:", error);
    }
  }

  // O layout simplesmente renderiza o Provedor, que por sua vez renderiza a página atual ({children}).
  // Agora, TODAS as páginas de administrador (e seus componentes) estarão dentro do contexto.
  return (
    <UnreadCountProvider user={user}>
      {children}
    </UnreadCountProvider>
  );
}