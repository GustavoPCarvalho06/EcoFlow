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
import { useTheme } from "next-themes"; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const textColor = isDark ? "#e2e8f0" : "#64748b"; 
  const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Coletas",
        data: data.coletas,
        backgroundColor: "#f59e0b",
        borderRadius: 4,
      },
      {
        label: "Alertas",
        data: data.alertas,
        backgroundColor: "#3b82f6",
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
          color: textColor,
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
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
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      x: {
        ticks: { color: textColor },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <h3 className="text-base font-semibold text-foreground mb-4">
        Coletas por Bairro (últimos 30 dias)
      </h3>

      {/* Chart Container */}
      <div className="flex-1 w-full min-h-0 relative">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
