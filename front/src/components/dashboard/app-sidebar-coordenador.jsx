// src/components/dashboard/app-sidebar-coordenador.jsx (VERSÃO FINAL)
"use client"

import * as React from "react"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from "next/image"
import { IconDashboard, IconMapPin, IconBroadcast ,IconMail} from "@tabler/icons-react" 
import { NavUser } from "@/components/dashboard/nav-user-coordenador" // Use o NavUser específico se houver um
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

// [NOVO] 1. Importamos o hook do nosso contexto compartilhado.
import { useUnreadCount } from "@/context/UnreadCountContext";

const navItemsCoordenador = [
    { title: "Dashboard", href: "/dashboard/coordenador", icon: IconDashboard },
    {title: "Mensagem",href: "/dashboard/coordenador/mensagens",icon: IconMail,},
    { title: "Mapa de Coleta", href: "/dashboard/coordenador/rotas", icon: IconMapPin },
    { title: "Gerenciar Comunicados", href: "#", icon: IconBroadcast },
];

export function AppSidebarCoordenador( usuario, ...props ) {
    const pathname = usePathname();

    // [NOVO] 2. Usamos o hook para pegar a contagem total do contexto.
    const { totalUnreadCount } = useUnreadCount() || { totalUnreadCount: 0 };

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

                            {/* [NOVO] 3. Adicionamos a lógica de renderização do contador. */}
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