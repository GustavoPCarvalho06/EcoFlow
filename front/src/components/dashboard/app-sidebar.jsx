"use client"

import * as React from "react"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from "next/image"
// 1. IMPORTAÇÃO ATUALIZADA: Trocamos IconMegaphone por IconBroadcast
import { 
    IconDashboard, 
    IconUsers, 
    IconPlus, 
    IconBell, 
    IconMail, 
    IconBroadcast 
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

// 2. LISTA DE NAVEGAÇÃO ATUALIZADA com o ícone correto
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
        href: "#",
        icon: IconMail,
    },
    {
        title: "Comunicados",
        href: "#",
        icon: IconBroadcast, // Ícone corrigido!
    },
]

// MANTIDO: A assinatura da função que já funciona para você.
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
                        <IconBell className="h-5 w-5" />
                    </Button>
                </div>
                
                <nav className="flex flex-col gap-1">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`
                                flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium
                                transition-colors
                                ${pathname === item.href
                                    ? 'bg-muted text-foreground' 
                                    : 'text-muted-foreground hover:bg-muted/ ৫০ hover:text-foreground'
                                }
                            `}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                        </Link>
                    ))}
                </nav>
                
            </SidebarContent>

            <SidebarFooter className="border-t">
                {/* MANTIDO: A forma original de passar a prop para o NavUser. */}
                <NavUser usuario={usuario}/>
            </SidebarFooter>
        </Sidebar>
    )
}