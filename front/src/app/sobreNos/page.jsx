"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Leaf, Recycle, MapPin, CheckCircle2 } from "lucide-react";

export default function SobreNos() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-100 selection:text-green-800">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/imagen/Logo.png"
              alt="Verde Claro logo"
              width={60}
              height={50}
              className="object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-gray-900">Verde Claro</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#historia" className="hover:text-green-600 transition-colors">História</a>
            <a href="#valores" className="hover:text-green-600 transition-colors">Valores</a>
            <a href="#missao" className="hover:text-green-600 transition-colors">Missão</a>
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <Badge className="bg-green-50 text-green-700 hover:bg-green-100 px-4 py-1.5 text-sm font-medium border-green-200 rounded-full transition-colors">
              🌱 Sustentabilidade desde 1997
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Coleta Seletiva Inteligente <span className="text-green-600">em São Caetano</span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed max-w-xl">
              A Verde Claro é a maior empresa de coleta seletiva da cidade, transformando resíduos em recursos desde 1997. 
              Trabalhamos com tecnologia e processos eficientes para cuidar do meio ambiente e da comunidade.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-xl shadow-green-600/20 transition-all hover:-translate-y-1 w-full sm:w-auto">
                  Acessar Sistema
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-green-700 hover:border-green-200 font-semibold text-lg w-full sm:w-auto">
                  Página Inicial
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:w-1/2 relative w-full">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-green-200/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl opacity-50"></div>

            <div className="relative bg-white border border-gray-200 rounded-3xl shadow-2xl p-4 sm:p-6">
              <div className="flex items-center justify-center h-64">
                <Image
                  src="/imagen/logo.png"
                  alt="Coleta seletiva Verde Claro"
                  width={400}
                  height={250}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* História */}
      <section id="historia" className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa História</h2>
          <p className="text-gray-500 text-lg mb-4">
            Fundada em 1997, a Verde Claro se tornou a maior empresa de coleta seletiva de São Caetano do Sul. 
            Nossa missão é transformar resíduos em recursos, promovendo sustentabilidade e consciência ambiental na cidade e região.
          </p>
          <p className="text-gray-500 text-lg">
            Com décadas de experiência, desenvolvemos processos eficientes para coleta, triagem e destinação correta de materiais recicláveis, sempre respeitando o meio ambiente.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section id="valores" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossos Valores</h2>
            <p className="text-gray-500 text-lg">
              Sustentabilidade, inovação e compromisso com a comunidade são pilares da nossa atuação.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <Leaf className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sustentabilidade</h3>
              <p className="text-gray-500 leading-relaxed">Priorizamos práticas que respeitam o meio ambiente e promovem economia circular.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <Recycle className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Inovação</h3>
              <p className="text-gray-500 leading-relaxed">Implementamos soluções inteligentes para otimizar a coleta e o tratamento de resíduos.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <MapPin className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Compromisso Social</h3>
              <p className="text-gray-500 leading-relaxed">Apoiamos projetos educativos e ambientais para gerar impacto positivo na comunidade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Missão */}
      <section id="missao" className="py-24 bg-green-50">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa Missão</h2>
          <p className="text-gray-700 text-lg">
            Transformar a gestão de resíduos em um processo sustentável, acessível e eficiente, contribuindo para um futuro mais verde para São Caetano do Sul e região.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-green-600">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Pronto para fazer parte da mudança?</h2>
          <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">
            Junte-se à Verde Claro e transforme a gestão de resíduos com tecnologia e responsabilidade ambiental.
          </p>
          <Link href="/login">
            <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-green-700 hover:bg-green-50 font-bold text-xl shadow-2xl transition-transform hover:scale-105">
              Acessar Plataforma
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/imagen/Logo.png"
              alt="Verde Claro logo"
              width={60}
              height={50}
              className="object-contain"
            />
            <span className="text-lg font-bold text-gray-900">Verde Claro</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Grupo EcoFlow. Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}
