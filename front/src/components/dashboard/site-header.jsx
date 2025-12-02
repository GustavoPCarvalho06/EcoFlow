// src/components/dashboard/site-header.jsx

'use client'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { logout } from "@/hooks/logout"
import { ModeToggle } from "@/components/ModeToggle" // <--- IMPORTAR O BOTÃO

export function SiteHeader({ usuario }) {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b-1 border-green-600 bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {/* Div que empurra o conteúdo para a direita */}
        <div className="ml-auto flex items-center gap-2">
            
            {/* --- AQUI ESTÁ O BOTÃO --- */}
            <ModeToggle />
            
        </div>
      </div>
    </header>
  )
}