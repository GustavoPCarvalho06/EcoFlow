"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import styles from "./Layout.module.css";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.container}>
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`${styles.main} ${sidebarOpen ? styles.shift : ""}`}>
        {children}
      </main>
    </div>
  );
}
