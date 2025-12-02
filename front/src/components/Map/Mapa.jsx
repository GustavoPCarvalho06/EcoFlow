import MapboxMap from "@/components/Map/MapboxMap.jsx";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import MapBoxCriarWrapper from "@/components/Map/MapBoxCriarWrapper.jsx";
import MapBoxManejarWrapper from "./MapBoxManejarWrapper.jsx";

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
  const tokenValue = tokenCookie?.value; // Get the string value

  let user = null;
  if (tokenValue) {
    try {
      user = jwt.decode(tokenValue);
    } catch {
      console.error("Erro ao decodificar o token");
    }
  }

  return (
    <Layout>
      <main className="flex flex-1 flex-col p-4 md:p-6 overflow-hidden h-[calc(100vh-64px)]">

        <div className="flex flex-col gap-3 mb-4 shrink-0">
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

                <DialogContent className="!max-w-5xl w-[90vw] h-[80vh] flex flex-col gap-4">
                  <DialogHeader className="text-center shrink-0">
                    <DialogTitle className="text-xl font-semibold">
                      Criar Novo Ponto de Coleta
                    </DialogTitle>
                  </DialogHeader>

                  <p className="text-center text-black shrink-0">
                    Clique no mapa para selecionar o local do novo ponto.
                  </p>
                  <div className="flex-1 min-h-0 relative">
                    <MapBoxCriarWrapper />
                  </div>
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

                {/* Added max-h-[85vh] and flex-col to keep it within screen bounds */}
                <DialogContent className="!max-w-6xl !w-[95vw] max-h-[85vh] flex flex-col overflow-hidden">
                  <DialogHeader className="shrink-0">
                    <DialogTitle>Gerenciar Pontos Existentes</DialogTitle>
                  </DialogHeader>

                  {/* Wrapper with overflow-y-auto handles the scrolling if the table is too long */}
                  <div className="flex-1 overflow-y-auto min-h-0 py-2 pr-1">
                    <MapBoxManejarWrapper token={tokenValue} />
                  </div>
                </DialogContent>
              </Dialog>
            </PopoverContent>
          </Popover>
        </div>

        {/* Mapa principal da pagina */}
        <div className="flex-1 rounded-lg border overflow-hidden relative min-h-0">
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