"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ className, ...props }) {
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleCpfChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 9)
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
        else if (value.length > 6)
            value = value.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1.$2.$3");
        else if (value.length > 3)
            value = value.replace(/^(\d{3})(\d{3})$/, "$1.$2");
        setCpf(value);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        const rawCpf = cpf.replace(/\D/g, "");

        try {
            const response = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cpf: rawCpf, senha }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.erro || "Erro desconhecido ao fazer login.");
                return;
            }

            const userRole = data.user.cargo;
            router.push(`/dashboard/${userRole}`);
        } catch {
            setError("Não foi possível conectar ao servidor. Verifique sua conexão.");
        }
    };

    return (
        <div
            className={cn("flex flex-col items-center gap-6 animate-fadeIn", className)}
            {...props}
        >
            {/* Logo + Nome */}
            <div className="flex flex-col items-center">
                <Image
                    src="/imagen/Logo.png"
                    alt="EcoFlow logo"
                    width={120}
                    height={120}
                    className="rounded-md"
                />
                <h1 className="text-4xl font-bold text-green-700 tracking-tight">
                    EcoFlow
                </h1>
            </div>

            {/* Card principal */}
            <Card className="w-full max-w-sm border border-gray-100 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-gray-900 text-xl font-semibold">
                        Bem-vindo(a)!
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm">
                        Acesse sua conta para continuar
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        {/* CPF */}
                        <div className="grid gap-2">
                            <Label htmlFor="cpf" className="text-gray-700 font-medium">
                                CPF
                            </Label>
                            <Input
                                id="cpf"
                                type="text"
                                placeholder="123.456.789-10"
                                required
                                value={cpf}
                                onChange={handleCpfChange}
                                className="border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Senha */}
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-gray-700 font-medium">
                                    Senha
                                </Label>
                                <Link
                                    href="/esqueceu-senha"
                                    className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors"
                                >
                                    Esqueceu sua senha?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Mensagem de erro */}
                        {error && (
                            <p className="text-red-500 text-sm text-center animate-fadeIn">
                                {error}
                            </p>
                        )}

                        {/* Botão */}
                        <Button
                            type="submit"
                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer"
                        >
                            Entrar
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
        </div>
    );
}
