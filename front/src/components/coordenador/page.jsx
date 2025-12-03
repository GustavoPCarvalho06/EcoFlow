// =================================================================================
// Arquivo: src/components/coordenador/page.jsx
// =================================================================================

import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

import BarChart from "@/components/coordenador/BarChart";
import DoughnutChart from "@/components/coordenador/DoughnutChart";
import Layout from "../dashboard/layout/Layout";

// --- Função para buscar dados do Backend ---
async function getDashboardData(token) {
  if (!token) return null;

  try {
    // Ajuste a URL se necessário (ex: http://localhost:3001)
    // Estamos usando a URL interna do servidor ou localhost
    const res = await fetch('http://localhost:3001/dashboard/coordenador', {
      cache: 'no-store', // Garante dados frescos
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Falha ao buscar dados do dashboard");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
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
          
          {/* Lógica simples para cor do ícone ou delta (opcional) */}
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

  // Valores padrão caso a API falhe ou retorne vazio
  const cardsData = data?.cards || { totalLixeiras: 0, totalColetores: 0, lixeirasCheias: 0, eficiencia: 0 };
  const graphData = data?.graficos || { vazias: 0, quaseCheias: 0, cheias: 0 };

  // 2. Configura os Cards conforme seu pedido
  const stats = [
    { 
      id: 1, 
      title: "Lixeiras Monitoradas", 
      value: cardsData.totalLixeiras, 
      icon: "🗑️" 
    },
    { 
      id: 2, 
      title: "Total de Coletores", // Alterado de "Coletas (hoje)"
      value: cardsData.totalColetores, 
      icon: "👷" 
    },
    { 
      id: 3, 
      title: "Alertas Críticos (Cheias)", 
      value: cardsData.lixeirasCheias, 
      isCritical: true, // Para ficar vermelho
      icon: "⚠️" 
    },
    { 
      id: 4, 
      title: "Eficiência", 
      value: `${cardsData.eficiencia}%`, 
      icon: "📈" 
    }
  ];

  // 3. Configura o Gráfico de Barras
  // Pedido: "mostra as coletas dos mes mostrando o total de lixeiras vazias com o total de lixeiras meio cheias e cheias"
  // Como não temos histórico mensal complexo ainda, vamos mostrar o balanço atual "Coletadas vs Pendentes"
  const barData = {
    labels: ["Status Geral do Sistema"],
    // Dataset 1: Lixeiras Vazias (Representa o que já foi coletado/está limpo)
    coletas: [graphData.vazias], 
    // Dataset 2: Lixeiras Cheias + Quase Cheias (Representa demanda de trabalho/alertas)
    alertas: [graphData.cheias + graphData.quaseCheias] 
  };

  // 4. Configura o Gráfico de Doughnut (Rosca)
  // Pedido: "quantos tem de vazil de meio cheia e de cheia"
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
          
          {/* Renderiza os cards atualizados */}
          <StatsCards stats={stats} />

          <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-foreground">Visão Operacional</h3>
            <p className="text-sm text-muted-foreground">
                Monitoramento em tempo real dos sensores e status de coleta.
            </p>

            <div className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[360px]">
                
                {/* Gráfico de Barras: Comparativo Vazias vs (Cheias + Quase Cheias) */}
                <div className="lg:col-span-2 h-full">
                  <BarChart data={barData} />
                </div>

                {/* Gráfico de Rosca: Distribuição detalhada */}
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