"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Leaf,
  ArrowRight,
  LayoutDashboard,
  Smartphone,
  Wifi,
  BarChart3,
  MapPin,
  CheckCircle2,
  Recycle
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-100 selection:text-green-800">


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

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#solucao" className="hover:text-green-600 transition-colors">Solução</a>
            <a href="#como-funciona" className="hover:text-green-600 transition-colors">Como Funciona</a>
            <a href="#beneficios" className="hover:text-green-600 transition-colors">Benefícios</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button className="h-10 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5 cursor-pointer">
                Acessar Sistema
              </Button>
            </Link>
          </div>
        </div>
      </header>


      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            <div className="lg:w-1/2 space-y-8">
              <Badge className="bg-green-50 text-green-700 hover:bg-green-100 px-4 py-1.5 text-sm font-medium border-green-200 rounded-full transition-colors">
                🌱 Inovação para Cidades Inteligentes
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                Gestão Inteligente de <span className="text-green-600">Coleta Seletiva</span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed max-w-xl">
                Otimize rotas, reduza custos e monitore lixeiras em tempo real.
                Uma solução integrada via Web, Mobile e IoT.
                Atualmente a maior empresa de coleta seletiva de são caetano do sul.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login">
                  <Button size="lg" className="h-14 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-xl shadow-green-600/20 transition-all hover:-translate-y-1 w-full sm:w-auto">
                    Entrar no sistema <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/sobreNos">
                  <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-green-700 hover:border-green-200 font-semibold text-lg w-full sm:w-auto">
                    Sobre nós
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 relative w-full">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-green-200/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl opacity-50"></div>

              <div className="relative bg-white border border-gray-200 rounded-3xl shadow-2xl p-4 sm:p-6 lg:rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">

                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="h-2 w-20 bg-gray-100 rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <div className="h-8 w-8 bg-green-200 rounded-lg mb-3 flex items-center justify-center">
                      <Recycle className="h-4 w-4 text-green-700" />
                    </div>
                    <div className="h-2 w-16 bg-green-200 rounded-full mb-2"></div>
                    <div className="h-6 w-10 bg-green-600 rounded-lg"></div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <div className="h-8 w-8 bg-blue-200 rounded-lg mb-3 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-blue-700" />
                    </div>
                    <div className="h-2 w-16 bg-blue-200 rounded-full mb-2"></div>
                    <div className="h-6 w-10 bg-blue-600 rounded-lg"></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 h-48 border border-gray-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-46.6333,-23.5505,12,0/600x400?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xsN3I2aW0wMDJnMm5wZ3Z6b3Z6cW53In0.example')] bg-cover opacity-10"></div>
                  <span className="relative z-10 text-gray-400 font-medium flex items-center gap-2">
                    <Map className="h-4 w-4" /> Mapa de Coleta em Tempo Real
                  </span>

                  <div className="absolute top-1/3 left-1/4 h-4 w-4 bg-red-500 rounded-full border-2 border-white shadow-md animate-bounce"></div>
                  <div className="absolute bottom-1/3 right-1/3 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solucao" className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Um Ecossistema Completo</h2>
            <p className="text-gray-500 text-lg">
              Integramos hardware e software para oferecer controle total sobre a operação de coleta seletiva.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <LayoutDashboard className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Plataforma Web</h3>
              <p className="text-gray-500 leading-relaxed">
                Painel administrativo para coordenadores. Gerencie rotas, visualize mapas e acompanhe métricas de produtividade em tempo real.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-14 w-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">App Mobile</h3>
              <p className="text-gray-500 leading-relaxed">
                Ferramenta para os coletores. Receba rotas otimizadas, reporte problemas e veja quais pontos precisam de atenção imediata.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                <Wifi className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sensores IoT</h3>
              <p className="text-gray-500 leading-relaxed">
                Hardware inteligente instalado nas lixeiras. Detecta o nível de resíduos e envia alertas automáticos para o sistema.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl opacity-20 blur-lg"></div>
                <div className="relative bg-gray-900 rounded-3xl p-8 sm:p-12 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BarChart3 className="h-48 w-48" />
                  </div>
                  <h3 className="text-3xl font-bold mb-6">Resultados Reais</h3>
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <h4 className="text-5xl font-bold text-green-400">30%</h4>
                      <p className="text-gray-300 font-medium">Redução em custos<br />operacionais</p>
                    </div>
                    <div className="w-full h-px bg-gray-700"></div>
                    <div className="flex items-center gap-4">
                      <h4 className="text-5xl font-bold text-blue-400">0%</h4>
                      <p className="text-gray-300 font-medium">Lixeiras transbordando<br />após implementação</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Por que funciona o <span className="text-green-600">EcoFlow?</span>
              </h2>
              <p className="text-lg text-gray-500">
                Nosso sistema elimina a adivinhação da coleta de lixo. Ao invés de rotas fixas e ineficientes, usamos dados para tomar decisões.
              </p>

              <ul className="space-y-4">
                {[
                  "Eliminação de viagens no vazio",
                  "Planejamento de rotas automatizado",
                  "Monitoramento 24/7 das lixeiras",
                  "Dados para tomada de decisão estratégica"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>


      <section className="py-24 bg-green-600">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Pronto para simplificar seu trabalho?</h2>
          <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">
            Junte-se à EcoFlow e transforme gestão de resíduos com tecnologia de ponta.
          </p>
          <Link href="/login">
            <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-green-700 hover:bg-green-50 font-bold text-xl shadow-2xl transition-transform hover:scale-105">
              Acessar Plataforma
            </Button>
          </Link>
        </div>
      </section>


      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
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
              © {new Date().getFullYear()} Grupo EcoFlow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Map({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  );
}