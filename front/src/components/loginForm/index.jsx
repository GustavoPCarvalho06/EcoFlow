// components/LoginForm.jsx
"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Importe useRouter
// REMOVA: import axios from "axios"; // Não precisamos mais do axios

export function LoginForm({
    className,
    ...props
}) {
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleCpfChange = (e) => {
        let value = e.target.value;
        value = value.replace(/\D/g, '');
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        if (value.length > 9) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/^(\d{3})(\d{3})$/, '$1.$2');
        } else if (value.length > 0) {
            value = value.replace(/^(\d{3})$/, '$1');
        }
        setCpf(value);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        const rawCpf = cpf.replace(/\D/g, '');

        try {
            const response = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cpf: rawCpf,
                    senha,
                }),
                credentials: "include", // ESSENCIAL para enviar e receber cookies com fetch
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.erro || "Erro desconhecido ao fazer login.");
                console.warn("Erro no login:", data);
                return;
            }



            const userRole = data.user.cargo;

            
                router.push(`/dashboard/${userRole}`) 

        } catch (err) {

            
            console.error("Erro de rede ou antes da requisição:", err);
            setError("Não foi possível conectar ao servidor. Verifique sua conexão.");
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Faça Login para entrar</CardTitle>
                    <CardDescription>
                        Insira seu cpf abaixo para entrar na sua conta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="CPF">CPF</Label>
                                <Input
                                    id="CPF"
                                    type="text"
                                    placeholder="EX: 123.456.789-10"
                                    required
                                    value={cpf}
                                    onChange={handleCpfChange}
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Senha</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Esqueceu sua Senha?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full cursor-pointer">
                                    Login
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}