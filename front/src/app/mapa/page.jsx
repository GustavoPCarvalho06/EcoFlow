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
import Mapa from "@/components/Map/Mapa";
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
      <Mapa/>
    
  );
}
