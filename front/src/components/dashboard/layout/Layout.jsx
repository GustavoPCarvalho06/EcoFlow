
import { AdministradorSidebar, AppSidebar } from "@/components/dashboard/Sidebar/AdministradorSidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { CoordenadorSidebar } from "../Sidebar/SidebarCoordenador";
import ColetorSidebar from "../Sidebar/ColetorSidebar";
import { redirect } from "next/navigation";



export default async function Layout({ children }) {
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
    if (!user){
        redirect('/');
    };



    switch (user.cargo) {
        case 'administrador':
            return (
                <SidebarProvider
                    style={{
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)"
                    }}
                >
                    <AdministradorSidebar variant="inset" usuario={user} />
                    <SidebarInset usuario={user}>
                        <SiteHeader usuario={user} />
                            {children}
                    </SidebarInset>
                </SidebarProvider>
            );


        case 'coordenador':
            return (

                <SidebarProvider
                    style={{
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)"
                    }}
                >
                    <CoordenadorSidebar variant="inset" usuario={user} />
                    <SidebarInset usuario={user}>
                        <SiteHeader usuario={user} />
                        
                            {children}
                    </SidebarInset>
                </SidebarProvider>
            );
        case 'cooletor':
            return (
                <SidebarProvider
                    style={{
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)"
                    }}
                >
                    <ColetorSidebar variant="inset" usuario={user} />
                    <SidebarInset usuario={user}>
                        <SiteHeader usuario={user} />
                        <main>
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            );
    }


}