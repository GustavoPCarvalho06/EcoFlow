"use client";

import Link from "next/link";
import styles from "./notfound.module.css";

export default function NotFoundPage() {
    return (
        <div className={styles.container}>
            <div className={styles.fall + " " + styles.fall1}>♻️</div>
            <div className={styles.fall + " " + styles.fall2}>📱</div>
            <div className={styles.fall + " " + styles.fall3}>🔌</div>
            <div className={styles.fall + " " + styles.fall4}>💡</div>
            <div className={styles.fall + " " + styles.fall5}>🖥️</div>
            <div className={styles.fall + " " + styles.fall6}>📱</div>
            <div className={styles.fall + " " + styles.fall7}>🔌</div>


            <div className={styles.content}>

                <img
                    src="/reciclagem.png"
                    alt="Reciclagem"
                    className={styles.image}
                />

                <h1 className={styles.errorCode}>404!</h1>

                <h2 className={styles.title}>Página não encontrada</h2>

                <p className={styles.subtitle}>
                    O conteúdo que você está buscando parece ter sido reciclado.
                    Mas não se preocupe — você pode voltar ao início.
                </p>

                <Link href="/dashboard" className={styles.button}>
                    Voltar ao Dashboard
                </Link>

            </div>
        </div>
    );
}
