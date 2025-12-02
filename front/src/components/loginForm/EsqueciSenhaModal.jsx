// =================================================================================
// Arquivo: src/components/loginForm/EsqueciSenhaModal.jsx
// =================================================================================

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiUrl } from "@/app/context/ApiContext";

// Função para formatar o CPF enquanto digita
const formatCPF = (cpf) => {
    if (!cpf) return "";
    const cleanCpf = cpf.replace(/\D/g, '').slice(0, 11);
    if (cleanCpf.length > 9) return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (cleanCpf.length > 6) return cleanCpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    if (cleanCpf.length > 3) return cleanCpf.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    return cleanCpf;
};

export function EsqueciSenhaModal({ isOpen, onOpenChange }) {
    const apiUrl = useApiUrl();
    const [step, setStep] = useState('cpf'); // 'cpf', 'codigo', 'senha'
    const [cpf, setCpf] = useState('');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const resetState = () => {
        setStep('cpf');
        setCpf('');
        setCodigo('');
        setNovaSenha('');
        setConfirmarSenha('');
        setIsLoading(false);
        setError('');
        setSuccess('');
    };

    const handleCpfSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${apiUrl}/recuperacao/enviar-codigo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cpf: cpf.replace(/\D/g, '') }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.mensagem);

            setSuccess(data.mensagem);
            setStep('codigo');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCodigoSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${apiUrl}/recuperacao/verificar-codigo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cpf: cpf.replace(/\D/g, ''), codigo }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.mensagem);

            setSuccess(data.mensagem);
            setStep('senha');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSenhaSubmit = async (e) => {
        e.preventDefault();
        if (novaSenha !== confirmarSenha) {
            setError("As senhas não coincidem.");
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${apiUrl}/recuperacao/redefinir-senha`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cpf: cpf.replace(/\D/g, ''), codigo, novaSenha }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.mensagem);

            setSuccess(data.mensagem);
            setTimeout(() => {
                onOpenChange(false); // Fecha o modal após sucesso
                resetState();
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleModalStateChange = (open) => {
        if (!open) {
            resetState();
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleModalStateChange}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Redefinir Senha</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {step === 'cpf' && "Informe seu CPF para enviarmos um código de recuperação."}
                        {step === 'codigo' && "Verifique seu e-mail e insira o código de 6 dígitos."}
                        {step === 'senha' && "Crie uma nova senha para sua conta."}
                    </DialogDescription>
                </DialogHeader>

                {error && <p className="text-sm text-center text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}
                {success && <p className="text-sm text-center text-primary bg-primary/10 p-2 rounded-md font-medium">{success}</p>}

                {step === 'cpf' && (
                    <form onSubmit={handleCpfSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cpf" className="text-right text-foreground">CPF</Label>
                            <Input 
                                id="cpf" 
                                value={cpf} 
                                onChange={(e) => setCpf(formatCPF(e.target.value))} 
                                className="col-span-3 bg-muted/50 border-input text-foreground" 
                                required 
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {isLoading ? "Enviando..." : "Enviar Código"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {step === 'codigo' && (
                    <form onSubmit={handleCodigoSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="codigo" className="text-right text-foreground">Código</Label>
                            <Input 
                                id="codigo" 
                                value={codigo} 
                                onChange={(e) => setCodigo(e.target.value)} 
                                className="col-span-3 bg-muted/50 border-input text-foreground" 
                                maxLength="6" 
                                required 
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {isLoading ? "Verificando..." : "Verificar Código"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {step === 'senha' && (
                    <form onSubmit={handleSenhaSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="novaSenha" className="text-foreground">Nova Senha</Label>
                            <Input 
                                id="novaSenha" 
                                type="password" 
                                value={novaSenha} 
                                onChange={(e) => setNovaSenha(e.target.value)} 
                                className="bg-muted/50 border-input text-foreground" 
                                required 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmarSenha" className="text-foreground">Confirmar Senha</Label>
                            <Input 
                                id="confirmarSenha" 
                                type="password" 
                                value={confirmarSenha} 
                                onChange={(e) => setConfirmarSenha(e.target.value)} 
                                className="bg-muted/50 border-input text-foreground" 
                                required 
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {isLoading ? "Salvando..." : "Redefinir Senha"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}