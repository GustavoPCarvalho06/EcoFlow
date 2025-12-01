"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiUrl } from "@/app/context/ApiContext";
import { 
    Loader2, 
    Activity, 
    UserPlus, 
    LogIn, 
    Edit, 
    Trash, 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    CheckCircle, 
    Cpu 
} from "lucide-react";

export function LogsTable({ token }) {
    const apiUrl = useApiUrl();
    
    // Controle de hidratação
    const [isMounted, setIsMounted] = useState(false);

    // Estados de dados
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados de filtros
    const [search, setSearch] = useState("");
    const [acaoFilter, setAcaoFilter] = useState("todos");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    
    // Estados de paginação
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchLogs = async () => {
        if (!apiUrl || !token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: search,
                acao: acaoFilter
            });

            const res = await fetch(`${apiUrl}/logs?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (res.ok) {
                const data = await res.json();
                setLogs(data.data || []);
                setTotalPages(data.totalPages || 1);
                setTotalRecords(data.total || 0);
            } else {
                setLogs([]); 
            }
        } catch (error) {
            console.error("Erro ao buscar logs:", error);
            setLogs([]); 
        } finally {
            setLoading(false);
        }
    };

    // Debounce na busca
    useEffect(() => {
        if (isMounted) {
            const timer = setTimeout(() => {
                setPage(1); 
                fetchLogs();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [search, acaoFilter, isMounted]);

    // Atualiza ao mudar página ou limite
    useEffect(() => {
        if (isMounted) {
            fetchLogs();
        }
    }, [page, limit, isMounted]);

    const getIcon = (acao, cargo) => {
        if (cargo === 'IoT') return <Cpu className="h-4 w-4 text-purple-600" />;

        if (!acao) return <Activity className="h-4 w-4 text-gray-500" />;
        const key = acao.toUpperCase();
        
        if (key.includes('LOGIN')) return <LogIn className="h-4 w-4 text-blue-500" />;
        if (key.includes('CRIA') || key.includes('ADD')) return <UserPlus className="h-4 w-4 text-green-500" />;
        if (key.includes('EDI') || key.includes('UPD') || key.includes('FUNCAO')) return <Edit className="h-4 w-4 text-orange-500" />;
        if (key.includes('DEL') || key.includes('REM') || key.includes('EXCLU') || key.includes('DESLIG')) return <Trash className="h-4 w-4 text-red-500" />;
        if (key.includes('ATIV')) return <CheckCircle className="h-4 w-4 text-emerald-500" />;
        
        return <Activity className="h-4 w-4 text-gray-500" />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{date.toLocaleDateString('pt-BR')}</span>
                    <span className="text-[10px] text-gray-400">
                        {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            );
        } catch (e) {
            return dateString;
        }
    };

    const formatCPF = (cpf) => {
        if (!cpf) return "";
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    if (!isMounted) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>;
    }

    return (
        <div className="space-y-4 w-full">
            
            {/* --- BARRA DE FILTROS --- */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-end xl:items-center bg-gray-50 p-4 rounded-lg border">
                
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    {/* Busca */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar (Nome, CPF, Email)..." 
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filtro de Ação */}
                    <div className="w-full md:w-48">
                        <Select value={acaoFilter} onValueChange={setAcaoFilter}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Filtrar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Padrão</SelectItem>
                                <SelectItem value="IOT">Sensores</SelectItem>
                                <SelectItem value="LOGIN">Login</SelectItem>
                                <SelectItem value="CRIAR">Criação</SelectItem>
                                <SelectItem value="EDITAR">Edição</SelectItem>
                                <SelectItem value="DELETAR">Exclusão</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Limite */}
                    <div className="w-full md:w-32 flex items-center gap-2">
                        <Select 
                            value={limit.toString()} 
                            onValueChange={(val) => {
                                setLimit(Number(val));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Qtd" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 itens</SelectItem>
                                <SelectItem value="10">10 itens</SelectItem>
                                <SelectItem value="20">20 itens</SelectItem>
                                <SelectItem value="50">50 itens</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
                    <strong>{totalRecords}</strong> registros encontrados
                </div>
            </div>

            {/* --- TABELA RESPONSIVA (CORRIGIDA) --- */}
            <div className="rounded-md border bg-white">
                {/* 
                    AQUI ESTÁ A CORREÇÃO:
                    1. 'max-w-[85vw]' limita a largura no celular para caber na tela.
                    2. 'overflow-x-auto' ativa a barra de rolagem quando o conteúdo ultrapassa.
                    3. 'md:max-w-full' remove o limite no desktop.
                */}
                <div className="w-full overflow-x-auto max-w-[85vw] md:max-w-full mx-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[140px]">Data</TableHead>
                                <TableHead className="w-[180px]">Usuário</TableHead>
                                <TableHead className="w-[150px]">Identificação</TableHead>
                                <TableHead className="w-[140px]">Ação</TableHead>
                                <TableHead>Detalhes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin h-6 w-6 text-green-600" />
                                            <span>Carregando histórico...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (!logs || logs.length === 0) ? ( 
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        Nenhum registro encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDate(log.data_hora)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium text-sm truncate max-w-[150px]" title={log.nome_usuario}>
                                                        {log.nome_usuario || 'Sistema'}
                                                    </span>
                                                    {log.autor_status === 'desligado' && (
                                                        <span className="text-[10px] text-red-500 font-bold">(Desligado)</span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground capitalize font-bold">
                                                    {log.cargo_usuario || '-'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs text-muted-foreground">
                                                {log.autor_cpf && <span>CPF: {formatCPF(log.autor_cpf)}</span>}
                                                {log.autor_email && <span className="truncate max-w-[150px]" title={log.autor_email}>{log.autor_email}</span>}
                                                {!log.autor_cpf && !log.autor_email && <span>-</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getIcon(log.acao, log.cargo_usuario)}
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 whitespace-nowrap">
                                                    {log.acao ? log.acao.replace(/_/g, ' ') : ''}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        
                                        {/* Limite de texto na descrição */}
                                        <TableCell className="align-middle">
                                            <div className="text-sm text-gray-600 truncate max-w-[200px] md:max-w-[350px] lg:max-w-[500px]" title={log.detalhes}>
                                                {log.detalhes}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* --- PAGINAÇÃO --- */}
            <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground pl-2 hidden sm:inline-block">
                    Exibindo {logs.length} de {totalRecords}
                </span>
                <span className="text-xs text-muted-foreground pl-2 sm:hidden">
                    Total: {totalRecords}
                </span>
                
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(old => Math.max(old - 1, 1))}
                        disabled={page === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Anterior</span>
                    </Button>

                    <div className="flex items-center px-2 text-sm font-medium">
                        <span className="sm:hidden">{page}/{totalPages}</span>
                        <span className="hidden sm:inline">Página {page} de {totalPages}</span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(old => (old < totalPages ? old + 1 : old))}
                        disabled={page >= totalPages || loading}
                    >
                        <span className="hidden sm:inline mr-1">Próximo</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}