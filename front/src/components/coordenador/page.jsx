// =================================================================================
// Arquivo: src/components/coordenador/page.jsx
// =================================================================================

import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import os from 'os'; // Importando para detectar o IP da rede automaticamente

import BarChart from "@/components/coordenador/BarChart";
import DoughnutChart from "@/components/coordenador/DoughnutChart";
import Layout from "../dashboard/layout/Layout";

// --- Função para descobrir o IP do Backend dinamicamente (Mesma lógica do servidor) ---
const getBaseUrl = () => {
  // Se estiver rodando no servidor (build ou start), tenta achar o IP da rede
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // Pega o IPv4 que não seja interno (não seja 127.0.0.1)
        if (iface.family === 'IPv4' && !iface.internal) {
          return `http://${iface.address}:3001`;
        }
      }
    }
  } catch (error) {
    console.error("Erro ao detectar IP no server component:", error);
  }
  // Se falhar, usa localhost
  return 'http://localhost:3001';
};

// --- Função para buscar dados do Backend ---
async function getDashboardData(token) {
  if (!token) return null;

  const baseUrl = getBaseUrl(); // Pega a URL correta (IP ou Localhost)
  
  try {
    const res = await fetch(`${baseUrl}/dashboard/coordenador`, {
      cache: 'no-store', // Dados sempre frescos
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      // Se der erro (ex: backend off), não quebra a página, retorna nulo
      console.error(`Falha no fetch: ${res.status} ${res.statusText}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Erro de conexão com o dashboard:", error.message);
    return null;
  }
}

// =======================================================
// STATS CARDS
// =======================================================
const StatsCards = ({ stats }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {stats.map(stat => (
      <div 
        key={stat.id} 
        className="p-6 bg-card text-card-foreground border border-border rounded-xl shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
      >
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
          
          <p className={`text-sm font-semibold ${
            stat.isCritical ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {stat.icon || ''}
          </p>
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold text-foreground">{stat.value}</p>
        </div>
      </div>
    ))}
  </div>
);

export default async function CoordenadorPage() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');
  const token = tokenCookie?.value;

  let user = null;
  if (token) {
    try {
      const decodedToken = jwt.decode(token);
      user = decodedToken;
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  }

  // 1. Busca os dados reais
  const data = await getDashboardData(token);

  // Valores padrão (ZERADOS) caso a API falhe ou retorne vazio
  const cardsData = data?.cards || { totalLixeiras: 0, totalColetores: 0, lixeirasCheias: 0, eficiencia: 0 };
  const graphData = data?.graficos || { vazias: 0, quaseCheias: 0, cheias: 0 };

  const stats = [
    { 
      id: 1, 
      title: "Lixeiras Monitoradas", 
      value: cardsData.totalLixeiras, 
      icon: "🗑️" 
    },
    { 
      id: 2, 
      title: "Total de Coletores", 
      value: cardsData.totalColetores, 
      icon: "👷" 
    },
    { 
      id: 3, 
      title: "Alertas Críticos (Cheias)", 
      value: cardsData.lixeirasCheias, 
      isCritical: true, 
      icon: "⚠️" 
    },
    { 
      id: 4, 
      title: "Eficiência", 
      value: `${cardsData.eficiencia}%`, 
      icon: "📈" 
    }
  ];

  const barData = {
    labels: ["Status Geral do Sistema"],
    coletas: [graphData.vazias], 
    alertas: [graphData.cheias + graphData.quaseCheias] 
  };

  const doughData = {
    labels: ["Vazias", "Quase Cheias", "Cheias"],
    values: [graphData.vazias, graphData.quaseCheias, graphData.cheias]
  };

  return (
    <Layout>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-background min-h-full">
          <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl text-foreground">Dashboard do Coordenador</h1>
          </div>
          
          <StatsCards stats={stats} />

          <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-foreground">Visão Operacional</h3>
            <p className="text-sm text-muted-foreground">
                Monitoramento em tempo real dos sensores e status de coleta.
            </p>

            <div className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[360px]">
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