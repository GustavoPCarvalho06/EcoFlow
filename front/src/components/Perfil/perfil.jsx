"use client"; // ESSENCIAL: Transforma este em um Componente Cliente

import { useState } from "react";
import { useRouter } from "next/navigation"; // Importamos o useRouter do Next.js
import { useApiUrl } from "@/app/context/ApiContext"; // Hook para obter a URL da API
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mail, User, FileText, MapPin, LockKeyhole, History, ShieldCheck, UserCog, Loader2 } from 'lucide-react';

// ===================================================================
// UTILITIES (Funções de Formatação)
// ===================================================================
const formatCPF = (cpf) => {
    if (!cpf) return "Não informado";
    return String(cpf).replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatCEP = (cep) => {
    if (!cep) return "";
    return String(cep).replace(/\D/g, '').replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

// ===================================================================
// SUBCOMPONENTES E MODAIS
// ===================================================================

function ProfileInfoItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-4">
            <Icon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
                <p className="text-base text-gray-800 break-words">{value}</p>
            </div>
        </div>
    );
}

// Modal para Editar o Perfil
function EditProfileModal({ user, isOpen, onOpenChange, onProfileUpdate }) {
    const apiUrl = useApiUrl();
    const router = useRouter(); // ADICIONADO: Para redirecionar se o token expirar
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [cepValue, setCepValue] = useState(formatCEP(user.CEP));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        const data = {
            cpf: user.cpf,
            nome: formData.get('nome'),
            email: formData.get('email'),
            estadoCivil: formData.get('estadoCivil'),
            CEP: cepValue.replace(/\D/g, ''),
        };

        try {
            // 1. Pega o token
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            // 2. Configura headers com Autorização
            const headers = { 
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            const response = await fetch(`${apiUrl}/user/put`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(data),
            });

            // 3. Verifica expiração de sessão
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                router.push('/');
                throw new Error("Sessão expirada. Faça login novamente.");
            }

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.mensagem || 'Falha ao atualizar perfil.');
            }
            
            onProfileUpdate(data); // Chama a função para atualizar a UI
            onOpenChange(false); // Fecha o modal com sucesso

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>Atualize suas informações pessoais. Clique em salvar quando terminar.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">Nome</Label>
                            <Input id="nome" name="nome" defaultValue={user.nome} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={user.email} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="CEP" className="text-right">CEP</Label>
                            <Input id="CEP" name="CEP" value={cepValue} onChange={(e) => setCepValue(formatCEP(e.target.value))} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="estadoCivil" className="text-right">Estado Civil</Label>
                            <Select name="estadoCivil" defaultValue={user.estadoCivil}>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solteiro(a)">Solteiro(a)</SelectItem>
                                    <SelectItem value="casado(a)">Casado(a)</SelectItem>
                                    <SelectItem value="viuvo(a)">Viúvo(a)</SelectItem>
                                    <SelectItem value="divorciado(a)">Divorciado(a)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Modal para Alterar a Senha
function ChangePasswordModal({ user, isOpen, onOpenChange }) {
    const apiUrl = useApiUrl();
    const router = useRouter(); // ADICIONADO
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(event.currentTarget);
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem.");
            setIsLoading(false);
            return;
        }

        const data = {
            cpf: user.cpf,
            senha: newPassword,
        };

        try {
            // 1. Pega o token
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            // 2. Configura headers
            const headers = { 
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            const response = await fetch(`${apiUrl}/user/put`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(data),
            });

            // 3. Verifica sessão
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                router.push('/');
                throw new Error("Sessão expirada. Faça login novamente.");
            }

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.mensagem || 'Falha ao alterar a senha.');
            }
            
            setSuccess("Senha alterada com sucesso!");
            setTimeout(() => {
                onOpenChange(false);
                setSuccess('');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Alterar Senha</DialogTitle>
                    <DialogDescription>Crie uma nova senha para sua conta. Recomendamos uma senha forte.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">Nova Senha</Label>
                            <Input id="newPassword" name="newPassword" type="password" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Nova Senha
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ===================================================================
// COMPONENTE PRINCIPAL (Orquestrador)
// ===================================================================
export default function Perfil({ initialUser }) {
    const router = useRouter(); // Hook para navegação
    const [user, setUser] = useState(initialUser);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // FUNÇÃO DE ATUALIZAÇÃO INSTANTÂNEA
    const handleProfileUpdate = (updatedData) => {
        // 1. ATUALIZA O ESTADO LOCAL DO USUÁRIO COM OS NOVOS DADOS
        setUser(prevUser => ({ ...prevUser, ...updatedData }));
        
        // 2. [IMPORTANTE] RECARREGA OS DADOS DO SERVIDOR
        router.refresh(); 
    };

    if (!user) {
        return <div className="flex justify-center items-center h-full p-4 bg-gray-50"><p className="text-xl text-gray-600">Usuário não encontrado.</p></div>;
    }

    return (
        <>
            <div className="w-full h-full p-4 sm:p-6 md:p-8 bg-gray-100 overflow-y-auto shadow-[inset_0_4px_8px_-4px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                    
                    <div className="lg:w-2/5 xl:w-1/3">
                        <div className="w-full bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="h-28 w-28 mb-4 border-4 border-gray-100">
                                    <AvatarFallback className="text-5xl rounded-full bg-gray-200 text-gray-700 font-light">
                                        {user.nome ? user.nome.charAt(0).toUpperCase() : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <h1 className="text-2xl font-bold text-gray-900">{user.nome}</h1>
                            </div>
                            <div className="my-6 border-t border-gray-200"></div>
                            <div className="space-y-5 flex-grow">
                                <ProfileInfoItem icon={Mail} label="Email" value={user.email} />
                                <ProfileInfoItem icon={FileText} label="CPF" value={formatCPF(user.cpf)} />
                                <ProfileInfoItem icon={User} label="Estado Civil" value={user.estadoCivil ? user.estadoCivil.charAt(0).toUpperCase() + user.estadoCivil.slice(1) : "Não informado"} />
                                <ProfileInfoItem icon={MapPin} label="CEP" value={formatCEP(user.CEP)} />
                            </div>
                            <div className="mt-8">
                                <Button onClick={() => setIsEditModalOpen(true)} className="w-full py-3 h-auto bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                                    Editar Perfil
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-3/5 xl:w-2/3 flex flex-col gap-8 lg:mt-16">
                        <div className="w-full bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Segurança da Conta</h2>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button onClick={() => setIsPasswordModalOpen(true)} variant="outline" className="flex-1 justify-center gap-2">
                                    <LockKeyhole className="h-5 w-5" /> Alterar Senha
                                </Button>
                                <Button variant="outline" className="flex-1 justify-center gap-2" disabled>
                                    <History className="h-5 w-5" /> Ver Atividade
                                </Button>
                            </div>
                        </div>
                        <div className="w-full bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Histórico de Atividades</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4">
                                    <ShieldCheck className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-700">Senha alterada com sucesso.</p>
                                        <p className="text-xs text-gray-400 mt-1">Ontem</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <UserCog className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-700">Informações de perfil foram atualizadas.</p>
                                        <p className="text-xs text-gray-400 mt-1">3 dias atrás</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <EditProfileModal user={user} isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} onProfileUpdate={handleProfileUpdate} />
            <ChangePasswordModal user={user} isOpen={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen} />
        </>
    );
}