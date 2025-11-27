// =================================================================================
// Arquivo: front/src/components/dashboard/LogsTable.jsx
// =================================================================================

"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiUrl } from "@/app/context/ApiContext";
import { Loader2, Activity, UserPlus, LogIn, Edit, Trash, Search, ChevronLeft, ChevronRight, CheckCircle, PowerOff, ListFilter } from "lucide-react";

export function LogsTable({ token }) {
    const apiUrl = useApiUrl();
    
    // Controle de hidratação
    const [isMounted, setIsMounted] = useState(false);

    // Estados
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtros e Paginação
    const [search, setSearch] = useState("");
    const [acaoFilter, setAcaoFilter] = useState("todos");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10); // <--- NOVO ESTADO: Limite por página
    
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
                limit: limit.toString(), // <--- USA O ESTADO DINÂMICO
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
                const listaLogs = data.data || []; 
                
                setLogs(listaLogs);
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

    // Debounce na busca (reseta página)
    useEffect(() => {
        if (isMounted) {
            const timer = setTimeout(() => {
                setPage(1); 
                fetchLogs();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [search, acaoFilter, isMounted]);

    // Troca de página ou limite (não reseta página se for só troca de página)
    // Se mudar o limite, o ideal é resetar a página no onChange do Select, não aqui, para evitar loops
    useEffect(() => {
        if (isMounted) {
            fetchLogs();
        }
    }, [page, limit, isMounted]); // <--- ADICIONADO LIMIT NAS DEPENDÊNCIAS

    const getIcon = (acao) => {
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
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }).format(date);
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
        <div className="space-y-4">
            
            {/* --- BARRA DE FILTROS --- */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-end xl:items-center bg-gray-50 p-4 rounded-lg border">
                
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    {/* Filtro de Texto */}
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
                                <SelectValue placeholder="Ação" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todas as Ações</SelectItem>
                                <SelectItem value="LOGIN">Login</SelectItem>
                                <SelectItem value="CRIAR">Criação</SelectItem>
                                <SelectItem value="EDITAR">Edição</SelectItem>
                                <SelectItem value="DELETAR">Exclusão</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* --- NOVO: Seletor de Limite por Página --- */}
                    <div className="w-full md:w-32 flex items-center gap-2">
                        <Select 
                            value={limit.toString()} 
                            onValueChange={(val) => {
                                setLimit(Number(val));
                                setPage(1); // Volta para a página 1 ao mudar o limite
                            }}
                        >
                            <SelectTrigger className="bg-white">
                                <ListFilter className="w-4 h-4 mr-2 text-muted-foreground" />
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
                
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    <strong>{totalRecords}</strong> registros encontrados
                </div>
            </div>

            {/* --- TABELA --- */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[160px]">Data</TableHead>
                            <TableHead>Quem fez (Autor)</TableHead>
                            <TableHead>Identificação</TableHead>
                            <TableHead>Ação</TableHead>
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
                                    Nenhum registro encontrado para os filtros aplicados.
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
                                                <span className="font-medium text-sm">
                                                    {log.nome_usuario || 'Sistema'}
                                                </span>
                                                {log.autor_status === 'desligado' && (
                                                    <span className="text-[10px] text-red-500 font-bold">(Desligado)</span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground capitalize">
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
                                            {getIcon(log.acao)}
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                                {log.acao ? log.acao.replace(/_/g, ' ') : ''}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600 break-words max-w-md">
                                        {log.detalhes}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* --- PAGINAÇÃO --- */}
            <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground pl-2">
                    Exibindo {logs.length} de {totalRecords}
                </span>
                
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(old => Math.max(old - 1, 1))}
                        disabled={page === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                    </Button>

                    <div className="flex items-center px-2 text-sm font-medium">
                        Página {page} de {totalPages}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(old => (old < totalPages ? old + 1 : old))}
                        disabled={page >= totalPages || loading}
                    >
                        Próximo
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}