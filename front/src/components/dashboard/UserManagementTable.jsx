"use client";

import { useState, useEffect, useCallback } from "react";
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

const formatCPF = (cpf) => {
  if (!cpf) return "";
  const cleanCpf = cpf.replace(/\D/g, '');
  if (cleanCpf.length !== 11) return cpf;
  return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export function UserManagementTable() {
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

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search: searchQuery,
        statusConta: statusFilter,
        cargo: cargoFilter,
      });
      const response = await fetch(`http://localhost:3001/user/paginated?${params.toString()}`);
      if (!response.ok) throw new Error('Falha ao buscar dados dos usuários');
      
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotalUsers(data.total);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter, cargoFilter]);

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
    const rawValue = e.target.value.replace(/\D/g, '');
    let formattedValue = rawValue;
    if (rawValue.length > 9) {
      formattedValue = rawValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (rawValue.length > 6) {
      formattedValue = rawValue.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (rawValue.length > 3) {
      formattedValue = rawValue.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCreateCpf(formattedValue.slice(0, 14));
  };
  
  const handleApiCall = async (endpoint, method, body, successCallback) => {
    try {
      setError("");
      const response = await fetch(`http://localhost:3001/user/${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensagem || 'Ocorreu um erro');
      }
      successCallback();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    data.cpf = data.cpf.replace(/\D/g, ''); 
    await handleApiCall('post', 'POST', data, () => {
      setIsCreateModalOpen(false);
      setCreateCpf("");
      forceRefresh();
    });
  };
  
  const handleUpdateUser = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
        nome: formData.get('nome'),
        cpf: selectedUser.cpf,
        email: formData.get('email'), // <<<--- ADICIONADO AQUI
        cargo: formData.get('cargo'),
        senha: formData.get('senha')
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Visualize, filtre, crie e gerencie todos os usuários do sistema.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1 cursor-pointer" onClick={() => { setError(""); setCreateCpf(""); setIsCreateModalOpen(true); }}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Criar Novo Usuário</span>
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar por nome ou CPF..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select value={cargoFilter} onValueChange={(value) => { setCargoFilter(value); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por Cargo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Cargos</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="coordenador">Coordenador</SelectItem>
                <SelectItem value="coletor">Coletor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="desligado">Desligado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">CPF</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24">Carregando...</TableCell></TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatCPF(user.cpf)}</TableCell>
                    <TableCell>{user.cargo ? user.cargo.charAt(0).toUpperCase() + user.cargo.slice(1) : '-'}</TableCell>
                    <TableCell>
                      <Badge className={user.statusConta === 'ativo' ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}>
                        {user.statusConta === 'ativo' ? 'Ativo' : 'Desligado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => handleOpenEditModal(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {user.statusConta === 'ativo' ? (
                        <Button variant="ghost" size="icon" className="text-red-500 cursor-pointer" onClick={() => handleOpenDeleteAlert(user)}>
                          <PowerOff className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="text-blue-500 cursor-pointer" onClick={() => handleOpenReactivateAlert(user)}>
                          <Power className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center h-24">Nenhum usuário encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Total de <span className="font-semibold">{totalUsers}</span> usuário(s).
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="rows-per-page">Linhas por página:</Label>
              <Select value={limit.toString()} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
                <SelectTrigger id="rows-per-page" className="w-[70px]"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm font-medium">Página {page} de {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || isLoading}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || isLoading}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* --- MODAIS E ALERTAS --- */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>Preencha os dados abaixo para criar uma nova conta.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">Nome</Label>
                <Input id="nome" name="nome" required className="col-span-3" maxLength="50" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cpf" className="text-right">CPF</Label>
                <Input id="cpf" name="cpf" required className="col-span-3" value={createCpf} onChange={handleCpfInputChange} maxLength="14" placeholder="000.000.000-00"/>
              </div>
               {/* ======================================================= */}
               {/*  NOVO CAMPO DE EMAIL ADICIONADO AQUI                   */}
               {/* ======================================================= */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" required className="col-span-3" placeholder="exemplo@email.com"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="senha" className="text-right">Senha</Label>
                <Input id="senha" name="senha" type="password" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cargo" className="text-right">Cargo</Label>
                <Select name="cargo" required>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione um cargo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="coletor">Coletor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Altere os dados do usuário. Deixe a senha em branco para não alterá-la.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-nome" className="text-right">Nome</Label>
                <Input id="edit-nome" name="nome" defaultValue={selectedUser?.nome} className="col-span-3" maxLength="50" />
              </div>
              {/* ======================================================= */}
              {/*  NOVO CAMPO DE EMAIL ADICIONADO AQUI                   */}
              {/* ======================================================= */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">Email</Label>
                <Input id="edit-email" name="email" type="email" defaultValue={selectedUser?.email} required className="col-span-3" placeholder="exemplo@email.com"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-senha" className="text-right">Nova Senha</Label>
                <Input id="edit-senha" name="senha" type="password" placeholder="********" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cargo" className="text-right">Cargo</Label>
                <Select name="cargo" defaultValue={selectedUser?.cargo}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione um cargo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="coletor">Coletor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá desativar a conta de <span className="font-semibold">{selectedUser?.nome}</span>. 
              O usuário não poderá mais acessar o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeactivate} className="bg-red-600 hover:bg-red-700">Sim, desativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isReactivateAlertOpen} onOpenChange={setIsReactivateAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar Reativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja reativar a conta de <span className="font-semibold">{selectedUser?.nome}</span>? 
              O usuário voltará a ter acesso ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReactivate} className="bg-blue-600 hover:bg-blue-700">Sim, reativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}