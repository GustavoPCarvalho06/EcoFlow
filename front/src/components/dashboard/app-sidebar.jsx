"use client"

import * as React from "react"
// [MODIFICADO] Adicionamos 'useCallback'
import { useState, useEffect, useCallback } from "react"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from "next/image"
// [NOVO] Importamos o 'io' para a conexão em tempo real
import io from "socket.io-client";
import {
    IconDashboard,
    IconUsers,
    IconBell,
    IconMail,
    IconBroadcast,
    IconMapPin
} from "@tabler/icons-react"
import { NavUser } from "@/components/dashboard/nav-user-adiministrador"
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
import { useUnreadCount } from "@/context/UnreadCountContext"

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard/administrador",
        icon: IconDashboard,
    },
    {
        title: "Usuários",
        href: "/dashboard/administrador/usuarios",
        icon: IconUsers,
    },
    {
        title: "Mensagem",
        href: "/dashboard/administrador/mensagens",
        icon: IconMail,
    },
    {
        title: "Comunicados",
        href: "/dashboard/administrador/comunicados",
        icon: IconBroadcast,
    },
]

const coletorNavItems = [
    {
        title: "Mapa",
        href: "/dashboard/administrador/mapa",
        icon: IconMapPin,
    }
]

// [CORREÇÃO] A assinatura da função foi revertida para o seu original
export function AppSidebar(usuario, ...props) {
    const pathname = usePathname();
    const { totalUnreadCount } = useUnreadCount() || { totalUnreadCount: 0 };

    // [NOVO] Estado para a contagem de novos comunicados
    const [newComunicadoCount, setNewComunicadoCount] = useState(0);

    // [NOVO] Função para buscar e contar novos comunicados
    const checkNewComunicados = useCallback(async () => {
        // [CORREÇÃO] Acessamos o objeto de usuário da maneira que sua prop é estruturada
        const userData = usuario.usuario;
        if (!userData?.id) return;

        try {
            const response = await fetch('http://localhost:3001/comunicados/unseen-count', {
                headers: { 'x-user-id': userData.id.toString() }
            });
            if (!response.ok) return;

            const data = await response.json();
            setNewComunicadoCount(data.count);
        } catch (error) {
            console.error("Erro ao verificar novos comunicados:", error);
        }
    }, [usuario]);

    // [NOVO] Efeito para gerenciar a notificação
    useEffect(() => {
        checkNewComunicados();

        const socket = io('http://localhost:3001');
        socket.on('comunicados_atualizados', checkNewComunicados);

        if (pathname.includes('/comunicados')) {
            setNewComunicadoCount(0);
        }

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
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5 h-15"
                        >
                            <Link href="/dashboard/administrador">
                                <Image
                                    src="/imagen/Logo.png"
                                    alt="EcoFlow logo"
                                    width={80}
                                    height={80}
                                    className="rounded-sm"
                                />
                                <span className="text-lg font-semibold">EcoFlow.</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="p-4">
                {/* [MODIFICADO] Envolvemos o botão com o Link e adicionamos a lógica do contador */}
                <div className="mb-4 flex items-center gap-2">
                    <Link href="/dashboard/administrador/comunicados" passHref>
                        <Button size="icon" variant="ghost" aria-label="Notifications" className="relative">
                            <IconBell className="h-6 w-6" />
                            {newComunicadoCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {newComunicadoCount > 99 ? `+99` : newComunicadoCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                </div>

                <nav className="flex flex-col gap-2">
                    {navItems.map((item, index) => (
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
                            {item.title === "Mensagem" && totalUnreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-auto min-w-[1.25rem] flex items-center justify-center px-1">
                                    {totalUnreadCount > 99 ? '+99' : totalUnreadCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="mt-8">
                    <div className="px-3 pb-2">
                        <span className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase">Coletor</span>
                    </div>
                    <div className="border-t mx-3 mb-2"></div>
                    <nav className="flex flex-col gap-2">
                        {coletorNavItems.map((item, index) => (
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
                            </Link>
                        ))}
                    </nav>
                </div>

            </SidebarContent>

            <SidebarFooter className="border-t">
                {/* [CORREÇÃO] A prop 'usuario' é passada sem alterações, exatamente como no seu código original */}
                <NavUser usuario={usuario} />
            </SidebarFooter>
        </Sidebar>
    )
}