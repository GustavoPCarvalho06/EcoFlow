"use client";

import { useState } from "react"; // Importa o useState para controlar o estado
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";

// Dados estáticos (mock) para preencher a tabela
const mockUsers = [
  { id: 1, nome: 'João Martins', cpf: '123.456.789-00', cargo: 'administrador', statusConta: 'ativo' },
  { id: 2, nome: 'Maria Santos', cpf: '987.654.321-00', cargo: 'coordenador', statusConta: 'ativo' },
  { id: 3, nome: 'Carlos Nunes', cpf: '555.666.777-88', cargo: 'coletor', statusConta: 'ativo' },
  { id: 4, nome: 'Ana Silva', cpf: '222.333.444-55', cargo: 'coletor', statusConta: 'desligado' },
  { id: 5, nome: 'Pedro Costa', cpf: '111.222.333-44', cargo: 'coletor', statusConta: 'ativo' },
    { id: 6, nome: 'João Martines2', cpf: '123.456.789-00', cargo: 'administrador', statusConta: 'ativo' },
  { id: 7, nome: 'Maria Santos3', cpf: '987.654.321-00', cargo: 'coordenador', statusConta: 'ativo' },
  { id: 8, nome: 'Carlos Nunes4', cpf: '555.666.777-88', cargo: 'coletor', statusConta: 'ativo' },
  { id: 9, nome: 'Ana Silva5', cpf: '222.333.444-55', cargo: 'coletor', statusConta: 'desligado' },
  { id: 10, nome: 'Pedro Costa6', cpf: '111.222.333-44', cargo: 'coletor', statusConta: 'ativo' },
];

export function UserManagementTable() {
  // --- Estados para controlar os modais e a pesquisa ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // --- Funções para manipular os modais ---
  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteAlert = (user) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };

  // --- Funções de "ação" (por enquanto, só exibem no console) ---
  const handleCreateUser = (event) => {
    event.preventDefault();
    console.log("Criando novo usuário...");
    setIsCreateModalOpen(false); // Fecha o modal após a ação
  };
  
  const handleUpdateUser = (event) => {
    event.preventDefault();
    console.log("Atualizando usuário:", selectedUser.id);
    setIsEditModalOpen(false);
  };

  const handleDeactivateUser = () => {
    console.log("Desativando usuário:", selectedUser.id);
    // Aqui viria a lógica para mudar o status de 'ativo' para 'desligado'
    setIsDeleteAlertOpen(false);
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
            <Button size="sm" className="gap-1" onClick={() => setIsCreateModalOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Criar Novo Usuário</span>
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar por nome ou CPF..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
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
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nome}</TableCell>
                  <TableCell className="hidden md:table-cell">{user.cpf}</TableCell>
                  <TableCell>{user.cargo.charAt(0).toUpperCase() + user.cargo.slice(1)}</TableCell>
                  <TableCell>
                    <Badge className={user.statusConta === 'ativo' ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}>
                      {user.statusConta === 'ativo' ? 'Ativo' : 'Desligado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleOpenDeleteAlert(user)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- MODAL DE CRIAR USUÁRIO --- */}
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
                <Input id="nome" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cpf" className="text-right">CPF</Label>
                <Input id="cpf" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="senha" className="text-right">Senha</Label>
                <Input id="senha" type="password" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cargo" className="text-right">Cargo</Label>
                <Select required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="coletor">Coletor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* --- MODAL DE EDITAR USUÁRIO --- */}
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
                <Input id="edit-nome" defaultValue={selectedUser?.nome} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cpf" className="text-right">CPF</Label>
                <Input id="edit-cpf" defaultValue={selectedUser?.cpf} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-senha" className="text-right">Nova Senha</Label>
                <Input id="edit-senha" type="password" placeholder="********" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cargo" className="text-right">Cargo</Label>
                <Select defaultValue={selectedUser?.cargo}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="coletor">Coletor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- ALERTA DE CONFIRMAÇÃO PARA DESATIVAR --- */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá desativar a conta de <span className="font-semibold">{selectedUser?.nome}</span>. 
              O usuário não poderá mais acessar o sistema. Esta ação pode ser revertida depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateUser} className="bg-red-600 hover:bg-red-700">
              Sim, desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}