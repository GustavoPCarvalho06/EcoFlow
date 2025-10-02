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
import axios from "axios"; // Importe o axios

export function LoginForm({
    className,
    ...props
}) {
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState(""); // Estado para a senha
    const [error, setError] = useState(""); // Estado para mensagens de erro
    const router = useRouter(); // Inicialize o router

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
        e.preventDefault(); // Previne o comportamento padrão do formulário
        setError(""); // Limpa erros anteriores

        // Remove a formatação do CPF antes de enviar para o backend
        const rawCpf = cpf.replace(/\D/g, '');

        try {
            const response = await axios.post("http://localhost:3001/login", {
                cpf: rawCpf,
                senha
            }, {
                withCredentials: true // Muito importante para enviar e receber cookies
            });

            if (response.status === 200) {
                // Se o login for bem-sucedido, o token estará no cookie httpOnly.
                // Não precisamos acessá-lo aqui.
                router.push("/dashboard"); // Redireciona para o dashboard
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.erro) {
                setError(err.response.data.erro);
            } else {
                setError("Erro ao fazer login. Tente novamente.");
            }
            console.error("Erro no login:", err);
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
                    <form onSubmit={handleLogin}> {/* Adicione onSubmit */}
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
                                    value={senha} // Use o estado para a senha
                                    onChange={(e) => setSenha(e.target.value)} // Atualiza o estado da senha
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>} {/* Exibe erros */}
                            <div className="flex flex-col gap-3">
                                {/* O Link aqui não é mais necessário para o login */}
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