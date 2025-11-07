"use client";

import { useEffect } from "react";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import { IconDashboard, IconMapPin, IconBroadcast, IconMail, IconBell } from "@tabler/icons-react"; 
import { NavUser } from "@/components/dashboard/nav-user-coordenador"; // VERIFIQUE este caminho
import { Button } from "@/components/ui/button";
import { 
    Sidebar, 
    SidebarContent, 
    SidebarFooter, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuButton, 
    SidebarMenuItem 
} from "@/components/ui/sidebar";

// Importa o hook que agora centraliza TODA a lógica de notificações.
// VERIFIQUE se este caminho está correto para a sua estrutura de pastas.
import { useUnreadCount } from "../../app/context/UnreadCountContext.jsx"; 

const navItemsCoordenador = [
    { title: "Dashboard", href: "/dashboard/coordenador", icon: IconDashboard },
    { title: "Mensagem", href: "/dashboard/coordenador/mensagens", icon: IconMail },
    { title: "Mapa de Coleta", href: "/dashboard/coordenador/rotas", icon: IconMapPin },
    { title: "Gerenciar Comunicados", href: "/dashboard/coordenador/comunicados", icon: IconBroadcast },
];

export function AppSidebarCoordenador(usuario, ...props) {
    const pathname = usePathname();
    
    // Consome os valores e funções diretamente do nosso contexto centralizado.
    // Isso substitui toda a lógica de useState, useCallback, useEffect e socket.io
    // que existia anteriormente neste componente.
    const { totalMsgUnread, totalComunicadoUnread, clearComunicadoCount } = useUnreadCount() || {};



    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader className="border-b">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5 h-auto">
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
                 <div className="mb-4 flex items-center gap-2">
                    <Link href="/dashboard/coordenador/comunicados" passHref>
                        <Button size="icon" variant="ghost" aria-label="Notifications" className="relative">
                            <IconBell className="h-6 w-6" />
                            {/* Usa o estado 'totalComunicadoUnread' vindo do contexto */}
                            {(totalComunicadoUnread > 0) && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {totalComunicadoUnread > 9 ? '9+' : totalComunicadoUnread}
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

                            {/* Usa o estado 'totalMsgUnread' vindo do contexto */}
                            {item.title === "Mensagem" && totalMsgUnread > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-auto min-w-[1.25rem] flex items-center justify-center px-1">
                                    {totalMsgUnread > 99 ? '+99' : totalMsgUnread}
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
    );
}