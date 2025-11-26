"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { logout } from "@/hooks/logout"

export function NavUser({
  usuario,
}) {
  const { isMobile } = useSidebar()

  // CORREÇÃO: Função segura para acessar as propriedades do usuário
  const getUserName = () => {
    // Tenta acessar usuario.usuario.nome primeiro, depois usuario.nome
    return usuario?.usuario?.nome || usuario?.nome || "Usuário"
  }

  const getUserCpf = () => {
    // Tenta acessar usuario.usuario.cpf primeiro, depois usuario.cpf
    return usuario?.usuario?.cpf || usuario?.cpf || ""
  }

  const getInitial = () => {
    const name = getUserName()
    return name ? name.charAt(0).toUpperCase() : "U"
  }
    const handleLogoutClick = async () => {
      // 1. Limpa o token do cliente
      if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
      }
      // 2. Chama a server action que limpa o cookie
      await logout();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {getInitial()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{getUserName()}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {getUserCpf()}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {getInitial()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{getUserName()}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {getUserCpf()}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/Perfil">
                <DropdownMenuItem>
                  <IconUserCircle />
                  Account
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer"> 
              
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}