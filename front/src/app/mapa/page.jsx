

import MapboxMap from "@/components/Map/MapboxMap.jsx";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import MapBoxCriarWrapper from "@/components/Map/MapBoxCriarWrapper.jsx";
import MapBoxManejarWrapper from "@/components/Map/MapBoxManejarWrapper.jsx";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Menu, PlusCircle, Cog } from "lucide-react";
import Layout from "@/components/dashboard/layout/Layout";

export default async function MapaPage() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get("token");
  const tokenValue = tokenCookie?.value;

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

            <PopoverContent align="start" side="right" className="w-[200px] p-2 rounded-md border border-border shadow-lg bg-popover text-popover-foreground">
              
             
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-accent hover:text-accent-foreground transition cursor-pointer">
                    <PlusCircle className="h-5 w-5" />
                    Criar Ponto
                  </button>
                </DialogTrigger>

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

             
              <Dialog className="w-full">
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-accent hover:text-accent-foreground transition cursor-pointer">
                    <Cog className="h-5 w-5" />
                    Manejar Pontos
                  </button>
                </DialogTrigger>

               
                <DialogContent className="!max-w-5xl sm:max-w-[900px] w-full h-[80vh] flex flex-col gap-0 bg-card border-border p-0 overflow-hidden">
                  
                  <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-foreground text-xl">Gerenciar Pontos Existentes</DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 overflow-hidden p-6 pt-2">
                  
                    <MapBoxManejarWrapper token={tokenValue}/>
                  </div>

                </DialogContent>
              </Dialog>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1 rounded-lg border border-border overflow-hidden shadow-sm">
          <MapboxMap latitude={-23.647222} longitude={-46.557282} zoom={14} />
        </div>
      </main>
    </Layout>
  );
}