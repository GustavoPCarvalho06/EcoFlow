import { NextResponse } from "next/server";

// Defina os prefixos das rotas que você quer proteger.
const protectedPrefixes = ["/dashboard/coordenador", "/dashboard/administrador"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Obtém o token e o perfil (cargo do usuário) dos cookies.
  const token = request.cookies.get("token")?.value;
  const perfil = request.cookies.get("perfil")?.value;

  console.log("Acessando a rota:", pathname);
  console.log("Perfil do usuário (cookie):", perfil);

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    // 1. Se não houver token ou perfil, redireciona para a página de login.
    if (!token || !perfil) {
      const loginUrl = new URL("/login", request.url);
      // Opcional: informa para qual página o usuário tentava ir.
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Regra para a rota de Coordenador
    if (pathname.startsWith("/dashboard/coordenador") && perfil !== "coordenador") {
      // Se o usuário não for um coordenador, redireciona para "não autorizado".
      const unauthorizedUrl = new URL("/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // 3. Regra para a rota de Administrador
    if (pathname.startsWith("/dashboard/administrador") && perfil !== "administrador") {
      // Se o usuário não for um administrador, redireciona para "não autorizado".
      const unauthorizedUrl = new URL("/unauthorized", request.url);
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
    "/dashboard/coordenador/:path*", 
    "/dashboard/administrador/:path*"
  ],
};