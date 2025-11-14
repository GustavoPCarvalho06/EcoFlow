import { AdministradorSidebar, AppSidebar } from "@/components/dashboard/Sidebar/AdministradorSidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import MapboxMap from "@/components/Map/MapboxMap.jsx";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import MapBoxCriarWrapper from "@/components/Map/MapBoxCriarWrapper.jsx";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Menu, PlusCircle, Cog } from "lucide-react";
import Layout from "@/components/dashboard/layout/Layout";

export default async function MapaPage() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get("token");

  let user = null;
  if (tokenCookie?.value) {
    try {
      user = jwt.decode(tokenCookie.value);
    } catch {
      console.error("Erro ao decodificar o token");
    }
  }

  return (

    <Layout>
      <main className="flex flex-1 flex-col p-4 md:p-6 overflow-hidden">

        <div className="flex flex-col gap-3 mb-4">
          <h1 className="font-semibold text-lg md:text-2xl">Mapa de Coleta</h1>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-accent transition w-23.5 cursor-pointer">
                <Menu className="h-6 w-6" />
                <span className="text-sm font-medium">Menu</span>
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              side="right"
              className="w-[200px] p-2 rounded-md border shadow-lg bg-white"
            >

              {/* Criar */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-accent transition cursor-pointer">
                    <PlusCircle className="h-5 w-5" />
                    Criar Ponto
                  </button>
                </DialogTrigger>

                <DialogContent className="!max-w-5xl w-[90vw] h-[700px] flex flex-col gap-4">
                  <DialogHeader className="text-center">
                    <DialogTitle className="text-xl font-semibold">
                      Criar Novo Ponto de Coleta
                    </DialogTitle>
                  </DialogHeader>

                  <p className="text-center text-black">
                    Clique no mapa para selecionar o local do novo ponto.
                  </p>
                  <MapBoxCriarWrapper />
                </DialogContent>
              </Dialog>

              {/* Manejar */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-accent transition cursor-pointer">
                    <Cog className="h-5 w-5" />
                    Manejar Pontos
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Gerenciar Pontos Existentes</DialogTitle>
                  </DialogHeader>

                  <div className="py-6 text-muted-foreground">
                    N fiz ainda
                  </div>
                </DialogContent>
              </Dialog>

            </PopoverContent>
          </Popover>
        </div>

        {/* Mapa principal da pagina */}
        <div className="flex-1 rounded-lg border overflow-hidden">
          <MapboxMap
            latitude={-23.647222}
            longitude={-46.557282}
            zoom={14}
          />
        </div>

      </main>

    </Layout>
  );
}
