"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { useTheme } from "next-themes"; // Importante para detectar o tema

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Cores dinâmicas baseadas no tema
  const textColor = isDark ? "#e2e8f0" : "#64748b"; // muted-foreground (claro/escuro)
  const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Coletas",
        data: data.coletas,
        backgroundColor: "#f59e0b", // Amber (Laranja/Amarelo)
        borderRadius: 4,
      },
      {
        label: "Alertas",
        data: data.alertas,
        backgroundColor: "#3b82f6", // Blue
        borderRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: textColor, // Cor do texto da legenda
          font: {
            family: "'Plus Jakarta Sans', sans-serif", // Mesma fonte do site
            size: 12
          }
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        titleColor: isDark ? "#ffffff" : "#0f172a",
        bodyColor: isDark ? "#cbd5e1" : "#334155",
        borderColor: isDark ? "#334155" : "#e2e8f0",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: textColor }, // Cor dos números no eixo Y
        grid: { color: gridColor }   // Cor das linhas de grade
      },
      x: {
        ticks: { color: textColor }, // Cor dos nomes no eixo X
        grid: { display: false }     // Remove grade vertical para limpar o visual
      }
    }
  };

  return (
    // Substituindo styles.chartCard por classes Tailwind
    <div className="flex flex-col h-full w-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Coletas por Bairro (últimos 30 dias)
      </h3>
      <div className="flex-1 w-full min-h-0">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}