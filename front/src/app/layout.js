import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import os from 'os';
import { cookies } from 'next/headers';


import { ThemeProvider } from "@/components/theme-provider";

import { ApiProvider } from './context/ApiContext';
import { UnreadCountProvider } from './context/UnreadCountContext.jsx';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EcoFlow",
  description: "Sistema de gerenciamento EcoFlow",
};

const getApiUrlFromServer = () => {
  const FALLBACK_URL = 'http://localhost:3001';
  let detectedUrl = FALLBACK_URL;
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          detectedUrl = `http://${iface.address}:3001`;
          
          return detectedUrl;
        }
      }
    }
  } catch (error) {
    console.error("[Next.js Server] Erro ao detectar IP:", error);
  }
  
  return detectedUrl;
};

export default function RootLayout({ children }) {
  const apiUrl = getApiUrlFromServer();
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  let user = null;

  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      user = { id: payload.id, cargo: payload.cargo, nome: payload.nome };
    } catch (e) {
      console.error("Cookie de token inválido ou malformado no layout:", e);
    }
  }

  return (
   
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        

        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <ApiProvider initialUrl={apiUrl}>
            <UnreadCountProvider user={user}>
              {children}
            </UnreadCountProvider>
          </ApiProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}