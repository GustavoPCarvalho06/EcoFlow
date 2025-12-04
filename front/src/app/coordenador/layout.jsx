import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { UnreadCountProvider} from "@/app/context/UnreadCountContext";

export default function AdministradorLayout({ children }) {
  

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


  return (
<UnreadCountProvider user={user}>
  {children}
</UnreadCountProvider>
  );
}