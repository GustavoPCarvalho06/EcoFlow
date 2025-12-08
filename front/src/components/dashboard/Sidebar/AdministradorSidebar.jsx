// =================================================================================
// Arquivo: front/src/components/dashboard/Sidebar/AdministradorSidebar.jsx
// =================================================================================

"use client";

import * as React from "react";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import {
    IconDashboard,
    IconUsers,
    IconBell,
    IconMail,
    IconHistory,
    IconBroadcast,
    IconMapPin
} from "@tabler/icons-react";
import { NavUser } from "@/components/dashboard/nav-user-adiministrador";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUnreadCount } from "@/app/context/UnreadCountContext";
import { cn } from "@/lib/utils";

const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: IconDashboard },
    { title: "Usuários", href: "/usuarios", icon: IconUsers },
    { title: "Mensagem", href: "/mensagens", icon: IconMail },
    { title: "Comunicados", href: "/comunicados", icon: IconBroadcast },
    { title: "Histórico", href: "/historico", icon: IconHistory },
];

const coletorNavItems = [
    { title: "Mapa", href: "/mapa", icon: IconMapPin }
];

export function AdministradorSidebar({ usuario, ...props }) {
    const pathname = usePathname();
    const { totalMsgUnread, totalComunicadoUnread, clearComunicadoCount } = useUnreadCount();

    // Função para estilização dos links
    const getLinkClasses = (isActive) => cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group",
        isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
            : "text-sidebar-foreground/70 hover:bg-green-200/50 hover:text-sidebar-accent-foreground"
    );

    return (
        <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border bg-sidebar" {...props}>
            <SidebarHeader className="py-5 px-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="hover:bg-transparent data-[slot=sidebar-menu-button]:!p-0 h-auto"
                        >
                            <Link href="/dashboard" className="flex items-center gap-3">
                                <div className="relative w-10 h-10 md:w-12 md:h-12">
                                    <Image
                                        src="/imagen/Logo.png"
                                        alt="EcoFlow logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-xl font-bold text-primary tracking-tight">EcoFlow.</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-3 py-2">
                {/* Botão de Notificação (Sino) */}
                <div className="mb-6 px-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notificações</span>
                    <Link href="/comunicados" passHref>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="relative h-8 w-8 hover:bg-green-200/50 hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
                            onClick={clearComunicadoCount}
                        >
                            <IconBell className="h-5 w-5 text-primary" />
                            {totalComunicadoUnread > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm">
                                    {totalComunicadoUnread > 99 ? `+99` : totalComunicadoUnread}
                                </span>
                            )}
                        </Button>
                    </Link>
                </div>

                {/* Menu Principal */}
                <nav className="flex flex-col gap-2">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            // --- LÓGICA DE RECARREGAMENTO (F5) ---
                            onClick={(e) => {
                                if (item.href === '/mensagens') {
                                    e.preventDefault(); // Impede a navegação SPA padrão
                                    window.location.href = '/mensagens'; // Força o navegador a recarregar a página
                                }
                            }}
                            // -------------------------------------
                            className={getLinkClasses(pathname === item.href)}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5",
                                    pathname === item.href ? "text-sidebar-primary-foreground" : "text-primary"
                                )}
                            />
                            <span>{item.title}</span>
                            
                            {/* Badge de mensagens não lidas */}
                            {item.title === "Mensagem" && totalMsgUnread > 0 && (
                                <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 px-2 flex items-center justify-center">
                                    {totalMsgUnread > 99 ? '+99' : totalMsgUnread}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Menu Coletor */}
                <div className="mt-8">
                    <div className="px-3 pb-2">
                        <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Coletor</span>
                    </div>
                    <nav className="flex flex-col gap-2 mt-1">
                        {coletorNavItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={getLinkClasses(pathname === item.href)}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5",
                                        pathname === item.href ? "text-sidebar-primary-foreground" : "text-primary"
                                    )}
                                />
                                <span>{item.title}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-4">
                <NavUser usuario={usuario} />
            </SidebarFooter>
        </Sidebar>
    );
}