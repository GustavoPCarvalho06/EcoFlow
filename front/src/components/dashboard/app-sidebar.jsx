"use client"

import * as React from "react"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from "next/image"
import { 
    IconDashboard, 
    IconUsers, 
    IconPlus, 
    IconBell, 
    IconMail, 
    IconBroadcast,
    IconMapPin 
} from "@tabler/icons-react" 
import { NavUser } from "@/components/dashboard/nav-user"
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

export function AppSidebar( usuario, ...props ) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader className="border-b">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href="/dashboard/administrador">
                                <Image
                                    src="/logo.png"
                                    alt="EcoFlow logo"
                                    width={40}
                                    height={40}
                                    className="rounded-sm"
                                />
                                <span className="text-lg font-semibold">EcoFlow.</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="p-4">
                <div className="mb-4 flex items-center gap-2">
                    <Button size="icon" variant="ghost" aria-label="Notifications">
                        {/* MUDANÇA 1: Aumentamos o ícone de sino para consistência */}
                        <IconBell className="h-6 w-6" /> 
                    </Button>
                </div>
                
                {/* MUDANÇA 2: Aumentamos o espaçamento entre os links */}
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
                            {/* MUDANÇA 3: Aumentamos o tamanho dos ícones e o padding vertical (py-3) */}
                            <item.icon className="h-6 w-6" /> 
                            <span>{item.title}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-8"> {/* MUDANÇA 4: Aumentamos o espaço acima da seção "Coletor" */}
                    <div className="px-3 pb-2">
                        <span className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase">Coletor</span>
                    </div>
                    <div className="border-t mx-3 mb-2"></div>
                    {/* MUDANÇA 2 (Repetida): Aumentamos o espaçamento entre os links */}
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
                                {/* MUDANÇA 3 (Repetida): Aumentamos o tamanho dos ícones e o padding vertical (py-3) */}
                                <item.icon className="h-6 w-6" />
                                <span>{item.title}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                
            </SidebarContent>

            <SidebarFooter className="border-t">
                <NavUser usuario={usuario}/>
            </SidebarFooter>
        </Sidebar>
    )
}