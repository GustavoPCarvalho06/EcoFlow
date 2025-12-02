// =================================================================================
// Arquivo: src/components/dashboard/UserManagementTable.jsx
// =================================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; 
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Pencil, Search, PowerOff, Power, ChevronLeft, ChevronRight } from "lucide-react";
import { useApiUrl } from "@/app/context/ApiContext";
import { cn } from "@/lib/utils";

// --- Funções auxiliares ---
const formatCPF = (cpf) => {
  if (!cpf) return "";
  const cleanCpf = cpf.replace(/\D/g, '').slice(0, 11);
  if (cleanCpf.length > 9) {
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleanCpf.length > 6) {
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (cleanCpf.length > 3) {
    return cleanCpf.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }
  return cleanCpf;
};

const formatCEP = (cep) => {
    if (!cep) return "";
    const cleanCep = cep.replace(/\D/g, '').slice(0, 8);
    if (cleanCep.length > 5) {
        return cleanCep.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }
    return cleanCep;
};

export function UserManagementTable() {
  const apiUrl = useApiUrl();
  const router = useRouter(); 

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [cargoFilter, setCargoFilter] = useState("todos");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isReactivateAlertOpen, setIsReactivateAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  
  const [createCpf, setCreateCpf] = useState("");
  const [createCep, setCreateCep] = useState("");
  const [editCep, setEditCep] = useState("");

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // --- 1. FUNÇÃO DE FETCH AUTENTICADO ---
  const authFetch = useCallback(async (url, options = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401 || response.status === 403) {
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        router.push('/'); 
        throw new Error("SESSION_EXPIRED");
    }

    return response;
  }, [router]);

  // --- 2. BUSCAR USUÁRIOS ---
  const fetchUsers = useCallback(async () => {
    if (!apiUrl) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search: searchQuery,
        statusConta: statusFilter,
        cargo: cargoFilter,
      });
      
      const response = await authFetch(`${apiUrl}/user/paginated?${params.toString()}`);
      
      if (!response.ok) throw new Error('Falha ao buscar dados dos usuários');
      
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotalUsers(data.total);
    } catch (error) {
      if (error.message !== "SESSION_EXPIRED") {
          console.error("Erro ao buscar usuários:", error);
          setError("Não foi possível carregar os usuários.");
          setUsers([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter, cargoFilter, apiUrl, authFetch]);

  useEffect(() => {
    const debounceTimeout = searchQuery ? 500 : 0; 
    const handler = setTimeout(() => {
      fetchUsers();
    }, debounceTimeout);
    return () => clearTimeout(handler);
  }, [fetchUsers]);

  const forceRefresh = () => fetchUsers();

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setEditCep(formatCEP(user.CEP)); 
    setError("");
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteAlert = (user) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };
  
  const handleOpenReactivateAlert = (user) => {
    setSelectedUser(user);
    setIsReactivateAlertOpen(true);
  };

  const handleCpfInputChange = (e) => {
    setCreateCpf(formatCPF(e.target.value));
  };
  
  const handleCepInputChange = (e) => {
    setCreateCep(formatCEP(e.target.value));
  };
  
  const handleEditCepInputChange = (e) => {
    setEditCep(formatCEP(e.target.value));
  };

  // --- 3. CHAMADAS DE API GENÉRICAS (PUT/DELETE) ---
  const handleApiCall = async (endpoint, method, body, successCallback) => {
    if (!apiUrl) {
      setError("Conexão com o servidor não estabelecida. Tente novamente.");
      return;
    }

    try {
      setError("");
      const response = await authFetch(`${apiUrl}/user/${endpoint}`, {
        method,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensagem || 'Ocorreu um erro');
      }
      successCallback();
    } catch (err) {
      if (err.message !== "SESSION_EXPIRED") {
        setError(err.message);
      }
    }
  };

  // --- 4. CRIAR USUÁRIO (POST) ---
  const handleCreateUser = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    data.cpf = data.cpf.replace(/\D/g, '');
    data.CEP = data.CEP.replace(/\D/g, '');

    try {
      setError(""); 
      const response = await authFetch(`${apiUrl}/user/post`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json(); 

      if (!response.ok) {
        throw new Error(responseData.mensagem || 'Ocorreu um erro');
      }

      setIsCreateModalOpen(false); 
      setCreateCpf("");            
      setCreateCep("");
      setIsSuccessModalOpen(true); 
      forceRefresh();              

    } catch (err) {
      if (err.message !== "SESSION_EXPIRED") {
        setError(err.message);
      }
    }
  };
  
  const handleUpdateUser = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data = {
        cpf: selectedUser.cpf,
        nome: formData.get('nome'),
        email: formData.get('email'),
        cargo: formData.get('cargo'),
        senha: formData.get('senha'),
        sexo: formData.get('sexo'), 
        estadoCivil: formData.get('estadoCivil'), 
        CEP: formData.get('CEP').replace(/\D/g, ''), 
    };

    if (!data.senha) {
        delete data.senha;
    }

    await handleApiCall('put', 'PUT', data, () => {
      setIsEditModalOpen(false);
      forceRefresh();
    });
  };

  const updateUserStatus = async (user, newStatus) => {
    const updatedData = { cpf: user.cpf, statusConta: newStatus };
    await handleApiCall('put', 'PUT', updatedData, forceRefresh);
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedUser) return;
    await updateUserStatus(selectedUser, 'desligado');
    setIsDeleteAlertOpen(false);
  };
  
  const handleConfirmReactivate = async () => {
    if (!selectedUser) return;
    await updateUserStatus(selectedUser, 'ativo');
    setIsReactivateAlertOpen(false);
  };
  
  // Estilos corrigidos para usar variáveis do tema
  const inputStyles = "h-11 rounded-xl bg-muted/50 border-input focus:bg-background focus:border-primary focus:ring-primary/20 transition-all duration-200 text-foreground";
  const selectTriggerStyles = "h-11 rounded-xl bg-muted/50 border-input focus:ring-primary/20 text-foreground";

  if (!apiUrl) {
    return (
      <Card className="rounded-xl border shadow-sm bg-card">
        <CardHeader>
            <CardTitle className="text-foreground">Conectando ao servidor...</CardTitle>
            <CardDescription className="text-muted-foreground">Aguarde enquanto a conexão é estabelecida.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-xl border shadow-sm overflow-hidden bg-card">
        <CardHeader className="border-b border-border p-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground tracking-tight">Gerenciamento de Usuários</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">Visualize, filtre, crie e gerencie todos os usuários do sistema.</CardDescription>
            </div>
            <Button 
                onClick={() => { setError(""); setCreateCpf(""); setCreateCep(""); setIsCreateModalOpen(true); }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-5 h-11 transition-all duration-200 cursor-pointer"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="font-semibold">Criar Novo Usuário</span>
            </Button>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                  type="search" 
                  placeholder="Pesquisar por nome ou CPF..." 
                  className="w-full pl-10 h-11 rounded-xl bg-muted/50 border-input focus:bg-background focus:border-primary focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
                  value={searchQuery} 
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex w-full md:w-auto gap-3">
                <Select value={cargoFilter} onValueChange={(value) => { setCargoFilter(value); setPage(1); }}>
                <SelectTrigger className="w-full md:w-[180px] h-11 rounded-xl bg-muted/50 border-input focus:ring-primary/20 cursor-pointer text-foreground">
                    <SelectValue placeholder="Filtrar por Cargo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos os Cargos</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="coletor">Coletor</SelectItem>
                </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger className="w-full md:w-[180px] h-11 rounded-xl bg-muted/50 border-input focus:ring-primary/20 cursor-pointer text-foreground">
                    <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="desligado">Desligado</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="pl-6 h-12 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</TableHead>
                <TableHead className="hidden md:table-cell h-12 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CPF</TableHead>
                <TableHead className="h-12 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cargo</TableHead>
                <TableHead className="h-12 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="pr-6 h-12 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? ( 
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                             <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                             Carregando dados...
                        </div>
                    </TableCell>
                </TableRow> 
              ) : users.length > 0 ? ( 
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50 border-border transition-colors duration-200">
                    <TableCell className="pl-6 font-medium text-foreground py-4">{user.nome}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground py-4">{formatCPF(user.cpf)}</TableCell>
                    <TableCell className="text-muted-foreground py-4">
                        {user.cargo ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-foreground">
                                {user.cargo.charAt(0).toUpperCase() + user.cargo.slice(1)}
                            </span>
                        ) : '-'}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={cn("shadow-none border-0 font-semibold", 
                        user.statusConta === 'ativo' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-destructive/10 text-destructive hover:bg-destructive/20')}>
                        {user.statusConta === 'ativo' ? 'Ativo' : 'Desligado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 mr-1 transition-colors cursor-pointer" onClick={() => handleOpenEditModal(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {user.statusConta === 'ativo' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => handleOpenDeleteAlert(user)}>
                            <PowerOff className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors cursor-pointer" onClick={() => handleOpenReactivateAlert(user)}>
                            <Power className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : ( 
                <TableRow><TableCell colSpan={5} className="text-center h-32 text-muted-foreground">Nenhum usuário encontrado.</TableCell></TableRow> 
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-border bg-muted/20 p-4">
          <div className="text-sm text-muted-foreground">Total de <span className="font-semibold text-foreground">{totalUsers}</span> usuário(s).</div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="rows-per-page" className="text-sm text-muted-foreground">Linhas:</Label>
              <Select value={limit.toString()} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
                <SelectTrigger id="rows-per-page" className="w-[70px] h-9 rounded-lg bg-background border-border text-xs text-foreground"><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="5">5</SelectItem><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="text-sm font-medium text-foreground">Página {page} de {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border bg-background hover:bg-muted hover:text-primary text-foreground" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || isLoading}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border bg-background hover:bg-muted hover:text-primary text-foreground" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || isLoading}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden gap-0 bg-card border-border">
          <DialogHeader className="p-6 pb-2 bg-card">
            <DialogTitle className="text-xl font-bold text-foreground cursor-pointer">Criar Novo Usuário</DialogTitle>
            <DialogDescription className="text-muted-foreground">Preencha os dados abaixo para criar uma nova conta.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="p-6 pt-2 space-y-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nome" className="text-right text-foreground font-medium">Nome</Label><Input id="nome" name="nome" required className={`col-span-3 ${inputStyles}`} maxLength="100" /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="cpf" className="text-right text-foreground font-medium">CPF</Label><Input id="cpf" name="cpf" required className={`col-span-3 ${inputStyles}`} value={createCpf} onChange={handleCpfInputChange} maxLength="14" placeholder="000.000.000-00" inputMode="numeric" pattern="[0-9.-]*"/></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right text-foreground font-medium">Email</Label><Input id="email" name="email" type="email" required className={`col-span-3 ${inputStyles}`} placeholder="exemplo@email.com"/></div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="CEP" className="text-right text-foreground font-medium">CEP</Label>
                <Input id="CEP" name="CEP" required className={`col-span-3 ${inputStyles}`} value={createCep} onChange={handleCepInputChange} maxLength="9" placeholder="00000-000" inputMode="numeric" pattern="[0-9-]*" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="sexo" className="text-right text-foreground font-medium">Sexo</Label><Select name="sexo" required><SelectTrigger className={`col-span-3 ${selectTriggerStyles}`}><SelectValue placeholder="Selecione o sexo" /></SelectTrigger><SelectContent><SelectItem value="masculino">Masculino</SelectItem><SelectItem value="feminino">Feminino</SelectItem><SelectItem value="outros">Outro</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="estadoCivil" className="text-right text-foreground font-medium">Estado Civil</Label><Select name="estadoCivil" required><SelectTrigger className={`col-span-3 ${selectTriggerStyles}`}><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="solteiro(a)">Solteiro(a)</SelectItem><SelectItem value="casado(a)">Casado(a)</SelectItem><SelectItem value="viuvo(a)">Viúvo(a)</SelectItem><SelectItem value="divorciado(a)">Divorciado(a)</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="senha" className="text-right text-foreground font-medium">Senha</Label><Input id="senha" name="senha" type="password" required className={`col-span-3 ${inputStyles}`} /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="cargo" className="text-right text-foreground font-medium">Cargo</Label><Select name="cargo" required><SelectTrigger className={`col-span-3 ${selectTriggerStyles}`}><SelectValue placeholder="Selecione um cargo" /></SelectTrigger><SelectContent><SelectItem value="administrador">Administrador</SelectItem><SelectItem value="coordenador">Coordenador</SelectItem><SelectItem value="coletor">Coletor</SelectItem></SelectContent></Select></div>
            </div>
            {error && <p className="text-destructive text-sm text-center px-6 pb-2">{error}</p>}
            <DialogFooter className="p-6 pt-0 bg-card">
                <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="h-11 rounded-xl hover:bg-muted text-muted-foreground">Cancelar</Button>
                <Button type="submit" className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">Salvar Usuário</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden gap-0 bg-card border-border">
          <DialogHeader className="p-6 pb-2 bg-card">
            <DialogTitle className="text-xl font-bold text-foreground">Editar Usuário</DialogTitle>
            <DialogDescription className="text-muted-foreground">Altere os dados do usuário. Deixe a senha em branco para não alterá-la.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleUpdateUser}>
              <div className="p-6 pt-2 space-y-4">
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-nome" className="text-right text-foreground font-medium">Nome</Label><Input id="edit-nome" name="nome" defaultValue={selectedUser.nome} className={`col-span-3 ${inputStyles}`} maxLength="100" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-email" className="text-right text-foreground font-medium">Email</Label><Input id="edit-email" name="email" type="email" defaultValue={selectedUser.email} required className={`col-span-3 ${inputStyles}`} placeholder="exemplo@email.com"/></div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-CEP" className="text-right text-foreground font-medium">CEP</Label>
                  <Input id="edit-CEP" name="CEP" value={editCep} onChange={handleEditCepInputChange} required className={`col-span-3 ${inputStyles}`} maxLength="9" placeholder="00000-000" inputMode="numeric" pattern="[0-9-]*"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-sexo" className="text-right text-foreground font-medium">Sexo</Label><Select name="sexo" defaultValue={selectedUser.sexo}><SelectTrigger className={`col-span-3 ${selectTriggerStyles}`}><SelectValue placeholder="Selecione o sexo" /></SelectTrigger><SelectContent><SelectItem value="masculino">Masculino</SelectItem><SelectItem value="feminino">Feminino</SelectItem><SelectItem value="outros">Outro</SelectItem></SelectContent></Select></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-estadoCivil" className="text-right text-foreground font-medium">Estado Civil</Label><Select name="estadoCivil" defaultValue={selectedUser.estadoCivil}><SelectTrigger className={`col-span-3 ${selectTriggerStyles}`}><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="solteiro(a)">Solteiro(a)</SelectItem><SelectItem value="casado(a)">Casado(a)</SelectItem><SelectItem value="viuvo(a)">Viúvo(a)</SelectItem><SelectItem value="divorciado(a)">Divorciado(a)</SelectItem></SelectContent></Select></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-senha" className="text-right text-foreground font-medium">Nova Senha</Label><Input id="edit-senha" name="senha" type="password" placeholder="********" className={`col-span-3 ${inputStyles}`} /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-cargo" className="text-right text-foreground font-medium">Cargo</Label><Select name="cargo" defaultValue={selectedUser.cargo}><SelectTrigger className={`col-span-3 ${selectTriggerStyles}`}><SelectValue placeholder="Selecione um cargo" /></SelectTrigger><SelectContent><SelectItem value="administrador">Administrador</SelectItem><SelectItem value="coordenador">Coordenador</SelectItem><SelectItem value="coletor">Coletor</SelectItem></SelectContent></Select></div>
              </div>
              {error && <p className="text-destructive text-sm text-center px-6 pb-2">{error}</p>}
              <DialogFooter className="p-6 pt-0 bg-card">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="h-11 rounded-xl hover:bg-muted text-muted-foreground">Cancelar</Button>
                <Button type="submit" className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="rounded-2xl bg-card border-border">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">Esta ação irá desativar a conta de <span className="font-semibold text-foreground">{selectedUser?.nome}</span>. O usuário não poderá mais acessar o sistema.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl border-border bg-background text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDeactivate} className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20">Sim, desativar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isReactivateAlertOpen} onOpenChange={setIsReactivateAlertOpen}>
        <AlertDialogContent className="rounded-2xl bg-card border-border">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Confirmar Reativação</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">Tem certeza que deseja reativar a conta de <span className="font-semibold text-foreground">{selectedUser?.nome}</span>? O usuário voltará a ter acesso ao sistema.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl border-border bg-background text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmReactivate} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">Sim, reativar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    
      <AlertDialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <AlertDialogContent className="rounded-2xl bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">Usuário Criado com Sucesso!</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Um e-mail de verificação foi enviado para a conta do novo usuário. 
              Ele precisará clicar no link enviado para ativar a conta e poder fazer login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsSuccessModalOpen(false)} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}