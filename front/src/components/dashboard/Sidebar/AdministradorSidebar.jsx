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

    const getLinkClasses = (isActive) => cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
        isActive
            ? "bg-green-600 text-white shadow-lg shadow-green-600/20" 
            : "text-gray-500 hover:bg-green-100 hover:text-green-700"
    );

    return (
        <Sidebar collapsible="offcanvas" className="border-r-1 border-green-600" {...props}>
            <SidebarHeader className="py-5 px-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="hover:bg-transparent data-[slot=sidebar-menu-button]:!p-0 h-auto"
                        >
                            <Link href="/dashboard" className="flex items-center gap-3">
                                <div className="relative w-20 h-20">
                                    <Image
                                        src="/imagen/Logo.png"
                                        alt="EcoFlow logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-xl font-bold text-green-700 tracking-tight">EcoFlow.</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-3 py-2">
                <div className="mb-6 px-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notificações</span>
                    <Link href="/comunicados" passHref>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="relative h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors cursor-pointer"
                            onClick={clearComunicadoCount}
                        >
                            <IconBell className="h-5 w-5 text-green-600" />
                            {totalComunicadoUnread > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                                    {totalComunicadoUnread > 99 ? `+99` : totalComunicadoUnread}
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
                            className={cn(getLinkClasses(pathname === item.href), "group")}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5",
                                    pathname === item.href ? "text-white" : "text-green-600"
                                )}
                            />
                            <span>{item.title}</span>
                            
                            {item.title === "Mensagem" && totalMsgUnread > 0 && (
                                <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold rounded-full h-5 px-2 flex items-center justify-center">
                                    {totalMsgUnread > 99 ? '+99' : totalMsgUnread}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="mt-8">
                    <div className="px-3 pb-2">
                        <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Coletor</span>
                    </div>
                    <nav className="flex flex-col gap-2 mt-1">
                        {coletorNavItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(getLinkClasses(pathname === item.href), "group")}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5",
                                        pathname === item.href ? "text-white" : "text-green-600"
                                    )}
                                />
                                <span>{item.title}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 p-4">
                <NavUser usuario={usuario} />
            </SidebarFooter>
        </Sidebar>
    );
}
