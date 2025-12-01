import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

// Defina os prefixos das rotas que você quer proteger.
const protectedPrefixes = ["/dashboard", "/comunicados", "/perfil", "/mensagens", "/mapa", "/usuarios"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Obtém o token e o token (cargo do usuário) dos cookies.
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


  console.log("Acessando a rota:", pathname);
  console.log("token do usuário (cookie):", user);
  console.log("Decoded token cargo:", user?.cargo);


  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

} 