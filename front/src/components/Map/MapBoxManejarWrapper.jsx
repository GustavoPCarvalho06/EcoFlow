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
import { Input } from "@/components/ui/input"; 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, MapPin, Pencil, Loader2, RefreshCw, Search } from "lucide-react"; 
import { cn } from "@/lib/utils";

export default function MapBoxManejarWrapper({ token, onUpdate }) {
  const apiUrl = useApiUrl();
  const [lixo, setLixo] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Estados de Edição
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados de Exclusão
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


  const filteredLixo = lixo.filter((item) => {
    const endereco = item.Endereco || item.endereco || "";
    const busca = searchTerm.toLowerCase();
    return endereco.toLowerCase().includes(busca);
  });

  // --- Handlers de Edição ---
  const handleOpenEdit = (item) => {
    setItemToEdit(item);
    setNewStatus(item.Stats || item.statusLixo || "Vazia");
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!itemToEdit || !newStatus) return;
    setIsUpdating(true);

    const idToUpdate = itemToEdit.ID || itemToEdit.id || itemToEdit.id_Sensor;

    if (!idToUpdate) {
        alert("Erro: ID do item não encontrado.");
        setIsUpdating(false);
        return;
    }

    try {
      const response = await fetch(`${apiUrl}/lixo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: idToUpdate,
          statusLixo: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Falha ao atualizar");

      await fetchData();
      setIsEditOpen(false);
      
      // Atualiza o mapa principal
      if (onUpdate) onUpdate();

    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Handlers de Exclusão ---
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    const idToDelete = itemToDelete.ID || itemToDelete.id || itemToDelete.id_Sensor;

    if (!idToDelete) {
        alert("Erro crítico: ID não encontrado.");
        setIsDeleting(false);
        return;
    }

    try {
      const response = await fetch(`${apiUrl}/lixo`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: idToDelete,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("Erro backend:", errData);
        throw new Error(errData.mensagem || "Falha ao deletar");
      }

      await fetchData();
      setIsDeleteOpen(false);

      // Atualiza o mapa principal
      if (onUpdate) onUpdate();

    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="rounded-xl border border-border shadow-sm flex flex-col h-full w-full bg-card">

        <CardHeader className="border-b border-border p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                Sensores de Lixo
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Gerencie os pontos de coleta.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar endereço..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={fetchData}
              disabled={loading}
              className="text-muted-foreground hover:text-primary shrink-0"
            >
              <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-auto max-h-[600px]">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="border-border hover:bg-transparent">
               
                <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wide">
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
              {filteredLixo && filteredLixo.length > 0 ? (
                filteredLixo.map((item, index) => {
                  const displayId = item.ID || item.id || item.id_Sensor || index;
                  const displayEndereco = item.Endereco || item.endereco || "Localização não informada";
                  const displayStatus = item.Stats || item.statusLixo || "Desconhecido";

                  return (
                    <TableRow
                      key={displayId}
                      className="border-border hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="pl-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[450px]" title={displayEndereco}>
                            {displayEndereco}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            "shadow-none border font-medium px-2 py-0.5 whitespace-nowrap",
                            displayStatus === "Cheia"
                              ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
                              : displayStatus === "Quase Cheia"
                              ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                          )}
                        >
                          {displayStatus}
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
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan="3" 
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Atualizar Sensor</DialogTitle>
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
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="hover:bg-muted text-muted-foreground">
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir Ponto de Coleta?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Você tem certeza que deseja remover este sensor?
              <br />
              Local: <span className="font-bold text-foreground">
                {itemToDelete?.Endereco || itemToDelete?.endereco || "Local desconhecido"}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background text-foreground border-border hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Excluindo..." : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}