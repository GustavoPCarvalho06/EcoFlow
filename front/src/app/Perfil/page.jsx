import { AppSidebarCoordenador } from "@/components/dashboard/Sidebar/SidebarCoordenador";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Perfil from "@/components/Perfil/perfil";
import { AppSidebar } from "@/components/dashboard/Sidebar/AdministradorSidebar";
import Sidebar from "@/components/dashboard/Sidebar/AdministradorSidebar";
import Layout from "@/components/dashboard/layout/Layout";

export default async function pagePerfil() {
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

  return(
    <Layout>
        <Perfil/>
    </Layout>
  )
}