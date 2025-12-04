"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useTheme } from "next-themes";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ data }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";


  const textColor = isDark ? "#e2e8f0" : "#64748b";

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"], 
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: textColor, 
          padding: 20,
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 12
          },
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        titleColor: isDark ? "#ffffff" : "#0f172a",
        bodyColor: isDark ? "#cbd5e1" : "#334155",
        borderColor: isDark ? "#334155" : "#e2e8f0",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      }
    },
    cutout: "55%",
  };

  return (

    <div className="flex flex-col h-full w-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Composição de Resíduos
      </h3>
      <div className="flex-1 w-full min-h-0 flex items-center justify-center relative">
        <Doughnut data={chartData} options={options} />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
       
        </div>
      </div>
    </div>
  );
} 