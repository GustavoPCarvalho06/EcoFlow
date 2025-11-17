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

  if (isProtected) {

    // 1. Se não houver token ou token, redireciona para a página de login.
    if (!user) {
      const loginUrl = new URL(`/`, request.url);
      // Opcional: informa para qual página o usuário tentava ir.
      loginUrl.searchParams.set(" ", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Regra para a rota de Coordenador
    if (pathname.startsWith("/dashboard/") && user.cargo !== "coordenador") {
      // Se o usuário não for um coordenador, redireciona para "não autorizado".
      const unauthorizedUrl = new URL("/", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // 3. Regra para a rota de Administrador
    if (pathname.startsWith("/dashboard/") && user.cargo !== "administrador") {
      // Se o usuário não for um administrador, redireciona para "não autorizado".
      const unauthorizedUrl = new URL("/", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // Se a rota não for protegida ou se o usuário tiver a permissão correta,
  // permite que a requisição continue.
  return NextResponse.next();
}

// O 'matcher' define em quais rotas este middleware será ativado.
export const config = {
  matcher: [
    "/:path*",
    "/:path*"
  ],
};