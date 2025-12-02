"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiUrl } from "@/app/context/ApiContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Mail, FileText, MapPin, LockKeyhole, History, Loader2, Activity, UserPlus, LogIn, Edit, Trash, ChevronLeft, ChevronRight, User as UserIcon, ShieldCheck, KeyRound, Pencil } from 'lucide-react';
import { cn } from "@/lib/utils";

const formatCPF = (cpf) => {
    if (!cpf) return "Não informado";
    return String(cpf).replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatCEP = (cep) => {
    if (!cep) return "";
    return String(cep).replace(/\D/g, '').replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

const inputStyles = "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 text-sm";
const selectTriggerStyles = "h-11 rounded-xl bg-gray-50 border-gray-200 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all duration-200 text-sm";
const primaryButtonStyles = "h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 font-medium transition-all hover:-translate-y-0.5 active:translate-y-0";

function ProfileInfoItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-50 text-green-600 flex-shrink-0">
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
            </div>
        </div>
    );
}

function ActivityLogModal({ user, isOpen, onOpenChange }) {
    const apiUrl = useApiUrl();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;

    const fetchUserLogs = useCallback(async () => {
        if (!user || !apiUrl) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                usuario_id: user.id
            });

            const res = await fetch(`${apiUrl}/logs?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setLogs(data.data || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
        } finally {
            setLoading(false);
        }
    }, [user, apiUrl, page]);

    useEffect(() => {
        if (isOpen) {
            fetchUserLogs();
        }
    }, [isOpen, fetchUserLogs]);

    const getIcon = (acao) => {
        if (!acao) return <Activity className="h-4 w-4 text-gray-500" />;
        const key = acao.toUpperCase();
        if (key.includes('LOGIN')) return <LogIn className="h-4 w-4 text-blue-500" />;
        if (key.includes('CRIA') || key.includes('ADD')) return <UserPlus className="h-4 w-4 text-green-500" />;
        if (key.includes('EDI') || key.includes('UPD')) return <Edit className="h-4 w-4 text-orange-500" />;
        if (key.includes('DEL') || key.includes('EXCLU')) return <Trash className="h-4 w-4 text-red-500" />;
        return <Activity className="h-4 w-4 text-gray-500" />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl border-gray-100 shadow-2xl">
                <DialogHeader className="p-6 pb-4 bg-white border-b border-gray-50">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                        <div className="p-2 bg-blue-50 rounded-lg"><History className="h-5 w-5 text-blue-600" /></div>
                        Meu Histórico
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 pt-1">Registro completo das suas atividades na plataforma.</DialogDescription>
                </DialogHeader>

                <div className="p-0 overflow-hidden bg-gray-50/30">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="border-gray-100 hover:bg-transparent">
                                <TableHead className="w-[180px] pl-6 h-12 text-xs font-semibold text-gray-400 uppercase">Data</TableHead>
                                <TableHead className="w-[140px] h-12 text-xs font-semibold text-gray-400 uppercase">Ação</TableHead>
                                <TableHead className="h-12 text-xs font-semibold text-gray-400 uppercase">Detalhes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="h-32 text-center"><div className="flex justify-center items-center gap-2 text-gray-400"><Loader2 className="animate-spin h-5 w-5 text-green-600" /> Carregando...</div></TableCell></TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="h-32 text-center text-gray-400">Nenhuma atividade registrada.</TableCell></TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="border-gray-50 hover:bg-white hover:shadow-sm transition-all">
                                        <TableCell className="pl-6 text-xs font-mono text-gray-500 whitespace-nowrap">{formatDate(log.data_hora)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getIcon(log.acao)}
                                                <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                    {log.acao?.replace(/_/g, ' ')}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            <div className="whitespace-normal break-words max-w-[200px] sm:max-w-md line-clamp-2" title={log.detalhes}>
                                                {log.detalhes}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between p-4 bg-white border-t border-gray-50">
                    <span className="text-xs font-medium text-gray-500">Página {page} de {totalPages}</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-gray-200" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-gray-200" onClick={() => setPage(p => (p < totalPages ? p + 1 : p))} disabled={page >= totalPages || loading}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function EditProfileModal({ user, isOpen, onOpenChange, onProfileUpdate }) {
    const apiUrl = useApiUrl();
    const router = useRouter();
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
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const response = await fetch(`${apiUrl}/user/put`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
                body: JSON.stringify(data),
            });
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                router.push('/');
                throw new Error("Sessão expirada.");
            }
            const result = await response.json();
            if (!response.ok) throw new Error(result.mensagem);
            onProfileUpdate(data);
            onOpenChange(false);
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 gap-0 overflow-hidden border-gray-100 shadow-2xl">
                <DialogHeader className="p-6 pb-4 bg-white border-b border-gray-50">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                        <div className="p-2 bg-green-50 rounded-lg"><Pencil className="h-5 w-5 text-green-600" /></div>
                        Editar Perfil
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 pt-1">Atualize suas informações pessoais abaixo.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 bg-white">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Nome Completo</Label>
                            <Input name="nome" defaultValue={user.nome} className={inputStyles} required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Email</Label>
                            <Input name="email" type="email" defaultValue={user.email} className={inputStyles} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">CEP</Label>
                                <Input name="CEP" value={cepValue} onChange={(e) => setCepValue(formatCEP(e.target.value))} className={inputStyles} required />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Estado Civil</Label>
                                <Select name="estadoCivil" defaultValue={user.estadoCivil}>
                                    <SelectTrigger className={selectTriggerStyles}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="solteiro(a)">Solteiro(a)</SelectItem>
                                        <SelectItem value="casado(a)">Casado(a)</SelectItem>
                                        <SelectItem value="viuvo(a)">Viúvo(a)</SelectItem>
                                        <SelectItem value="divorciado(a)">Divorciado(a)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    {error && <div className="px-6 pb-2"><p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg text-center">{error}</p></div>}
                    <DialogFooter className="p-6 pt-2 bg-white border-t border-gray-50">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl text-gray-600 hover:bg-gray-50">Cancelar</Button>
                        <Button type="submit" disabled={isLoading} className={primaryButtonStyles}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ChangePasswordModal({ user, isOpen, onOpenChange }) {
    const apiUrl = useApiUrl();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true); setError(''); setSuccess('');
        const formData = new FormData(event.currentTarget);
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');
        if (newPassword !== confirmPassword) { setError("Senhas não coincidem."); setIsLoading(false); return; }
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const response = await fetch(`${apiUrl}/user/put`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
                body: JSON.stringify({ cpf: user.cpf, senha: newPassword }),
            });
            if (response.status === 401 || response.status === 403) { localStorage.removeItem('token'); router.push('/'); throw new Error("Sessão expirada."); }
            if (!response.ok) throw new Error((await response.json()).mensagem);
            setSuccess("Senha alterada com sucesso!");
            setTimeout(() => { onOpenChange(false); setSuccess(''); }, 1500);
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 gap-0 overflow-hidden border-gray-100 shadow-2xl">
                <DialogHeader className="p-6 pb-4 bg-white border-b border-gray-50">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                        <div className="p-2 bg-orange-50 rounded-lg"><LockKeyhole className="h-5 w-5 text-orange-600" /></div>
                        Alterar Senha
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 bg-white">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Nova Senha</Label>
                            <Input name="newPassword" type="password" required className={inputStyles} placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Confirmar Nova Senha</Label>
                            <Input name="confirmPassword" type="password" required className={inputStyles} placeholder="••••••••" />
                        </div>
                    </div>
                    {error && <div className="px-6 pb-2"><p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg text-center">{error}</p></div>}
                    {success && <div className="px-6 pb-2"><p className="text-green-600 text-sm bg-green-50 p-2 rounded-lg text-center font-medium">{success}</p></div>}
                    <DialogFooter className="p-6 pt-2 bg-white border-t border-gray-50">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl text-gray-600 hover:bg-gray-50">Cancelar</Button>
                        <Button type="submit" disabled={isLoading} className={primaryButtonStyles}>Confirmar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Perfil({ initialUser }) {
    const router = useRouter();
    const [user, setUser] = useState(initialUser);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

    const handleProfileUpdate = (updatedData) => {
        setUser(prevUser => ({ ...prevUser, ...updatedData }));
        router.refresh();
    };

    if (!user) {
        return (
            <Card className="rounded-xl border border-gray-100 shadow-sm animate-pulse m-6">
                <CardHeader>
                    <CardTitle className="text-gray-400">Carregando perfil...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <Card className="lg:col-span-1 rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden h-fit">
                    <div className="h-24 bg-gradient-to-r from-green-600 to-green-400"></div>
                    <div className="px-6 pb-6 relative">
                        <div className="flex flex-col items-center -mt-12 mb-4">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-md bg-white">
                                <AvatarFallback className="text-3xl font-bold bg-green-50 text-green-700">
                                    {user.nome ? user.nome.charAt(0).toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <h1 className="mt-3 text-xl font-bold text-gray-900 text-center">{user.nome}</h1>
                            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                {user.cargo ? user.cargo.charAt(0).toUpperCase() + user.cargo.slice(1) : "Usuário"}
                            </Badge>
                        </div>

                        <div className="space-y-1 mt-6">
                            <ProfileInfoItem icon={Mail} label="Email Corporativo" value={user.email} />
                            <ProfileInfoItem icon={FileText} label="CPF" value={formatCPF(user.cpf)} />
                            <ProfileInfoItem icon={UserIcon} label="Estado Civil" value={user.estadoCivil ? user.estadoCivil.charAt(0).toUpperCase() + user.estadoCivil.slice(1) : "Não informado"} />
                            <ProfileInfoItem icon={MapPin} label="CEP" value={formatCEP(user.CEP)} />
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <Button onClick={() => setIsEditModalOpen(true)} className={`w-full ${primaryButtonStyles} cursor-pointer`}>
                                Editar Informações
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className="lg:col-span-2 space-y-6">

                    <Card className="rounded-2xl border-gray-100 shadow-sm">
                        <CardHeader className="pb-3 border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                <CardTitle className="text-lg font-bold text-gray-900">Segurança & Atividades</CardTitle>
                            </div>
                            <CardDescription>Gerencie suas credenciais e monitore o acesso.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    variant="outline"
                                    className="h-24 flex flex-col items-center justify-center gap-2 border-dashed border-2 border-gray-200 hover:border-green-300 hover:bg-green-50/50 rounded-xl transition-all cursor-pointer"
                                >
                                    <div className="p-2 bg-orange-100 rounded-full text-orange-600"><KeyRound className="h-6 w-6" /></div>
                                    <span className="font-semibold text-gray-700">Alterar Senha</span>
                                </Button>

                                <Button
                                    onClick={() => setIsActivityModalOpen(true)}
                                    variant="outline"
                                    className="h-24 flex flex-col items-center justify-center gap-2 border-dashed border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl transition-all cursor-pointer"
                                >
                                    <div className="p-2 bg-blue-100 rounded-full text-blue-600"><History className="h-6 w-6" /></div>
                                    <span className="font-semibold text-gray-700">Histórico de Ações</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-gray-100 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-900">Sobre sua conta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="h-2 w-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">Status Ativo</h4>
                                    <p className="text-sm text-gray-500 mt-1">Sua conta está totalmente operacional e você tem acesso a todos os recursos permitidos para o cargo de <strong>{user.cargo}</strong>.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">Última Atualização</h4>
                                    <p className="text-sm text-gray-500 mt-1">Mantenha seus dados de contato sempre atualizados para receber notificações importantes do sistema EcoFlow.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>

            <EditProfileModal user={user} isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} onProfileUpdate={handleProfileUpdate} />
            <ChangePasswordModal user={user} isOpen={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen} />
            <ActivityLogModal user={user} isOpen={isActivityModalOpen} onOpenChange={setIsActivityModalOpen} />
        </div>
    );
}