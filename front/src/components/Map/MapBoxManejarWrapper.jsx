"use client";

import { useApiUrl } from "@/app/context/ApiContext";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, MapPin, Pencil, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MapBoxManejarWrapper({ token }) {
  const apiUrl = useApiUrl();
  const [lixo, setLixo] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para Edição
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para Deleção
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Função para buscar dados
  const fetchData = useCallback(async () => {
    if (!token || !apiUrl) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/statusSensor`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLixo(data);
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Lógica de Atualização (PUT) ---
  const handleOpenEdit = (item) => {
    setItemToEdit(item);
    setNewStatus(item.Stats);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!itemToEdit || !newStatus) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`${apiUrl}/lixo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: itemToEdit.ID,
          statusLixo: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Falha ao atualizar");

      await fetchData();
      setIsEditOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Lógica de Deleção (DELETE) ---
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`${apiUrl}/lixo`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: itemToDelete.ID,
        }),
      });

      if (!response.ok) throw new Error("Falha ao deletar");

      await fetchData();
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao deletar ponto.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* 
         ALTERAÇÃO: 
         1. Usei w-full para preencher o espaço disponível do Modal pai.
         2. O CardHeader e CardContent ajustam-se automaticamente.
      */}
      <Card className="rounded-xl border border-border shadow-sm flex flex-col h-full w-full bg-card">
        <CardHeader className="border-b border-border p-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                Sensores de Lixo
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Gerencie os pontos de coleta monitorados.
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            disabled={loading}
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
          </Button>
        </CardHeader>

        {/* 
           ALTERAÇÃO: 
           Adicionei 'overflow-x-auto' aqui. 
           Se o Modal pai for pequeno, aparecerá uma barra de rolagem horizontal 
           para você conseguir ver os botões de ação sem cortar.
        */}
        <CardContent className="p-0 flex-1 overflow-auto overflow-x-auto max-h-[600px]">
          {/* 
             ALTERAÇÃO: 
             Adicionei 'min-w-[600px]' na Table.
             Isso garante que a tabela sempre tenha largura suficiente para mostrar tudo,
             forçando o scroll se necessário.
          */}
          <Table className="min-w-[600px]">
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[60px] pl-6 text-xs font-semibold uppercase tracking-wide">
                  ID
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Endereço
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-center">
                  Status
                </TableHead>
                <TableHead className="pr-6 text-xs font-semibold uppercase tracking-wide text-right">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {lixo && lixo.length > 0 ? (
                lixo.map((item) => (
                  <TableRow
                    key={item.ID}
                    className="border-border hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="pl-6 font-mono text-xs font-medium text-foreground">
                      #{item.ID}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {/* 
                           Manti o limite maior de texto. 
                           Se o espaço for pequeno, o texto quebra ou trunca, 
                           mas o scroll horizontal garante que não quebre o layout.
                        */}
                        <span className="truncate max-w-[300px]" title={item.Endereco}>
                          {item.Endereco ?? "Localização não informada"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "shadow-none border font-medium px-2 py-0.5 whitespace-nowrap",
                          item.Stats === "Cheia"
                            ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
                            : item.Stats === "Quase Cheia"
                            ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                        )}
                      >
                        {item.Stats}
                      </Badge>
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDelete(item)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan="4"
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    {loading ? "Carregando..." : "Nenhum sensor encontrado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- Modal de Edição (Status) --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Atualizar Sensor #{itemToEdit?.ID}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Altere o status atual do ponto de coleta.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-foreground">Status do Lixo</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-muted/50 border-input text-foreground">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vazia">Vazia (Verde)</SelectItem>
                  <SelectItem value="Quase Cheia">Quase Cheia (Amarelo)</SelectItem>
                  <SelectItem value="Cheia">Cheia (Vermelho)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditOpen(false)}
              className="hover:bg-muted text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Modal de Confirmação de Exclusão --- */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir Ponto de Coleta?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Você tem certeza que deseja remover o sensor{" "}
              <span className="font-bold text-foreground">#{itemToDelete?.ID}</span>?
              <br />
              Local: {itemToDelete?.Endereco}
              <br />
              <span className="text-red-500 text-xs mt-2 block">
                Essa ação não pode ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background text-foreground border-border hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}