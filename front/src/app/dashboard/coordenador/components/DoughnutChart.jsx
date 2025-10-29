// src/app/dashboard/cordenador/components/DoughnutChart.jsx
"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./Charts.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: ["#f97316", "#60a5fa", "#34d399", "#f472b6"],
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" }
    }
  };

  return (
    <div className={styles.chartCard} style={{ height: "100%" }}>
      <h3 className={styles.chartTitle}>Composição de Resíduos</h3>
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
