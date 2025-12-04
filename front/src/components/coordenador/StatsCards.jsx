"use client";
import React from "react";
import styles from "./StatsCards.module.css";

export default function StatsCards({ stats = [] }) {
  return (
    <div className={styles.grid}>
      {stats.map((s) => (
        <div className={styles.card} key={s.id}>
          <div>
            <div className={styles.top}>
              <div className={styles.title}>{s.title}</div>
              <div
                className={styles.delta}
                style={{ color: s.delta >= 0 ? "#059669" : "#dc2626" }}
              >
                {s.delta >= 0 ? `+${s.delta}%` : `${s.delta}%`}
              </div>
            </div>

            <div className={styles.value}>
              {s.value}
              <span className={styles.unit}>{s.unit ?? ""}</span>
            </div>

            {s.subtitle && <div className={styles.subtitle}>{s.subtitle}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
