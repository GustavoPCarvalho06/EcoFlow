"use client"

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react"

import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
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

  // Função segura para acessar as propriedades do usuário
  const getUserName = () => {
    return usuario?.usuario?.nome || usuario?.nome || "Usuário"
  }

  const getUserCpf = () => {
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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                  {getInitial()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-sidebar-foreground">{getUserName()}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {getUserCpf()}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4 text-sidebar-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-popover text-popover-foreground border-border"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
                    {getInitial()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{getUserName()}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {getUserCpf()}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/Perfil">
                <DropdownMenuItem className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50">
                  <IconUserCircle className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 text-destructive focus:text-destructive"> 
              <IconLogout className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}