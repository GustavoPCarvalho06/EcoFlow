import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const protectedPrefixes = ["/dashboard", "/comunicados", "/perfil", "/mensagens", "/mapa", "/usuarios"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

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



  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );



  if (isProtected) {

    // 1. Se não houver token ou token, redireciona para a página de login.
    if (!user) {
      const loginUrl = new URL(`/`, request.url);
      // Opcional: informa para qual página o usuário tentava ir.
      loginUrl.searchParams.set(" ", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Regra para a rota de Coordenador
    if (pathname.startsWith("/usuarios") && user.cargo !== "administrador") {
      // Se o usuário não for um coordenador, redireciona para "não autorizado".
      const unauthorizedUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    
    
  }

  // Se a rota não for protegida ou se o usuário tiver a permissão correta,
  // permite que a requisição continue.
  return NextResponse.next();







} 