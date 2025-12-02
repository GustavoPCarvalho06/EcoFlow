// Arquivo: src/components/dashboard/nav-user-coordenador.jsx

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

  // --- CORREÇÃO DO ERRO ---
  // Verifica se o dado está direto em 'usuario.nome' ou aninhado em 'usuario.usuario.nome'
  // Isso evita o erro "Cannot read properties of undefined"
  const nomeUser = usuario?.nome || usuario?.usuario?.nome || "Usuário";
  const cpfUser = usuario?.cpf || usuario?.usuario?.cpf || "";
  
  // Pega a inicial de forma segura
  const inicial = nomeUser ? nomeUser.charAt(0).toUpperCase() : "U";

  const handleLogoutClick = async () => {
    // Garante limpeza do localStorage também no cliente
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
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
                  {inicial}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{nomeUser}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {cpfUser}
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
                    {inicial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{nomeUser}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {cpfUser}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <Link href="/Perfil">
              <DropdownMenuItem className="cursor-pointer">
                <IconUserCircle />
                  Perfil
              </DropdownMenuItem>
                  </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer"> 
              <IconLogout />
                Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}