// src/app/dashboard/cordenador/components/BarChart.jsx
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
import styles from "./Charts.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Coletas",
        data: data.coletas,
        backgroundColor: "#f59e0b",
        borderRadius: 6
      },
      {
        label: "Alertas",
        data: data.alertas,
        backgroundColor: "#3b82f6",
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // important to control size via container
    plugins: {
      legend: { position: "top" },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className={styles.chartCard} style={{ height: "100%" }}>
      <h3 className={styles.chartTitle}>Coletas por Bairro (últimos 30 dias)</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
