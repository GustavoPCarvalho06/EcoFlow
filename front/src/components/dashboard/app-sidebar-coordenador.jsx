"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from "next/image"
import io from "socket.io-client"
import { IconDashboard, IconMapPin, IconBroadcast, IconMail, IconBell } from "@tabler/icons-react" 
import { NavUser } from "@/components/dashboard/nav-user-coordenador"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUnreadCount } from "@/context/UnreadCountContext";

const navItemsCoordenador = [
    { title: "Dashboard", href: "/dashboard/coordenador", icon: IconDashboard },
    { title: "Mensagem", href: "/dashboard/coordenador/mensagens", icon: IconMail },
    { title: "Mapa de Coleta", href: "/dashboard/coordenador/rotas", icon: IconMapPin },
    { title: "Gerenciar Comunicados", href: "/dashboard/coordenador/comunicados", icon: IconBroadcast },
];

export function AppSidebarCoordenador( usuario, ...props ) {
    const pathname = usePathname();
    const { totalUnreadCount } = useUnreadCount() || { totalUnreadCount: 0 };
    
    // Extrai o objeto de usuário da prop, que vem em um formato aninhado
    const userData = usuario.usuario;

    // Estado para a contagem de novos comunicados
    const [newComunicadoCount, setNewComunicadoCount] = useState(0);

    // Função para buscar a contagem de comunicados não vistos
    const checkNewComunicados = useCallback(async () => {
        if (!userData?.id) return;
        try {
            const response = await fetch('http://localhost:3001/comunicados/unseen-count', {
                headers: { 'x-user-id': userData.id.toString() }
            });
            if (response.ok) {
                const data = await response.json();
                setNewComunicadoCount(data.count);
            }
        } catch (error) {
            console.error("Erro ao verificar novos comunicados:", error);
        }
    }, [userData]);

    // Efeito para buscar a contagem ao carregar e ouvir por atualizações
    useEffect(() => {
        checkNewComunicados();
        const socket = io('http://localhost:3001');
        
        // Ouve pelo evento do backend para re-verificar a contagem
        socket.on('comunicados_atualizados', checkNewComunicados);
        
        // Zera o contador na UI se o usuário navegar para a página de comunicados
        if (pathname.includes('/comunicados')) {
            setNewComunicadoCount(0);
        }

        // Limpeza: desconecta o socket ao sair
        return () => {
            socket.off('comunicados_atualizados', checkNewComunicados);
            socket.disconnect();
        };
    }, [pathname, checkNewComunicados]);

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader className="border-b">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <a href="/dashboard/coordenador">
                                <Image
                                    src="/imagen/Logo.png"
                                    alt="EcoFlow logo"
                                    width={50}
                                    height={50}
                                    className="rounded-sm"
                                />
                                <span className="text-base font-semibold">EcoFlow.</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="p-4">
                {/* Ícone de sino com notificação */}
                 <div className="mb-4 flex items-center gap-2">
                    <Link href="/dashboard/coordenador/comunicados" passHref>
                        <Button size="icon" variant="ghost" aria-label="Notifications" className="relative">
                            <IconBell className="h-6 w-6" />
                            {newComunicadoCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {newComunicadoCount > 9 ? '9+' : newComunicadoCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                </div>

                 <nav className="flex flex-col gap-2">
                    {navItemsCoordenador.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`
                                flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium
                                transition-colors
                                ${pathname === item.href
                                    ? 'bg-muted text-foreground' 
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }
                            `}
                        >
                            <item.icon className="h-6 w-6" />
                            <span>{item.title}</span>

                            {/* Contador de mensagens não lidas */}
                            {item.title === "Mensagem" && totalUnreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-auto min-w-[1.25rem] flex items-center justify-center px-1">
                                    {totalUnreadCount > 99 ? '+99' : totalUnreadCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>
            </SidebarContent>
            <SidebarFooter className="border-t">
                <NavUser usuario={usuario}/>
            </SidebarFooter>
        </Sidebar>
    )
}