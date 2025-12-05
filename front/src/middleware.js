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

} 