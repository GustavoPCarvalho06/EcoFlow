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
import { Mail, User, FileText, MapPin, LockKeyhole, History, UserCog, Loader2, Activity, UserPlus, LogIn, Edit, Trash, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// ... (Funções formatCPF e formatCEP mantidas iguais) ...
const formatCPF = (cpf) => {
    if (!cpf) return "Não informado";
    return String(cpf).replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatCEP = (cep) => {
    if (!cep) return "";
    return String(cep).replace(/\D/g, '').replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

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

// --- NOVO COMPONENTE: Modal de Histórico Pessoal ---
function ActivityLogModal({ user, isOpen, onOpenChange }) {
    const apiUrl = useApiUrl();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5; // Menos itens por página para caber bem no modal

    const fetchUserLogs = useCallback(async () => {
        if (!user || !apiUrl) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Aqui passamos o usuario_id para filtrar apenas os meus logs
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
            console.error("Erro ao buscar histórico pessoal:", error);
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
        if (key.includes('EDI') || key.includes('UPD') || key.includes('FUNCAO')) return <Edit className="h-4 w-4 text-orange-500" />;
        if (key.includes('DEL') || key.includes('EXCLU')) return <Trash className="h-4 w-4 text-red-500" />;
        return <Activity className="h-4 w-4 text-gray-500" />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {/* max-w-4xl deixa o modal largo, similar ao histórico */}
            <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Meu Histórico de Atividades</DialogTitle>
                    <DialogDescription>Ações realizadas por você no sistema.</DialogDescription>
                </DialogHeader>

                <div className="rounded-md border mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[140px]">Data</TableHead>
                                <TableHead className="w-[120px]">Ação</TableHead>
                                <TableHead>Detalhes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-green-600" /></TableCell></TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Nenhuma atividade registrada.</TableCell></TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                                            {formatDate(log.data_hora)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getIcon(log.acao)}
                                                <Badge variant="outline" className="text-[10px] whitespace-nowrap px-1">
                                                    {log.acao?.replace(/_/g, ' ')}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            <div className="whitespace-normal break-words max-w-[200px] sm:max-w-md">
                                                {log.detalhes}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-muted-foreground">Página {page} de {totalPages}</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => (p < totalPages ? p + 1 : p))} disabled={page >= totalPages || loading}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ... (Mantenha os componentes EditProfileModal e ChangePasswordModal IGUAIS ao código anterior) ...
// Para economizar caracteres na resposta, vou assumir que você manteve eles.
// Se precisar deles novamente, me avise que eu mando tudo junto.
// Vou colocar aqui apenas o EditProfileModal e ChangePasswordModal MINIMIZADOS para contexto
function EditProfileModal({ user, isOpen, onOpenChange, onProfileUpdate }) {
    // ... (Código do EditProfileModal que te mandei antes) ...
    // Se não tiver, copie do código anterior da resposta "Perfil"
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
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader><DialogTitle>Editar Perfil</DialogTitle><DialogDescription>Atualize suas informações.</DialogDescription></DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Nome</Label><Input name="nome" defaultValue={user.nome} className="col-span-3" required /></div>
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Email</Label><Input name="email" type="email" defaultValue={user.email} className="col-span-3" required /></div>
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">CEP</Label><Input name="CEP" value={cepValue} onChange={(e)=>setCepValue(formatCEP(e.target.value))} className="col-span-3" required /></div>
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Estado Civil</Label>
                            <Select name="estadoCivil" defaultValue={user.estadoCivil}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="solteiro(a)">Solteiro(a)</SelectItem><SelectItem value="casado(a)">Casado(a)</SelectItem><SelectItem value="viuvo(a)">Viúvo(a)</SelectItem><SelectItem value="divorciado(a)">Divorciado(a)</SelectItem></SelectContent></Select>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Salvar</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ChangePasswordModal({ user, isOpen, onOpenChange }) {
    // ... (Código do ChangePasswordModal) ...
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
            setSuccess("Senha alterada!"); setTimeout(() => { onOpenChange(false); setSuccess(''); }, 2000);
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Alterar Senha</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4"><div className="grid gap-2"><Label>Nova Senha</Label><Input name="newPassword" type="password" required /></div><div className="grid gap-2"><Label>Confirmar</Label><Input name="confirmPassword" type="password" required /></div></div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {success && <p className="text-green-500 text-sm text-center">{success}</p>}
                    <DialogFooter><DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose><Button type="submit" disabled={isLoading}>Salvar</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


// --- COMPONENTE PRINCIPAL ---
export default function Perfil({ initialUser }) {
    const router = useRouter();
    const [user, setUser] = useState(initialUser);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    // [NOVO] Estado para o modal de atividades
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

    const handleProfileUpdate = (updatedData) => {
        setUser(prevUser => ({ ...prevUser, ...updatedData }));
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
                                {/* [MODIFICADO] Botão agora abre o modal de atividades */}
                                <Button onClick={() => setIsActivityModalOpen(true)} variant="outline" className="flex-1 justify-center gap-2">
                                    <History className="h-5 w-5" /> Ver Atividade
                                </Button>
                            </div>
                        </div>
                        
                        {/* Seção estática removida ou simplificada, já que agora temos o modal real */}
                        <div className="w-full bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Resumo Recente</h2>
                            <p className="text-sm text-gray-500 mb-4">Clique em "Ver Atividade" acima para ver todo o histórico.</p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4">
                                    <UserCog className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-700">Edição de Perfil</p>
                                        <p className="text-xs text-gray-400 mt-1">Ações de edição de perfil são registradas.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <EditProfileModal user={user} isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} onProfileUpdate={handleProfileUpdate} />
            <ChangePasswordModal user={user} isOpen={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen} />
            
            {/* [NOVO] Renderiza o modal de atividades */}
            <ActivityLogModal user={user} isOpen={isActivityModalOpen} onOpenChange={setIsActivityModalOpen} />
        </>
    );
}