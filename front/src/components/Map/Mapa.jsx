// =================================================================================
// Arquivo: src/app/mapa/page.jsx
// =================================================================================

import MapboxMap from "@/components/Map/MapboxMap.jsx";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import MapBoxCriarWrapper from "@/components/Map/MapBoxCriarWrapper.jsx";
import MapBoxManejarWrapper from "@/components/Map/MapBoxManejarWrapper.jsx"; // Corrigi o import path se necessário

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
      {/* bg-background garante o fundo escuro correto */}
      <main className="flex flex-1 flex-col p-4 md:p-6 overflow-hidden bg-background h-full">
      

        <div className="flex flex-col gap-3 mb-4">
          <h1 className="font-semibold text-lg md:text-2xl text-foreground">Mapa de Coleta</h1>
       

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition w-fit cursor-pointer shadow-sm">
                <Menu className="h-6 w-6" />
                <span className="text-sm font-medium">Menu</span>
              </button>
            </PopoverTrigger>

            {/* bg-popover e text-popover-foreground adaptam o menu ao tema */}
            <PopoverContent
              align="start"
              side="right"
              className="w-[200px] p-2 rounded-md border border-border shadow-lg bg-popover text-popover-foreground"
            >
              {/* Criar */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-accent hover:text-accent-foreground transition cursor-pointer">
                    <PlusCircle className="h-5 w-5" />
                    Criar Ponto
                  </button>
                </DialogTrigger>

                {/* DialogContent ajustado para bg-card */}
                <DialogContent className="!max-w-5xl w-[90vw] h-[700px] flex flex-col gap-4 bg-card border-border">
                  <DialogHeader className="text-center">
                    <DialogTitle className="text-xl font-semibold text-foreground">
                
                      Criar Novo Ponto de Coleta
                    </DialogTitle>
                  </DialogHeader>

                  <p className="text-center text-muted-foreground">
                  
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
                  <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-accent hover:text-accent-foreground transition cursor-pointer">
                    <Cog className="h-5 w-5" />
                    Manejar Pontos
                  </button>
                </DialogTrigger>

                <DialogContent className=" w-max-w-3xl bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Gerenciar Pontos Existentes</DialogTitle>
                
                  </DialogHeader>

                  <div className=" overflow-hidden py-6 text-muted-foreground">
                    <MapBoxManejarWrapper token={tokenCookie?.value}/>
                  
                  </div>
                </DialogContent>
              </Dialog>
            </PopoverContent>
          </Popover>
        </div>

        {/* Container do Mapa com borda adaptável */}
        <div className="flex-1 rounded-lg border border-border overflow-hidden shadow-sm">
       
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