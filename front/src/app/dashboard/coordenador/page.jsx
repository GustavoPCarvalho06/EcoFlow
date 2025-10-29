// src/app/dashboard/cordenador/page.jsx
"use client";
import React from "react";
import Layout from "./Layout/Layout";
import StatsCards from "./components/StatsCards";
import BarChart from "./components/BarChart";
import DoughnutChart from "./components/DoughnutChart";
import styles from "./Dashboard.module.css";

export default function CoordenadorIndex() {
  // dados mock
  const stats = [
    { id: 1, title: "Lixeiras monitoradas", value: 124, delta: +6 },
    { id: 2, title: "Coletas (hoje)", value: 37, delta: +12 },
    { id: 3, title: "Alertas críticos", value: 4, delta: -9 },
    { id: 4, title: "Eficiência", value: "88%", delta: +3 }
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
      <div className={styles.headerRow}>
        <h1>Dashboard do Coordenador</h1>
      </div>

      <StatsCards stats={stats} />

      <div className={styles.card}>
        <h3>Visão geral</h3>
        <p>Resumo das últimas 24-48 horas — dados mockados para visualização.</p>

        <div style={{ marginTop: 12 }}>
          <div className={styles.chartsGrid || ""} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, height: 360 }}>
            <div style={{ height: "100%" }}>
              <BarChart data={barData} />
            </div>
            <div style={{ height: "100%" }}>
              <DoughnutChart data={doughData} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
