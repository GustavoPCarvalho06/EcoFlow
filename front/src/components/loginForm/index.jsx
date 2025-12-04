"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useApiUrl } from "@/app/context/ApiContext";
import { EsqueciSenhaModal } from "./EsqueciSenhaModal";

export function LoginForm({ className, ...props }) {
    const apiUrl = useApiUrl();
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

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

        if (!apiUrl) {
            setError("Conectando ao servidor...");
            return;
        }

        setError("");
        setIsLoading(true);
        const rawCpf = cpf.replace(/\D/g, "");

        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cpf: rawCpf, senha }),
                credentials: "include",
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.erro || data.mensagem || "Erro desconhecido");
                return;
            }
            if (data.user && data.user.token) {
                localStorage.setItem('token', data.user.token);
            }
            router.push(`/dashboard`);
        } catch (err) {
            setError("Não foi possível conectar ao servidor.");
        } finally {
            setIsLoading(false);
        }
    };


    const inputClasses = "pl-10 h-12 rounded-xl transition-all duration-200 placeholder:text-gray-400 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 " +
       
        "bg-white dark:bg-white text-gray-900 dark:text-gray-900 " +
       
        "focus:bg-gray-100 dark:focus:bg-gray-100 " +
       
        
        "[&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] " +
       
        "[&:-webkit-autofill]:focus:shadow-[inset_0_0_0px_1000px_#f3f4f6] " +
       
        "[&:-webkit-autofill]:-webkit-text-fill-color-[#111827]";

    return (
        <>
            <div className={cn("flex flex-col w-full max-w-[380px] mx-auto animate-in fade-in zoom-in duration-500", className)} {...props}>
                <div className="flex flex-col items-center text-center mb-8 space-y-2">
                    <div className="relative w-40 h-40 mb-2">
                        <Image
                            src="/imagen/Logo.png"
                            alt="EcoFlow logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">EcoFlow</h1>
                    <div className="pt-4">
                        <h2 className="text-2xl font-bold text-foreground">Bem-vindo(a)!</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Acesse sua conta para continuar</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="cpf" className="text-sm font-semibold text-foreground ml-1">CPF</Label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <Input
                                id="cpf"
                                type="text"
                                placeholder="000.000.000-00"
                                required
                                value={cpf}
                                onChange={handleCpfChange}
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-foreground ml-1">Senha</Label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className={`${inputClasses} pr-10`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors p-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                                Esqueceu sua senha?
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center font-medium animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 mt-2 cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2 ">
                                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                <span>Entrando...</span>
                            </div>
                        ) : "Entrar"}
                    </Button>
                </form>
            </div>

            <EsqueciSenhaModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
        </>
    );
}