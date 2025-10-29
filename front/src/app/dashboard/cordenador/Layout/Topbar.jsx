// components/Layout/Topbar.jsx
import React from "react";
import styles from "./Topbar.module.css";

export default function Topbar(){
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} aria-label="Abrir menu">☰</button>
        <div className={styles.searchWrap}>
          <input className={styles.search} placeholder="Buscar ponto, rota ou coordenador..." />
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Notificações">🔔</button>
        <button className={styles.profile}>FR</button>
      </div>
    </header>
  );
}
