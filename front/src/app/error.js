"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-100 selection:text-green-800 flex flex-col">
      
      {/* --- NAVBAR SIMPLES --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/imagen/Logo.png"
              alt="EcoFlow logo"
              width={60}
              height={50}
              className="object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-gray-900">EcoFlow.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button className="h-10 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5">
                Acessar Sistema
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* --- CONTEÚDO CENTRAL --- */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 pt-32">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">Ops!</h1>
        <p className="text-lg text-gray-500 mb-6">
          Algo deu errado. {error?.message || ""}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => reset?.()}
            className="h-14 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-xl shadow-green-600/20 transition-all hover:-translate-y-1 w-full sm:w-auto"
          >
            Tentar Novamente
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="h-14 px-8 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-green-700 hover:border-green-200 font-semibold text-lg w-full sm:w-auto"
            >
              Voltar para Home
            </Button>
          </Link>
        </div>
      </main>

      {/* --- FOOTER SIMPLES --- */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/imagen/Logo.png"
              alt="EcoFlow logo"
              width={60}
              height={50}
              className="object-contain"
            />
            <span className="text-lg font-bold text-gray-900">EcoFlow.</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Grupo 2. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
