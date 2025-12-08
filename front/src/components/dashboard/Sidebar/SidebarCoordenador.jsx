// =================================================================================
// Arquivo: front/src/components/dashboard/Sidebar/SidebarCoordenador.jsx
// =================================================================================

"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import { IconDashboard, IconMapPin, IconBroadcast, IconMail, IconBell, IconHistory } from "@tabler/icons-react"; 
import { NavUser } from "@/components/dashboard/nav-user-coordenador"; 
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
import { useUnreadCount } from "@/app/context/UnreadCountContext";
import { cn } from "@/lib/utils";

const navItemsCoordenador = [
    { title: "Dashboard", href: "/dashboard", icon: IconDashboard },
    { title: "Mensagem", href: "/mensagens", icon: IconMail },
    { title: "Mapa de Coleta", href: "/mapa", icon: IconMapPin },
    { title: "Gerenciar Comunicados", href: "/comunicados", icon: IconBroadcast },
    { title: "Histórico", href: "/historico", icon: IconHistory },
];

export function CoordenadorSidebar({ usuario, ...props }) {
    const pathname = usePathname();
    const { totalMsgUnread, totalComunicadoUnread } = useUnreadCount() || {};

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
                        <SidebarMenuButton asChild className="hover:bg-transparent data-[slot=sidebar-menu-button]:!p-0 h-auto">
                            <Link href="/dashboard" className="flex items-center gap-3">
                                <div className="relative w-10 h-10">
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
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</span>
                    <Link href="/comunicados" passHref>
                        <Button size="icon" variant="ghost" className="relative h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors">
                            <IconBell className="h-5 w-5" />
                            {(totalComunicadoUnread > 0) && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
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
                            // --- ALTERAÇÃO: Forçar refresh (F5) ao clicar em Mensagem ---
                            onClick={(e) => {
                                if (item.href === '/mensagens') {
                                    e.preventDefault();
                                    window.location.href = '/mensagens';
                                }
                            }}
                            // ----------------------------------------------------------
                            className={getLinkClasses(pathname === item.href)}
                        >
                            <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-white" : "text-green-600")} />
                            <span>{item.title}</span>

                            {item.title === "Mensagem" && totalMsgUnread > 0 && (
                                <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold rounded-full h-5 px-2 flex items-center justify-center">
                                    {totalMsgUnread > 99 ? '+99' : totalMsgUnread}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>
            </SidebarContent>
            
            <SidebarFooter className="border-t border-gray-100 p-4">
                <NavUser usuario={usuario}/>
            </SidebarFooter>
        </Sidebar>
    );
}