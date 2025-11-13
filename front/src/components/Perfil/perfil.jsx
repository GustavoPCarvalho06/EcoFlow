import { AppSidebarCoordenador } from "@/components/dashboard/Sidebar/SidebarCoordenador";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function Perfil() {
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

    return (
        
            <div className="mx-auto my-auto border w-150 px-5">
                <div className="flex gap-2 items-center py-5">
                    <Avatar className="h-20 w-20 rounded-360">
                        <AvatarFallback className="rounded-lg">
                            {user.nome ? user.nome.charAt(0).toUpperCase() : ""}
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="text-4xl ">{user.nome}</h1>
                </div>
                <div className="grid gap-2 py-2">
                    <div className="flex">
                        <div className="font-black px-2">email cadastrado: </div>
                        <div>{user.email}</div>
                    </div>
                    <div className="flex">
                        <div className="font-black px-2">cpf: </div>
                        <div> {user.cpf}</div>
                    </div>
                    <div className="flex">
                        <div className="font-black px-2">cargo: </div>
                        <div>{user.cargo}</div>
                    </div>
                </div>
            </div>
    );
}