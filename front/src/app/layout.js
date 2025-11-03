// Local do arquivo: app/layout.js

// --- SUAS IMPORTAÇÕES ORIGINAIS ---
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// --- NOSSAS ADIÇÕES ---
import os from 'os'; // Módulo do Node.js para informações do sistema
import { ApiProvider } from '@/context/ApiContext'; // Nosso provedor de API

// --- SUAS FONTES ORIGINAIS (sem alterações) ---
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- SEU METADATA ORIGINAL (sugeri uma pequena melhoria no título) ---
export const metadata = {
  title: "EcoFlow",
  description: "Sistema de gerenciamento EcoFlow",
};

// --- NOSSA FUNÇÃO AUXILIAR (para manter o layout limpo) ---
const getApiUrlFromServer = () => {
  const FALLBACK_URL = 'http://localhost:3001';
  let detectedUrl = FALLBACK_URL;

  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          // URL primária correta, apontando para o backend (porta 3001)
          detectedUrl = `http://${iface.address}:3001`;
          console.log(`[Next.js Server] Layout renderizado no servidor. API primária: ${detectedUrl}`);
          return detectedUrl; // Retorna assim que encontra
        }
      }
    }
  } catch (error) {
    console.error("[Next.js Server] Erro ao detectar IP:", error);
  }
  
  console.log("[Next.js Server] IP da rede não detectado. Usando localhost como padrão.");
  return detectedUrl;
};


// --- SEU COMPONENTE RootLayout MODIFICADO ---
export default function RootLayout({ children }) {
  // A função é chamada no servidor para obter a URL da API
  const apiUrl = getApiUrlFromServer();

  return (
    // Fiz uma pequena correção de "pr-BR" para "pt-BR"
    <html lang="pt-BR">
      <body
        // Suas classes de fonte originais, sem nenhuma alteração
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 
          Aqui está a mágica: O ApiProvider agora "abraça" toda a sua aplicação.
          Ele recebe a URL detectada no servidor e a gerencia no lado do cliente.
        */}
        <ApiProvider initialUrl={apiUrl}>
          {children}
        </ApiProvider>
      </body>
    </html>
  );
}