"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Map, Trash2, BarChart3, Settings } from "lucide-react";
import styles from "./Sidebar.module.css";

export default function ColetorSidebar({ onToggle }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { title: "Rotas", href: "/coordenador/rotas", icon: Map },
    { title: "Pontos", href: "/coordenador/pontos", icon: Trash2 },
    { title: "Relatórios", href: "/coordenador/relatorios", icon: BarChart3 },
    { title: "Configurações", href: "/coordenador/configuracoes", icon: Settings },
  ];

  const toggleSidebar = () => {
    const newState = !open;
    setOpen(newState);
    if (onToggle) onToggle(newState);
  };

  const getClasses = (isActive) =>
    `${styles.item} ${
      isActive ? styles.active : styles.inactive
    }`;

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
        {navItems.map((item, i) => (
          <Link key={i} href={item.href} className={getClasses(pathname === item.href)}>
            <item.icon
              size={20}
              className={pathname === item.href ? styles.iconActive : styles.icon}
            />
            {open && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
