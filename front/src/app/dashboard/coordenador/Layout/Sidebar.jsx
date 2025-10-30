"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, Map, Trash2, BarChart3, Settings } from "lucide-react";
import styles from "./Sidebar.module.css";

export default function Sidebar({ onToggle }) {
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => {
    const newState = !open;
    setOpen(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
      <div className={styles.top}>
        <button className={styles.toggleBtn} onClick={toggleSidebar}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        {open && (
          <div className={styles.logoBox}>
            <h2 className={styles.logo}>VerdeClaro</h2>
            <p className={styles.role}>Coordenador</p>
          </div>
        )}
      </div>

      <nav className={styles.nav}>

        <Link href="coordenador/rotas" className={styles.item}>
          <Map size={20} />
          {open && <span>Rotas</span>}
        </Link>

        <Link href="/coordenador/pontos" className={styles.item}>
          <Trash2 size={20} />
          {open && <span>Pontos</span>}
        </Link>

        <Link href="/coordenador/relatorios" className={styles.item}>
          <BarChart3 size={20} />
          {open && <span>Relatórios</span>}
        </Link>

        <Link href="/coordenador/configuracoes" className={styles.item}>
          <Settings size={20} />
          {open && <span>Configurações</span>}
        </Link>
      </nav>
    </aside>
  );
}
