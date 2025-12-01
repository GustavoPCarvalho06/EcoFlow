import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import PageAdmin from "@/components/administrador/page";
import ColetorPage from "@/components/coletor/page";
import CoordenadorPage from "@/components/coordenador/page";
import { redirect } from "next/navigation";

export default function dashboard() {
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
  if (!user) {
    redirect('/');
  };

  switch (user.cargo) {
    case ('administrador'):
      return (
        <PageAdmin />
      )
    case ('coordenador'):
      return (
        <CoordenadorPage />
      )
    case ('coletor'):
      return (
        <ColetorPage />
      )
  }
}
