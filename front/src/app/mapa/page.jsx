import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Mapa from "@/components/Map/Mapa";

export default async function MapaPage() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get("token");

  let user = null;
  if (tokenCookie?.value) {
    try {
      user = jwt.decode(tokenCookie.value);
    } catch {
      console.error("Erro ao decodificar o token");
    }
  }

  return (
      <Mapa/>
    
  );
}
