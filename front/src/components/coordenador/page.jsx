import {  CoordenadorSidebar } from "@/components/dashboard/Sidebar/SidebarCoordenador";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

// Assumindo que você substituirá isso pelos seus imports reais
import BarChart from "@/components/coordenador/BarChart";
import DoughnutChart from "@/components/coordenador/DoughnutChart";
import Layout from "../dashboard/layout/Layout";

// =======================================================
// CORREÇÃO DE CORES NO COMPONENTE StatsCards
// =======================================================
const StatsCards = ({ stats }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {stats.map(stat => (
      // Usamos 'bg-card' e 'text-card-foreground' para consistência com Shadcn/UI
      <div key={stat.id} className="p-6 bg-card text-card-foreground border rounded-lg shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          {/* Título do card (ex: "Lixeiras monitoradas") */}
          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
          {/* Variação percentual */}
          <p className={`text-sm font-semibold ${stat.delta > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stat.delta > 0 ? '+' : ''}{stat.delta}%
          </p>
        </div>
        <div className="mt-2">
          {/* Valor principal */}
          <p className="text-3xl font-bold">{stat.value}</p>
        </div>
      </div>
    ))}
  </div>
);
// =======================================================


export default async function CoordenadorPage() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');

  let user = null;
  if (tokenCookie && tokenCookie.value) {
    try {
      const decodedToken = jwt.decode(tokenCookie.value);
      user = decodedToken;
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  }

  // Dados fictícios (adicionamos o '%' nos deltas para consistência)
  const stats = [
    { id: 1, title: "Lixeiras monitoradas", value: 124, delta: 6 },
    { id: 2, title: "Coletas (hoje)", value: 37, delta: 12 },
    { id: 3, title: "Alertas críticos", value: 4, delta: -9 },
    { id: 4, title: "Eficiência", value: "88%", delta: 3 }
  ];

  const barData = {
    labels: ["Centro", "Bairro A", "Bairro B", "Vila Nova", "Residencial", "Industrial"],
    coletas: [120, 90, 75, 60, 50, 40],
    alertas: [8, 6, 4, 3, 2, 1]
  };

  const doughData = {
    labels: ["Plástico", "Papel", "Vidro", "Metal"],
    values: [45, 25, 20, 10]
  };

  return (
    <Layout>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Dashboard do Coordenador</h1>
          </div>
          
          <StatsCards stats={stats} />

          <div className="p-6 bg-white border rounded-lg shadow">
            <h3 className="text-lg font-semibold">Visão geral</h3>
            <p className="text-sm text-gray-500">Resumo das últimas 24-48 horas — dados fictícios para visualização.</p>

            <div className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[360px]">
                <div className="lg:col-span-2 h-full">
                  <BarChart data={barData} />
                </div>
                <div className="lg:col-span-1 h-full">
                  <DoughnutChart data={doughData} />
                </div>
              </div>
            </div>
          </div>

        </main>
    </Layout>
  );
}